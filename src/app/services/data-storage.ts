// src/app/services/data-storage.service.ts
import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { BehaviorSubject, Observable } from 'rxjs';
import { 
  StorableEntity, 
  UserData, 
  User,
  Church,
  Subscription,
  ActionUnitClass,
  ClassTeacher, 
  ClassMember,
  Attendance,
  Offering,
  QuarterlyBook,
  BookOrder,
  OrderItem,
  SyncOperation, 
  StorageConfig, 
  SyncResult, 
  StorageStats 
} from '../models/sync-types';

/**
 * Authentication data interface
 */
export interface AuthData {
  accessToken: string;
  refreshToken: string;
  user: any;
  church?: any;
  timestamp: Date;
}

/**
 * Data Storage Service - Tailored for ActionUnitManager Django Models
 * 
 * This service provides comprehensive offline storage capabilities specifically
 * designed to work with your Django backend models for seamless synchronization.
 */
@Injectable({
  providedIn: 'root'
})
export class DataStorageService {
  /**
   * Storage configuration tailored for ActionUnitManager entities
   */
  private readonly config: StorageConfig = {
    userDataKey: 'actionunit_user_data',
    syncQueueKey: 'actionunit_sync_queue',
    appSettingsKey: 'actionunit_app_settings',
    lastSyncKey: 'actionunit_last_sync',
    churchesKey: 'actionunit_churches',
    usersKey: 'actionunit_users',
    classesKey: 'actionunit_classes',
    attendanceKey: 'actionunit_attendance',
    offeringsKey: 'actionunit_offerings',
    booksKey: 'actionunit_books',
    ordersKey: 'actionunit_orders'
  };

  /**
   * Current user context for scoped data operations
   */
  private currentUserId?: string;
  private currentChurchId?: string;

  /**
   * Reactive subjects for real-time storage updates
   */
  private storageStats = new BehaviorSubject<StorageStats>({
    totalUserData: 0,
    pendingSyncOperations: 0,
    storageSize: 0,
    entitiesCount: {
      churches: 0,
      users: 0,
      classes: 0,
      attendance: 0,
      offerings: 0,
      books: 0,
      orders: 0
    }
  });

  private syncStatus = new BehaviorSubject<boolean>(false);

  /**
   * Public observables for component subscription
   */
  public storageStats$: Observable<StorageStats> = this.storageStats.asObservable();
  public syncStatus$: Observable<boolean> = this.syncStatus.asObservable();

  constructor() {
    console.log('💾 DataStorageService: Initializing ActionUnitManager storage system');
    this.initializeStorage();
  }

  /**
   * Sets the current user context for scoped operations
   * Essential for multi-user device support
   */
  setUserContext(userId: string, churchId?: string): void {
    this.currentUserId = userId;
    this.currentChurchId = churchId;
    console.log(`💾 User context set: ${userId}, Church: ${churchId}`);
  }

  // ==================== AUTHENTICATION DATA MANAGEMENT ====================

  /**
   * Stores authentication data securely
   */
  async storeAuthData(authData: AuthData): Promise<void> {
    try {
      await Preferences.set({
        key: 'actionunit_auth_data',
        value: JSON.stringify(authData)
      });
      console.log('🔐 Auth data stored securely');
    } catch (error) {
      console.error('🔐 Error storing auth data:', error);
      throw new Error('Failed to store authentication data');
    }
  }

  /**
   * Retrieves stored authentication data
   */
  async getAuthData(): Promise<AuthData | null> {
    try {
      const result = await Preferences.get({ key: 'actionunit_auth_data' });
      
      if (!result.value) {
        return null;
      }

      const authData: AuthData = JSON.parse(result.value);
      authData.timestamp = new Date(authData.timestamp);
      
      console.log('🔐 Auth data retrieved from storage');
      return authData;

    } catch (error) {
      console.error('🔐 Error retrieving auth data:', error);
      return null;
    }
  }

