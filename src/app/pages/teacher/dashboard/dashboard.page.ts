

import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/api';
import { Notification } from 'src/app/services/notification';
import { FeatureGuard } from 'src/app/services/feature-guard';
// import { FeatureGuard } from 'src/app/services/feature-guard';


export interface ClassInfo {
  id: string;
  name: string;
  memberCount: number;      // Backend: member_count
  todayAttendance: number;  // Backend: today_attendance
  totalOfferings: number;   // Backend: total_offerings
  location: string;
}


@Component({
   selector: 'app-teacher-dashboard', // Changed to unique selector
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})

export class TeacherDashboardPage implements OnInit {
  user: any;
  classInfo: ClassInfo | null = null;
  isLoading: boolean = false;

  constructor(
    public  featureGuard: FeatureGuard,
    private authService: AuthService,
    private router: Router,
    private notification : Notification,
    private apiService : ApiService,
  ) {}

  ngOnInit() {

     this.user = this.authService.getCurrentUser();
  if (!this.user) {
    this.router.navigate(['/auth']);
    return;
  }
  
    console.log("initializing ", "component initializing...")
    this.loadClassInfo()


     // Reload when navigating to this page
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && event.url === '/teacher') {
        this.loadClassInfo();
      }
    });

  }


  // teacher-dashboard.page.ts - Updated loadClassInfo method
async loadClassInfo() {
  this.isLoading = true;
  
  try {
    const dashboardInfo = await this.apiService.getTeacherDashboardInfo().toPromise();
    // console.log('dashboard info, ', dashboardInfo)
    
    if (dashboardInfo) {
      this.classInfo = {
        id: dashboardInfo.id,
        name: dashboardInfo.name,
        memberCount: dashboardInfo.member_count,
        todayAttendance: dashboardInfo.today_attendance,
        totalOfferings: dashboardInfo.total_offerings,
        location: dashboardInfo.location
      };
    } else {
      this.notification.error('Failed to load dashboard information');
    }
  } catch (error: any) {
    console.error('Error loading dashboard info:', error);
    this.notification.error(error.error?.message || 'Failed to load dashboard information');
  } finally {
    this.isLoading = false;
  }
}




  markAttendance() {
    // TODO: Navigate to attendance marking
     this.router.navigate(['/teacher/attendance']);
    console.log('Navigate to attendance marking');
  }

  trackOfferings() {
    // TODO: Navigate to offerings tracking

  this.router.navigate(['/teacher/offerings']);
    console.log('Navigate to offerings tracking');
  }

  viewAbsentMembers() {
    // TODO: Navigate to absent members
     this.router.navigate(['/teacher/absent-members']);
    console.log('Navigate to absent members');
  }

  submitBookOrder() {
    // TODO: Navigate to book ordering

    this.router.navigate(['/teacher/books-ordering']);
    console.log('Navigate to book ordering');
  }

  logout() {
    this.authService.logout();
  }


     async handleRefresh(event: any) {
    try {
      // Call your refresh methods
      await this.loadClassInfo()
      
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
