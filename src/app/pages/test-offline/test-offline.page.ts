
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { NetworkService } from '../../services/network';
import { DataStorageService } from '../../services/data-storage';
import { SyncService } from '../../services/sync';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-test-offline',
  templateUrl: './test-offline.page.html',
  styleUrls: ['./test-offline.page.scss'],
   standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class TestOfflinePage implements OnInit, OnDestroy {
  networkStatus: any;
  storageStats: any;
  lastSyncResult: any;
  testLog: string = '';
  
  private networkSubscription!: Subscription;
  private storageSubscription!: Subscription;
  private syncSubscription!: Subscription;

  constructor(
    private networkService: NetworkService,
    private dataStorage: DataStorageService,
    private syncService: SyncService
  ) {}

  async ngOnInit() {
    this.log('🧪 Test page initialized');
    
    // Subscribe to network status
    this.networkSubscription = this.networkService.networkStatus$.subscribe(status => {
      this.networkStatus = status;
      this.log(`🌐 Network status: ${status.connected ? 'ONLINE' : 'OFFLINE'} (${status.connectionType})`);
    });

    // Subscribe to storage stats
    this.storageSubscription = this.dataStorage.storageStats$.subscribe(stats => {
      this.storageStats = stats;
    });

    // Subscribe to sync results
    this.syncSubscription = this.syncService.lastSyncResult$.subscribe(result => {
      this.lastSyncResult = result;
      if (result) {
        this.log(`🔄 Sync completed: ${result.syncedItems} synced, ${result.failedItems} failed`);
      }
    });

    // Load initial data
    await this.loadInitialData();
  }

  ngOnDestroy() {
    if (this.networkSubscription) {
      this.networkSubscription.unsubscribe();
    }
    if (this.storageSubscription) {
      this.storageSubscription.unsubscribe();
    }
    if (this.syncSubscription) {
      this.syncSubscription.unsubscribe();
    }
  }

  async loadInitialData() {
    try {
      // Set test user context
      this.dataStorage.setUserContext('test_user_1', 'test_church_1');
      
      // Get current network status
      this.networkStatus = this.networkService.getCurrentStatus();
      
      // Get storage stats
      this.storageStats = await this.dataStorage.getStorageStatistics();
      
      this.log('✅ Initial data loaded successfully');
    } catch (error) {
      this.log(`❌ Error loading initial data: ${error}`);
    }
  }

  async testAttendanceRecording() {
    try {
      const testAttendance = {
        class_member: 'test_member_1',
        date: new Date().toISOString().split('T')[0], // Today's date
        is_present: true,
        absence_reason: null,
        marked_by: 'test_user_1'
      };

      await this.dataStorage.recordAttendance(testAttendance as any);
      this.log('✅ Test attendance recorded offline');
      
      // Show updated stats
      this.storageStats = await this.dataStorage.getStorageStatistics();
      
    } catch (error) {
      this.log(`❌ Error recording attendance: ${error}`);
    }
  }

  async testOfferingRecording() {
    try {
      const testOffering = {
        action_unit_class: 'test_class_1',
        amount: 25.50,
        currency: 'GHS' as const,
        date: new Date().toISOString().split('T')[0],
        recorded_by: 'test_user_1',
        notes: 'Test offering from mobile app'
      };

      await this.dataStorage.recordOffering(testOffering as any);
      this.log('✅ Test offering recorded offline');
      
      // Show updated stats
      this.storageStats = await this.dataStorage.getStorageStatistics();
      
    } catch (error) {
      this.log(`❌ Error recording offering: ${error}`);
    }
  }

  async testManualSync() {
    try {
      this.log('🔄 Starting manual sync...');
      const result = await this.syncService.syncAllData();
      
      if (result.success) {
        this.log(`✅ Sync successful: ${result.syncedItems} items synced`);
      } else {
        this.log(`❌ Sync failed: ${result.errors.join(', ')}`);
      }
      
    } catch (error) {
      this.log(`❌ Sync error: ${error}`);
    }
  }

  async clearTestData() {
    try {
      await this.dataStorage.clearAllData();
      this.log('🗑️ All test data cleared');
      
      // Reload stats
      this.storageStats = await this.dataStorage.getStorageStatistics();
      
    } catch (error) {
      this.log(`❌ Error clearing data: ${error}`);
    }
  }

  private log(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.testLog = `[${timestamp}] ${message}\n${this.testLog}`;
    console.log(message);
  }
}