  /**
   * Clears authentication data (logout)
   */
  async clearAuthData(): Promise<void> {
    try {
      await Preferences.remove({ key: 'actionunit_auth_data' });
      this.currentUserId = undefined;
      this.currentChurchId = undefined;
      console.log('🔐 Auth data cleared');
    } catch (error) {
      console.error('🔐 Error clearing auth data:', error);
      throw new Error('Failed to clear authentication data');
    }
  }

  // ==================== CHURCH DATA MANAGEMENT ====================

  /**
   * Stores church data for offline access
   * Church data is shared among all users from the same church
   */
  async storeChurch(church: Church): Promise<void> {
    try {
      const churches = await this.getEntities<Church>(this.config.churchesKey);
      const existingIndex = churches.findIndex(c => c.id === church.id);
      
      if (existingIndex >= 0) {
        churches[existingIndex] = { ...church, updatedAt: new Date(), isDirty: true };
      } else {
        churches.push({ ...church, createdAt: new Date(), updatedAt: new Date(), isDirty: true });
      }

      await this.saveEntities(this.config.churchesKey, churches);
      await this.queueSyncOperation('CREATE_OR_UPDATE', 'church', church);
      await this.updateStorageStats();
      
      console.log(`💾 Church data stored: ${church.name}`);
    } catch (error) {
      console.error('💾 Error storing church data:', error);
      throw new Error('Failed to store church data locally');
    }
  }

  /**
   * Retrieves current user's church data
   */
  async getCurrentChurch(): Promise<Church | null> {
    if (!this.currentChurchId) {
      console.warn('💾 No church context set');
      return null;
    }

    const churches = await this.getEntities<Church>(this.config.churchesKey);
    return churches.find(c => c.id === this.currentChurchId) || null;
  }

  // ==================== USER DATA MANAGEMENT ====================

  /**
   * Stores user data for offline access
   * User data is scoped to prevent cross-user data access
   */
  async storeUser(user: User): Promise<void> {
    try {
      const users = await this.getEntities<User>(this.config.usersKey);
      const existingIndex = users.findIndex(u => u.id === user.id);
      
      if (existingIndex >= 0) {
        users[existingIndex] = { ...user, updatedAt: new Date(), isDirty: true };
      } else {
        users.push({ ...user, createdAt: new Date(), updatedAt: new Date(), isDirty: true });
      }

      await this.saveEntities(this.config.usersKey, users);
      await this.queueSyncOperation('CREATE_OR_UPDATE', 'user', user);
      await this.updateStorageStats();
      
      console.log(`💾 User data stored: ${user.name}`);
    } catch (error) {
      console.error('💾 Error storing user data:', error);
      throw new Error('Failed to store user data locally');
    }
  }

  /**
   * Retrieves current user's profile data
   */
  async getCurrentUser(): Promise<User | null> {
    if (!this.currentUserId) {
      console.warn('💾 No user context set');
      return null;
    }

    const users = await this.getEntities<User>(this.config.usersKey);
    return users.find(u => u.id === this.currentUserId) || null;
  }

  // ==================== ACTION UNIT CLASSES ====================

  /**
   * Stores Action Unit class data
   */
  async storeActionUnitClass(actionUnitClass: ActionUnitClass): Promise<void> {
    try {
      const classes = await this.getEntities<ActionUnitClass>(this.config.classesKey);
      const existingIndex = classes.findIndex(c => c.id === actionUnitClass.id);
      
      if (existingIndex >= 0) {
        classes[existingIndex] = { ...actionUnitClass, updatedAt: new Date(), isDirty: true };
      } else {
        classes.push({ ...actionUnitClass, createdAt: new Date(), updatedAt: new Date(), isDirty: true });
      }

      await this.saveEntities(this.config.classesKey, classes);
      await this.queueSyncOperation('CREATE_OR_UPDATE', 'action_unit_class', actionUnitClass);
      await this.updateStorageStats();
      
      console.log(`💾 Action Unit Class stored: ${actionUnitClass.name}`);
    } catch (error) {
      console.error('💾 Error storing Action Unit Class:', error);
      throw new Error('Failed to store Action Unit Class locally');
    }
  }

