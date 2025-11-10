// src/app/services/network.service.ts
import { Injectable } from '@angular/core';
import { Network } from '@capacitor/network';
import { BehaviorSubject } from 'rxjs';
import { NetworkStatus, ConnectionStatus } from '../types/capacitor';

/**
 * Network Service - Monitors device network connectivity status
 * 
 * This service provides real-time network status monitoring for the
 * ActionUnitManager mobile app. It uses Capacitor's Network plugin
 * to detect connectivity changes and provides reactive updates.
 * 
 * Key Features:
 * - Real-time network status monitoring via BehaviorSubject
 * - Automatic reconnection detection
 * - Connection type classification (wifi, cellular, none)
 * - Offline/online state management for data synchronization
 * 
 * Dependencies:
 * - @capacitor/network: For native network status detection
 * - RxJS BehaviorSubject: For reactive state management
 * 
 * @example
 * // Subscribe to network changes
 * this.networkService.networkStatus$.subscribe(status => {
 *   if (status.connected) {
 *     this.syncOfflineData();
 *   } else {
 *     this.showOfflineIndicator();
 *   }
 * });
 * 
 * // Check current status
 * const isOnline = await this.networkService.isOnline();
 */
@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  /**
   * BehaviorSubject that holds the current network status
   * Initial value assumes online until proven otherwise for better UX
   */
  private networkStatus = new BehaviorSubject<NetworkStatus>({
    connected: true,  // Assume online initially
    connectionType: 'unknown'
  });

  /**
   * Public observable that components can subscribe to
   * Emits new network status whenever connectivity changes
   */
  public networkStatus$ = this.networkStatus.asObservable();

  constructor() {
    console.log('🔌 NetworkService: Initializing network monitoring');
    this.initializeNetworkListener();
  }

  /**
   * Converts string connection type to typed union
   * This ensures type safety while handling Capacitor's string returns
   */
  private parseConnectionType(connectionType: string): 'wifi' | 'cellular' | 'none' | 'unknown' {
    switch (connectionType) {
      case 'wifi':
      case 'cellular':
      case 'none':
      case 'unknown':
        return connectionType;
      default:
        console.warn(`🔌 Unknown connection type: ${connectionType}, defaulting to 'unknown'`);
        return 'unknown';
    }
  }

  /**
   * Initializes network status monitoring
   * 
   * Sets up the network status listener and gets the initial
   * network status from the device. This method is called
   * automatically when the service is constructed.
   * 
   * @private
   * @returns {Promise<void>}
   */
  private async initializeNetworkListener(): Promise<void> {
    try {
      // Get initial network status from device
      const status = await Network.getStatus();
      console.log('🔌 Initial network status:', status);
      
      // Update the BehaviorSubject with initial status (with type conversion)
      this.networkStatus.next({
        connected: status.connected,
        connectionType: this.parseConnectionType(status.connectionType)
      });

      // Set up listener for network status changes
      Network.addListener('networkStatusChange', (status: ConnectionStatus) => {
        console.log('🔌 Network status changed:', status);
        
        // Convert string connection type to typed union
        this.networkStatus.next({
          connected: status.connected,
          connectionType: this.parseConnectionType(status.connectionType)
        });
        
        // Handle specific actions based on network change
        this.handleNetworkChange(status);
      });

    } catch (error) {
      console.error('🔌 Error initializing network listener:', error);
      // Fallback to assuming online to prevent app blocking
      this.networkStatus.next({
        connected: true,
        connectionType: 'unknown'
      });
    }
  }

  /**
   * Handles specific actions when network status changes
   * 
   * This method can be extended to trigger specific application
   * behaviors when the device connects or disconnects from network.
   * 
   * @private
   * @param {ConnectionStatus} status - The new network status
   */
  private handleNetworkChange(status: ConnectionStatus): void {
    if (status.connected) {
      console.log('🌐 Device came online - can sync data with server');
      // TODO: Trigger data synchronization when back online
      // this.dataSyncService.syncPendingChanges();
    } else {
      console.log('📴 Device went offline - switching to local data');
      // TODO: Show offline notification to user
      // this.notificationService.showOfflineWarning();
    }
  }

  /**
   * Checks if the device is currently online
   * 
   * This method provides a convenient way to check connectivity
   * status without subscribing to the observable.
   * 
   * @returns {Promise<boolean>} - True if connected to network, false otherwise
   * 
   * @example
   * // Check before making API call
   * const isOnline = await this.networkService.isOnline();
   * if (isOnline) {
   *   await this.apiService.fetchData();
   * } else {
   *   this.showOfflineMessage();
   * }
   */
  async isOnline(): Promise<boolean> {
    try {
      const status = await Network.getStatus();
      return status.connected;
    } catch (error) {
      console.error('🔌 Error checking network status:', error);
      return false; // Assume offline on error for safety
    }
  }

  /**
   * Gets the current connection type
   * 
   * Useful for optimizing data usage based on connection type
   * (e.g., avoid large syncs on cellular data)
   * 
   * @returns {Promise<string>} - Connection type ('wifi', 'cellular', 'none', 'unknown')
   * 
   * @example
   * const connectionType = await this.networkService.getConnectionType();
   * if (connectionType === 'wifi') {
   *   // Safe to sync large files or backup data
   *   await this.backupService.performFullBackup();
   * } else if (connectionType === 'cellular') {
   *   // Sync only essential data to conserve user data
   *   await this.syncService.syncEssentialDataOnly();
   * }
   */
  async getConnectionType(): Promise<'wifi' | 'cellular' | 'none' | 'unknown'> {
    try {
      const status = await Network.getStatus();
      return this.parseConnectionType(status.connectionType);
    } catch (error) {
      console.error('🔌 Error getting connection type:', error);
      return 'unknown';
    }
  }

  /**
   * Manually refreshes the network status
   * 
   * Useful when you need the latest status on demand, such as
   * after user actions like clicking a "Retry" button.
   * 
   * @returns {Promise<NetworkStatus>} Current network status
   * 
   * @example
   * // User clicks "Check Connection" button
   * const status = await this.networkService.refreshStatus();
   * if (status.connected) {
   *   this.retryFailedApiCalls();
   *   this.hideOfflineIndicator();
   * }
   */
  async refreshStatus(): Promise<NetworkStatus> {
    try {
      const status = await Network.getStatus();
      const networkStatus: NetworkStatus = {
        connected: status.connected,
        connectionType: this.parseConnectionType(status.connectionType)
      };
      this.networkStatus.next(networkStatus);
      return networkStatus;
    } catch (error) {
      console.error('🔌 Error refreshing network status:', error);
      return this.networkStatus.value; // Return current value on error
    }
  }

  /**
   * Gets the current network status synchronously
   * 
   * Provides quick access to the current network status without
   * async overhead. Useful for immediate UI updates.
   * 
   * @returns {NetworkStatus} Current network status from BehaviorSubject
   * 
   * @example
   * // Update UI immediately
   * const status = this.networkService.getCurrentStatus();
   * this.isOffline = !status.connected;
   */
  getCurrentStatus(): NetworkStatus {
    return this.networkStatus.value;
  }
}