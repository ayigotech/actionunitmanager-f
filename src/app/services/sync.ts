// src/app/services/sync.service.ts
import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, timer } from 'rxjs';
import { catchError, tap, timeout, retryWhen, delayWhen, take, switchMap } from 'rxjs/operators';
import { DataStorageService } from './data-storage';
import { NetworkService } from './network';
import { AuthService } from './auth'; // Add this import
import { 
  SyncOperation, 
  SyncResult,
  Church,
  User,
  Attendance,
  Offering,
  BookOrder,
  OrderItem,
  ActionUnitClass,
  ClassMember,
  ClassTeacher
} from '../models/sync-types';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private readonly apiConfig = {
    baseUrl: environment.apiUrl,
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 2000 // 2 seconds between retries
  };

  /**
   * Authentication state - Now using AuthService
   */
  private currentUser?: any;
  private currentChurch?: any;

  /**
   * Sync state management
   */
  private isSyncing = new BehaviorSubject<boolean>(false);
  private syncProgress = new BehaviorSubject<number>(0);
  private lastSyncResult = new BehaviorSubject<SyncResult | null>(null);
  private syncErrors = new BehaviorSubject<string[]>([]);

  /**
   * Public observables for components
   */
  public isSyncing$ = this.isSyncing.asObservable();
  public syncProgress$ = this.syncProgress.asObservable();
  public lastSyncResult$ = this.lastSyncResult.asObservable();
  public syncErrors$ = this.syncErrors.asObservable();

  constructor(
    private http: HttpClient,
    private dataStorage: DataStorageService,
    private networkService: NetworkService,
    private authService: AuthService // Inject AuthService
  ) {
    console.log('🔄 SyncService: Initializing with AuthService integration');
    this.initializeAutoSync();
    this.loadAuthState();
  }

  // ==================== AUTHENTICATION MANAGEMENT ====================

  /**
   * Sets authentication tokens and user context using AuthService
   */
  setAuthState(authResponse: any): void {
    this.authService.handleAuthentication(authResponse);
    this.currentUser = authResponse.user;
    this.currentChurch = authResponse.church;
    
    // Set user context in data storage
    this.dataStorage.setUserContext(
      authResponse.user.id, 
      authResponse.church?.id
    );

    console.log('🔐 Authentication state set via AuthService for user:', authResponse.user.name);
  }

  /**
   * Gets authorization headers with current token from AuthService
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    if (!token) {
      throw new Error('No authentication token available');
    }
    
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Wrapper for HTTP requests with automatic token refresh and retry logic
   */
  private authenticatedRequest<T>(request: Observable<T>): Observable<T> {
    return request.pipe(
      timeout(this.apiConfig.timeout),
      retryWhen(errors => errors.pipe(
        delayWhen((error, attempt) => {
          // Don't retry if it's an authentication error (will handle separately)
          if (error.status === 401) {
            return throwError(() => error);
          }
          // Exponential backoff for other errors
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
          return timer(delay);
        }),
        take(this.apiConfig.retryAttempts)
      )),
      catchError(error => {
        if (error.status === 401) {
          // Token expired - try to refresh
          return this.authService.refreshToken().pipe(
            switchMap(() => {
              // Retry the original request with new token
              return request;
            }),
            catchError(refreshError => {
              console.error('🔐 Token refresh failed:', refreshError);
              this.authService.logout();
              return throwError(() => new Error('Authentication failed. Please login again.'));
            })
          );
        }
        return throwError(() => error);
      })
    );
  }

  // ==================== MAIN SYNC OPERATIONS ====================

  /**
   * Main synchronization method - processes all pending operations
   */
  async syncAllData(): Promise<SyncResult> {
    if (this.isSyncing.value) {
      console.log('🔄 Sync already in progress');
      const lastResult = this.lastSyncResult.value;
      if (lastResult) {
        return lastResult;
      }
      return { 
        success: false, 
        syncedItems: 0, 
        failedItems: 0, 
        errors: ['Sync already in progress'], 
        timestamp: new Date() 
      };
    }

    const isOnline = await this.networkService.isOnline();
    if (!isOnline) {
      console.log('🔄 Skipping sync - device offline');
      return { 
        success: false, 
        syncedItems: 0, 
        failedItems: 0, 
        errors: ['Device offline'], 
        timestamp: new Date() 
      };
    }

    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      console.log('🔄 Skipping sync - user not authenticated');
      return { 
        success: false, 
        syncedItems: 0, 
        failedItems: 0, 
        errors: ['User not authenticated'], 
        timestamp: new Date() 
      };
    }

    this.isSyncing.next(true);
    this.syncProgress.next(0);
    this.syncErrors.next([]);

    try {
      console.log('🔄 Starting full data synchronization');
      
      const pendingOperations = await this.dataStorage.getPendingSyncOperations();
      const totalOperations = pendingOperations.length;
      
      if (totalOperations === 0) {
        console.log('🔄 No pending operations to sync');
        return this.completeSync({ 
          success: true, 
          syncedItems: 0, 
          failedItems: 0, 
          errors: [], 
          timestamp: new Date() 
        });
      }

      // Group operations by entity type for batch processing
      const operationsByType = this.groupOperationsByType(pendingOperations);
      
      let syncedCount = 0;
      let failedCount = 0;
      const errors: string[] = [];

      // Process operations in priority order
      const entityPriority: SyncOperation['entityType'][] = [
        'attendance',
        'offering', 
        'book_order',
        'class_member',
        'action_unit_class',
        'user',
        'church'
      ];

      for (const entityType of entityPriority) {
        const entityOperations = operationsByType[entityType] || [];
        
        for (const operation of entityOperations) {
          try {
            await this.processSingleOperation(operation);
            syncedCount++;
          } catch (error) {
            failedCount++;
            const errorMsg = `Failed to sync ${entityType} ${operation.entityId}: ${error}`;
            errors.push(errorMsg);
            console.error(`🔄 ${errorMsg}`);
            
            // Update operation retry count
            operation.retryCount++;
            if (operation.retryCount < 3) {
              // Re-queue for retry later
              await this.dataStorage.queueSyncOperation(
                operation.operation,
                operation.entityType,
                operation.localData
              );
            }
          }

          // Update progress
          const currentProgress = syncedCount + failedCount;
          const progress = (currentProgress / totalOperations) * 100;
          this.syncProgress.next(progress);
        }
      }

      const result: SyncResult = {
        success: failedCount === 0,
        syncedItems: syncedCount,
        failedItems: failedCount,
        errors,
        timestamp: new Date()
      };

      return this.completeSync(result);

    } catch (error) {
      console.error('🔄 Sync failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown sync error';
      return this.completeSync({
        success: false,
        syncedItems: 0,
        failedItems: 0,
        errors: [`Sync failed: ${errorMessage}`],
        timestamp: new Date()
      });
    }
  }

  /**
   * Processes a single sync operation based on entity type
   */
  private async processSingleOperation(operation: SyncOperation): Promise<void> {
    switch (operation.entityType) {
      case 'attendance':
        await this.syncAttendance(operation);
        break;
      case 'offering':
        await this.syncOffering(operation);
        break;
      case 'book_order':
        await this.syncBookOrder(operation);
        break;
      case 'class_member':
        await this.syncClassMember(operation);
        break;
      case 'action_unit_class':
        await this.syncActionUnitClass(operation);
        break;
      case 'user':
        await this.syncUser(operation);
        break;
      case 'church':
        await this.syncChurch(operation);
        break;
      default:
        console.warn(`🔄 Unknown entity type: ${operation.entityType}`);
        // Remove unknown operations to prevent infinite retry
        await this.dataStorage.removeCompletedOperations([operation.id]);
    }
  }

  // ==================== ENTITY-SPECIFIC SYNC METHODS ====================

  /**
   * Sync attendance records - High priority for offline functionality
   */
  private async syncAttendance(operation: SyncOperation): Promise<void> {
    const attendanceData = operation.localData as Attendance;
    
    const response = await this.authenticatedRequest(
      this.http.post<any>(
        `${this.apiConfig.baseUrl}/api/attendance/`,
        this.mapAttendanceToApi(attendanceData),
        { headers: this.getAuthHeaders() }
      )
    ).toPromise();

    // Update local data with server response (including generated ID if new)
    if (operation.operation === 'CREATE') {
      await this.dataStorage.recordAttendance({
        ...attendanceData,
        id: response.id,
        syncStatus: 'synced',
        lastSynced: new Date(),
        isDirty: false
      } as Attendance);
    }

    await this.dataStorage.removeCompletedOperations([operation.id]);
    console.log(`🔄 Attendance synced: ${attendanceData.class_member} - ${attendanceData.date}`);
  }

  /**
   * Sync offering contributions
   */
  private async syncOffering(operation: SyncOperation): Promise<void> {
    const offeringData = operation.localData as Offering;
    
    const response = await this.authenticatedRequest(
      this.http.post<any>(
        `${this.apiConfig.baseUrl}/api/offerings/`,
        this.mapOfferingToApi(offeringData),
        { headers: this.getAuthHeaders() }
      )
    ).toPromise();

    await this.dataStorage.removeCompletedOperations([operation.id]);
    console.log(`🔄 Offering synced: ${offeringData.amount} ${offeringData.currency}`);
  }

  /**
   * Sync book orders
   */
  private async syncBookOrder(operation: SyncOperation): Promise<void> {
    const orderData = operation.localData as BookOrder;
    
    const hasServerId = orderData.id && orderData.id.startsWith('server_');
    const endpoint = hasServerId 
      ? `/api/book-orders/${orderData.id.replace('server_', '')}/`
      : '/api/book-orders/';

    const method = hasServerId ? 'put' : 'post';
    
    const response = await this.authenticatedRequest(
      (this.http as any)[method](
        `${this.apiConfig.baseUrl}${endpoint}`,
        this.mapBookOrderToApi(orderData),
        { headers: this.getAuthHeaders() }
      )
    ).toPromise();

    await this.dataStorage.removeCompletedOperations([operation.id]);
    console.log(`🔄 Book order synced: ${orderData.quarter} ${orderData.year}`);
  }

  /**
   * Sync class members
   */
  private async syncClassMember(operation: SyncOperation): Promise<void> {
    const memberData = operation.localData as ClassMember;
    
    const hasServerId = memberData.id && memberData.id.startsWith('server_');
    const endpoint = hasServerId
      ? `/api/members-classes/${memberData.id.replace('server_', '')}/`
      : '/api/members-classes/';

    const method = hasServerId ? 'put' : 'post';
    
    await this.authenticatedRequest(
      (this.http as any)[method](
        `${this.apiConfig.baseUrl}${endpoint}`,
        this.mapClassMemberToApi(memberData),
        { headers: this.getAuthHeaders() }
      )
    ).toPromise();

    await this.dataStorage.removeCompletedOperations([operation.id]);
    console.log(`🔄 Class member synced: ${memberData.user}`);
  }

  /**
   * Sync Action Unit Classes - COMPLETED
   */
  private async syncActionUnitClass(operation: SyncOperation): Promise<void> {
    const classData = operation.localData as ActionUnitClass;
    
    const hasServerId = classData.id && classData.id.startsWith('server_');
    const endpoint = hasServerId
      ? `/api/classes/${classData.id.replace('server_', '')}/`
      : '/api/classes/';

    const method = hasServerId ? 'put' : 'post';
    
    await this.authenticatedRequest(
      (this.http as any)[method](
        `${this.apiConfig.baseUrl}${endpoint}`,
        this.mapActionUnitClassToApi(classData),
        { headers: this.getAuthHeaders() }
      )
    ).toPromise();

    await this.dataStorage.removeCompletedOperations([operation.id]);
    console.log(`🔄 Action Unit Class synced: ${classData.name}`);
  }

  /**
   * Sync Users (Members) - COMPLETED
   */
  private async syncUser(operation: SyncOperation): Promise<void> {
    const userData = operation.localData as User;
    
    const hasServerId = userData.id && userData.id.startsWith('server_');
    const endpoint = hasServerId
      ? `/api/members-classes/${userData.id.replace('server_', '')}/`
      : '/api/members-classes/';

    const method = hasServerId ? 'put' : 'post';
    
    await this.authenticatedRequest(
      (this.http as any)[method](
        `${this.apiConfig.baseUrl}${endpoint}`,
        this.mapUserToApi(userData),
        { headers: this.getAuthHeaders() }
      )
    ).toPromise();

    await this.dataStorage.removeCompletedOperations([operation.id]);
    console.log(`🔄 User synced: ${userData.name}`);
  }

  /**
   * Sync Church - COMPLETED
   */
  private async syncChurch(operation: SyncOperation): Promise<void> {
    const churchData = operation.localData as Church;
    
    // Churches are always updated (never created via sync)
    await this.authenticatedRequest(
      this.http.put<any>(
        `${this.apiConfig.baseUrl}/api/church/profile/`,
        this.mapChurchToApi(churchData),
        { headers: this.getAuthHeaders() }
      )
    ).toPromise();

    await this.dataStorage.removeCompletedOperations([operation.id]);
    console.log(`🔄 Church synced: ${churchData.name}`);
  }

  // ==================== API DATA MAPPING ====================

  /**
   * Maps local attendance data to API format
   */
  private mapAttendanceToApi(attendance: Attendance): any {
    return {
      class_member: attendance.class_member?.replace('local_', ''),
      date: attendance.date,
      is_present: attendance.is_present,
      absence_reason: attendance.absence_reason,
      marked_by: attendance.marked_by?.replace('local_', '')
    };
  }

  /**
   * Maps local offering data to API format
   */
  private mapOfferingToApi(offering: Offering): any {
    return {
      action_unit_class: offering.action_unit_class?.replace('local_', ''),
      amount: parseFloat(offering.amount.toString()),
      currency: offering.currency,
      date: offering.date,
      recorded_by: offering.recorded_by?.replace('local_', ''),
      notes: offering.notes
    };
  }

  /**
   * Maps local book order data to API format
   */
  private mapBookOrderToApi(order: BookOrder): any {
    return {
      action_unit_class: order.action_unit_class?.replace('local_', ''),
      quarter: order.quarter,
      year: order.year,
      status: order.status,
      submitted_by: order.submitted_by?.replace('local_', '')
    };
  }

  /**
   * Maps local class member data to API format
   */
  private mapClassMemberToApi(member: ClassMember): any {
    return {
      action_unit_class: member.action_unit_class?.replace('local_', ''),
      user: member.user?.replace('local_', ''),
      location: member.location,
      is_active: member.is_active
    };
  }

  /**
   * Maps local Action Unit Class data to API format
   */
  private mapActionUnitClassToApi(actionUnitClass: ActionUnitClass): any {
    return {
      name: actionUnitClass.name,
      church: actionUnitClass.church?.replace('local_', ''),
      meeting_time: actionUnitClass.meeting_time,
      location: actionUnitClass.location,
      is_active: actionUnitClass.is_active
    };
  }

  /**
   * Maps local User data to API format
   */
  private mapUserToApi(user: User): any {
    return {
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      church: user.church?.replace('local_', ''),
      is_officer: user.is_officer
    };
  }

  /**
   * Maps local Church data to API format
   */
  private mapChurchToApi(church: Church): any {
    return {
      name: church.name,
      email: church.email,
      phone: church.phone,
      address: church.address,
      district: church.district,
      country: church.country,
      denomination: church.denomination
    };
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Groups operations by entity type for batch processing
   */
  private groupOperationsByType(operations: SyncOperation[]): Record<string, SyncOperation[]> {
    return operations.reduce((groups, op) => {
      if (!groups[op.entityType]) {
        groups[op.entityType] = [];
      }
      groups[op.entityType].push(op);
      return groups;
    }, {} as Record<string, SyncOperation[]>);
  }

  /**
   * Completes sync process and updates state
   */
  private completeSync(result: SyncResult): SyncResult {
    this.isSyncing.next(false);
    this.syncProgress.next(100);
    this.lastSyncResult.next(result);
    
    if (result.errors.length > 0) {
      this.syncErrors.next(result.errors);
    }

    console.log(`🔄 Sync completed: ${result.syncedItems} synced, ${result.failedItems} failed`);
    return result;
  }

  /**
   * Initializes automatic sync when device comes online
   */
  private initializeAutoSync(): void {
    this.networkService.networkStatus$.subscribe(async status => {
      if (status.connected && this.authService.isAuthenticated()) {
        console.log('🔄 Device came online - triggering auto-sync');
        // Small delay to ensure network is stable
        setTimeout(() => {
          this.syncAllData();
        }, 2000);
      }
    });
  }

  /**
   * Loads authentication state from AuthService
   */
  private async loadAuthState(): Promise<void> {
    try {
      if (this.authService.isAuthenticated()) {
        this.currentUser = this.authService.getCurrentUser();
        console.log('🔐 Auth state loaded from AuthService for user:', this.currentUser?.name);
      } else {
        console.log('🔐 No auth state found - user not authenticated');
      }
    } catch (error) {
      console.log('🔐 Error loading auth state:', error);
    }
  }

  /**
   * Manual sync trigger for specific entity type
   */
  async syncEntityType(entityType: SyncOperation['entityType']): Promise<SyncResult> {
    const pendingOps = await this.dataStorage.getPendingSyncOperations(entityType);
    if (pendingOps.length === 0) {
      return { 
        success: true, 
        syncedItems: 0, 
        failedItems: 0, 
        errors: [], 
        timestamp: new Date() 
      };
    }
    
    // Process only the specified entity type
    this.isSyncing.next(true);
    let syncedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (const operation of pendingOps) {
      try {
        await this.processSingleOperation(operation);
        syncedCount++;
      } catch (error) {
        failedCount++;
        errors.push(`Failed to sync ${entityType}: ${error}`);
      }
    }

    const result: SyncResult = {
      success: failedCount === 0,
      syncedItems: syncedCount,
      failedItems: failedCount,
      errors,
      timestamp: new Date()
    };

    this.completeSync(result);
    return result;
  }

  /**
   * Force sync regardless of network status (will fail if offline)
   */
  async forceSync(): Promise<SyncResult> {
    return this.syncAllData();
  }

  /**
   * Get current sync status
   */
  getSyncStatus(): { isSyncing: boolean; progress: number; lastResult: SyncResult | null } {
    return {
      isSyncing: this.isSyncing.value,
      progress: this.syncProgress.value,
      lastResult: this.lastSyncResult.value
    };
  }
}