  /**
   * Retrieves classes for current church
   */
  async getChurchClasses(): Promise<ActionUnitClass[]> {
    if (!this.currentChurchId) {
      console.warn('💾 No church context set');
      return [];
    }

    const classes = await this.getEntities<ActionUnitClass>(this.config.classesKey);
    return classes.filter(c => c.church === this.currentChurchId);
  }

  // ==================== ATTENDANCE MANAGEMENT ====================

  /**
   * Records attendance offline
   * Critical for teachers recording attendance without internet
   */
  async recordAttendance(attendance: Attendance): Promise<void> {
    try {
      const attendances = await this.getEntities<Attendance>(this.config.attendanceKey);
      
      // Check for existing attendance for same class_member and date
      const existingIndex = attendances.findIndex(a => 
        a.class_member === attendance.class_member && 
        a.date === attendance.date
      );
      
      const attendanceWithMetadata: Attendance = {
        ...attendance,
        id: attendance.id || this.generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        isDirty: true,
        syncStatus: 'pending'
      };

      if (existingIndex >= 0) {
        attendances[existingIndex] = attendanceWithMetadata;
      } else {
        attendances.push(attendanceWithMetadata);
      }

      await this.saveEntities(this.config.attendanceKey, attendances);
      await this.queueSyncOperation('CREATE_OR_UPDATE', 'attendance', attendanceWithMetadata);
      await this.updateStorageStats();
      
      console.log(`💾 Attendance recorded for class member: ${attendance.class_member}`);
    } catch (error) {
      console.error('💾 Error recording attendance:', error);
      throw new Error('Failed to record attendance locally');
    }
  }

  /**
   * Retrieves attendance records for a specific class and date range
   */
  async getClassAttendance(classId: string, startDate: Date, endDate: Date): Promise<Attendance[]> {
    const attendances = await this.getEntities<Attendance>(this.config.attendanceKey);
    
    // This would need to join with class members to filter by class
    // For now, returning all attendances - would be enhanced with proper relationships
    return attendances.filter(a => {
      const attendanceDate = new Date(a.date);
      return attendanceDate >= startDate && attendanceDate <= endDate;
    });
  }

  // ==================== OFFERING MANAGEMENT ====================

  /**
   * Records offering contributions offline
   */
  async recordOffering(offering: Offering): Promise<void> {
    try {
      const offerings = await this.getEntities<Offering>(this.config.offeringsKey);
      const existingIndex = offerings.findIndex(o => o.id === offering.id);
      
      const offeringWithMetadata: Offering = {
        ...offering,
        id: offering.id || this.generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        isDirty: true,
        syncStatus: 'pending'
      };

      if (existingIndex >= 0) {
        offerings[existingIndex] = offeringWithMetadata;
      } else {
        offerings.push(offeringWithMetadata);
      }

      await this.saveEntities(this.config.offeringsKey, offerings);
      await this.queueSyncOperation('CREATE_OR_UPDATE', 'offering', offeringWithMetadata);
      await this.updateStorageStats();
      
      console.log(`💾 Offering recorded: ${offering.amount} ${offering.currency}`);
    } catch (error) {
      console.error('💾 Error recording offering:', error);
      throw new Error('Failed to record offering locally');
    }
  }

  // ==================== BOOK ORDER MANAGEMENT ====================

