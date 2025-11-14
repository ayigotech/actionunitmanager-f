

import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth';
import { NavigationEnd, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ApiService } from 'src/app/services/api';
import { Notification } from 'src/app/services/notification';


import { FeatureGuard } from 'src/app/services/feature-guard';
import { filter, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-superintendent-dashboard', // Changed to unique selector
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class SuperintendentDashboardPage implements OnInit, OnDestroy {
 private destroy$ = new Subject<void>();

  user: any;
  summaryStats = {
    totalClasses: 0,
    totalMembers: 0,
    totalTeachers: 0,
    todayAttendance: 0
  };

  
  constructor(
    public  featureGuard: FeatureGuard,
    private authService: AuthService,
    private router: Router,
    private apiService : ApiService,
    private notification: Notification
    
  ) {}


//   ngOnInit() {
//     this.user = this.authService.getCurrentUser();
//     if (!this.user) {
//       this.router.navigate(['/auth']);
//       return;
//     }
    
//     // TODO: Load actual data from service
//     this.loadSummaryStats();
//   }

  
 async loadSummaryStats() {
  try {
    const metrics = await this.apiService.getSuperintendentDashboardMetrics().toPromise();
    if (metrics) {
      this.summaryStats = {
        totalClasses: metrics.total_classes,
        totalMembers: metrics.total_members,
        totalTeachers: metrics.total_teachers,
        todayAttendance: metrics.today_attendance
      };

      console.log('metrics; ', this.summaryStats)
    }
  } catch (error) {
    console.error('Error loading dashboard metrics:', error);
    // Keep mock data as fallback
  }
}



ngOnInit() {
  this.user = this.authService.getCurrentUser();
  if (!this.user) {
    this.router.navigate(['/auth']);
    return;
  }
  
  this.loadSummaryStats();
  
  // Reload when navigating to this component
  this.router.events.pipe(
    takeUntil(this.destroy$),
    filter(event => event instanceof NavigationEnd),
    filter(() => this.router.url === '/superintendent')
  ).subscribe(() => {
    this.loadSummaryStats();
  });
}


ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}

  logout() {
    this.authService.logout();
  }

  navigateToClasses() {
    // TODO: Navigate to classes management
    this.router.navigate(['/superintendent/classes']);
    console.log('Navigate to classes management');
  }

   navigateToMembership() {
    // TODO: Navigate to classes management
    this.router.navigate(['/manage-membership']);
    console.log('Navigate to class membership');
  }

  navigateToTeachers() {
    // TODO: Navigate to teachers management 
    this.router.navigate(['/superintendent/teachers']); 
    console.log('Navigate to teachers management');
  }

  navigateToReports() {
    // TODO: Navigate to reports
    this.router.navigate(['/superintendent/reports-dashboard']);
    console.log('Navigate to reports');
  }

  navigateToQuarterlyOrders() {
  this.router.navigate(['/quarterly-orders']);
}

navigateToManageBooks(){
  this.router.navigate(['/manage-books']);
}

navigateToManageOfficers(){
  this.router.navigate(['/manage-officers']);
}

navigateToSubscription() {
  this.router.navigate(['/subscription']);
}


async handleRefresh(event: any) {
    try {
      // Call your refresh methods
      //await this.loadData();
       await   this.loadSummaryStats();
      
      
      // Complete the refresh
      event.target.complete();
      
      // Optional: Show success message
      this.notification.success('Data refreshed');
    } catch (error) {
      // Complete the refresh even if there's an error
      event.target.complete();
      
      // Show error message
      this.notification.error('Failed to refresh data');
    }
  }

}