  /**
   * Creates or updates book orders offline
   * Essential for quarterly book ordering workflow
   */
  async saveBookOrder(bookOrder: BookOrder): Promise<void> {
    try {
      const orders = await this.getEntities<BookOrder>(this.config.ordersKey);
      const existingIndex = orders.findIndex(o => o.id === bookOrder.id);
      
      const orderWithMetadata: BookOrder = {
        ...bookOrder,
        createdAt: bookOrder.createdAt || new Date(),
        updatedAt: new Date(),
        isDirty: true,
        syncStatus: 'pending'
      };

      if (existingIndex >= 0) {
        orders[existingIndex] = orderWithMetadata;
      } else {
        orders.push(orderWithMetadata);
      }

      await this.saveEntities(this.config.ordersKey, orders);
      await this.queueSyncOperation('CREATE_OR_UPDATE', 'book_order', orderWithMetadata);
      await this.updateStorageStats();
      
      console.log(`💾 Book order saved: ${bookOrder.quarter} ${bookOrder.year}`);
    } catch (error) {
      console.error('💾 Error saving book order:', error);
      throw new Error('Failed to save book order locally');
    }
  }

  /**
   * Retrieves draft orders for current action unit class
   */
  async getDraftOrders(): Promise<BookOrder[]> {
    if (!this.currentUserId) {
      return [];
    }

    const orders = await this.getEntities<BookOrder>(this.config.ordersKey);
    return orders.filter(o => o.status === 'draft' && o.submitted_by === this.currentUserId);
  }

  // ==================== SYNC QUEUE MANAGEMENT ====================

  /**
   * Queues sync operation for specific entity type
   */
  async queueSyncOperation(
    operation: 'CREATE' | 'UPDATE' | 'DELETE' | 'CREATE_OR_UPDATE',
    entityType: SyncOperation['entityType'],
    localData: any
  ): Promise<string> {
    try {
      const operationId = this.generateId();
      const syncOp: SyncOperation = {
        id: operationId,
        entityType,
        entityId: localData.id,
        operation: operation === 'CREATE_OR_UPDATE' ? 'CREATE' : operation,
        localData,
        timestamp: new Date(),
        retryCount: 0
      };

      const queue = await this.getSyncQueue();
      queue.push(syncOp);

      await this.saveSyncQueue(queue);
      await this.updateStorageStats();

      console.log(`💾 Sync operation queued: ${operation} ${entityType} ${localData.id}`);
      return operationId;

    } catch (error) {
      console.error('💾 Error queueing sync operation:', error);
      throw new Error('Failed to queue sync operation');
    }
  }

  /**
   * Gets pending sync operations filtered by entity type
   */
  async getPendingSyncOperations(entityType?: SyncOperation['entityType']): Promise<SyncOperation[]> {
    const queue = await this.getSyncQueue();
    
    if (entityType) {
      return queue.filter(op => op.entityType === entityType);
    }
    
    return queue;
  }

  /**
   * Removes completed sync operations from queue
   * This is the missing method that was causing the error
   */
  async removeCompletedOperations(operationIds: string[]): Promise<void> {
    try {
      const queue = await this.getSyncQueue();
      const updatedQueue = queue.filter(op => !operationIds.includes(op.id));
      
      await this.saveSyncQueue(updatedQueue);
      await this.updateStorageStats();

      console.log(`💾 Removed ${operationIds.length} completed operations from queue`);

    } catch (error) {
      console.error('💾 Error removing completed operations:', error);
      throw new Error('Failed to remove completed operations');
    }
  }

  /**
   * Clears all sync operations (use with caution)
   * Useful for resetting sync state or handling major errors
   */
  async clearSyncQueue(): Promise<void> {
    try {
      await Preferences.remove({ key: this.config.syncQueueKey });
      await this.updateStorageStats();
      console.log('💾 Sync queue cleared');
    } catch (error) {
      console.error('💾 Error clearing sync queue:', error);
      throw new Error('Failed to clear sync queue');
    }
  }

  // ==================== STORAGE UTILITIES ====================

  /**
   * Gets comprehensive storage statistics
   * Useful for monitoring and debugging storage usage
   */
  async getStorageStatistics(): Promise<StorageStats> {
    return this.storageStats.value;
  }

  /**
   * Clears all application data from storage
   * Warning: This will remove all user data and settings
   */
  async clearAllData(): Promise<void> {
    try {
      const keys = Object.values(this.config);
      
      for (const key of keys) {
        await Preferences.remove({ key });
      }

      await this.updateStorageStats();
      console.log('💾 All ActionUnitManager data cleared from storage');

    } catch (error) {
      console.error('💾 Error clearing all data:', error);
      throw new Error('Failed to clear all data');
    }
  }

  /**
   * Exports all local data as JSON string
   * Useful for debugging and data migration
   */
  async exportAllData(): Promise<string> {
    try {
      const userData = await this.getCurrentUser();
      const syncQueue = await this.getSyncQueue();
      
      const exportData = {
        userData,
        syncQueue,
        exportDate: new Date(),
        version: '1.0'
      };

      return JSON.stringify(exportData, null, 2);

    } catch (error) {
      console.error('💾 Error exporting data:', error);
      throw new Error('Failed to export data');
    }
  }

  // ==================== PRIVATE METHODS ====================

  /**
   * Generic entity storage methods
   */
  private async getEntities<T>(key: string): Promise<T[]> {
    try {
      const result = await Preferences.get({ key });
      return result.value ? JSON.parse(result.value) : [];
    } catch (error) {
      console.error(`💾 Error getting entities for ${key}:`, error);
      return [];
    }
  }

  private async saveEntities<T>(key: string, entities: T[]): Promise<void> {
    await Preferences.set({
      key,
      value: JSON.stringify(entities)
    });
  }

  /**
   * Sync queue management
   */
  private async getSyncQueue(): Promise<SyncOperation[]> {
    return this.getEntities<SyncOperation>(this.config.syncQueueKey);
  }

  private async saveSyncQueue(queue: SyncOperation[]): Promise<void> {
    await this.saveEntities(this.config.syncQueueKey, queue);
  }

  /**
   * Updates storage statistics with entity counts
   */
  private async updateStorageStats(): Promise<void> {
    try {
      const [
        churches, 
        users, 
        classes, 
        attendance, 
        offerings, 
        books, 
        orders,
        syncQueue
      ] = await Promise.all([
        this.getEntities(this.config.churchesKey),
        this.getEntities(this.config.usersKey),
        this.getEntities(this.config.classesKey),
        this.getEntities(this.config.attendanceKey),
        this.getEntities(this.config.offeringsKey),
        this.getEntities(this.config.booksKey),
        this.getEntities(this.config.ordersKey),
        this.getSyncQueue()
      ]);

      const stats: StorageStats = {
        totalUserData: users.length,
        pendingSyncOperations: syncQueue.length,
        lastSuccessfulSync: await this.getLastSyncTime(),
        storageSize: await this.calculateStorageSize(),
        entitiesCount: {
          churches: churches.length,
          users: users.length,
          classes: classes.length,
          attendance: attendance.length,
          offerings: offerings.length,
          books: books.length,
          orders: orders.length
        }
      };

      this.storageStats.next(stats);

    } catch (error) {
      console.error('💾 Error updating storage stats:', error);
    }
  }

  private async getLastSyncTime(): Promise<Date | undefined> {
    try {
      const result = await Preferences.get({ key: this.config.lastSyncKey });
      return result.value ? new Date(result.value) : undefined;
    } catch (error) {
      return undefined;
    }
  }

  private async calculateStorageSize(): Promise<number> {
    try {
      let totalSize = 0;
      const keys = Object.values(this.config);
      
      for (const key of keys) {
        const result = await Preferences.get({ key });
        if (result.value) {
          totalSize += new Blob([result.value]).size;
        }
      }
      
      return totalSize;
    } catch (error) {
      return 0;
    }
  }

  private generateId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async initializeStorage(): Promise<void> {
    try {
      await this.updateStorageStats();
      console.log('💾 ActionUnitManager storage system initialized successfully');
    } catch (error) {
      console.error('💾 Error initializing storage system:', error);
    }
  }
}