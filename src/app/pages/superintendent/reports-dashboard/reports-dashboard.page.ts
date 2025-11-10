
// import { Component, inject } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { IonicModule } from '@ionic/angular';
// import { AuthService } from '../../../services/auth';
// import { Router } from '@angular/router';
// import { ApiService } from 'src/app/services/api';
// import { Notification } from 'src/app/services/notification';


// interface AttendanceSummary {
//   className: string;
//   teacherName: string;
//   date: string;
//   totalMembers: number;
//   presentCount: number;
//   absentCount: number;
//   attendanceRate: number;
//   absentReasons: { [reason: string]: number };
// }

// interface OfferingSummary {
//   className: string;
//   date: string;
//   totalAmount: number;
//   trend: 'up' | 'down' | 'stable';
//   trendPercentage: number;
// }



// @Component({
//   selector: 'app-reports-dashboard',
//   templateUrl: './reports-dashboard.page.html',
//   styleUrls: ['./reports-dashboard.page.scss'],
//   standalone: true,
//   imports: [CommonModule, IonicModule]
// })
// export class ReportsDashboardPage {

  
//   isLoading: boolean = false;
//   selectedSegment: 'attendance' | 'offerings' = 'attendance' ;
//   attendanceData: AttendanceSummary[] = [];
//   offeringsData: OfferingSummary[] = [];


//   // Date filters
//   dateFilter = {
//     startDate: new Date().toISOString().split('T')[0],
//     endDate: new Date().toISOString().split('T')[0]
//   };

//   constructor(
//     private authService: AuthService,
//     private apiService: ApiService,
//     private notification: Notification,
//     private router: Router
//   ) {
//     this.loadReportsData();
//   }

//   async loadReportsData() {
//     this.isLoading = true;
    
//     try {
//       if (this.selectedSegment === 'attendance') {
//         await this.loadAttendanceReports();
//       } else if (this.selectedSegment === 'offerings') {
//         await this.loadOfferingsReports();
//       }
//     } catch (error) {
//       this.notification.error('Failed to load reports data');
//       console.error('Error loading reports:', error);
//     } finally {
//       this.isLoading = false;
//     }
//   }

//   async loadAttendanceReports() {
//     const response = await this.apiService.getAttendanceReports(this.dateFilter).toPromise();
//     if (response) {
//       this.attendanceData = response.map((item: any) => ({
//         className: item.class_name,
//         teacherName: item.teacher_name,
//         date: item.date,
//         totalMembers: item.total_members,
//         presentCount: item.present_count,
//         absentCount: item.absent_count,
//         attendanceRate: item.attendance_rate,
//         absentReasons: item.absent_reasons
//       }));
//     }
//   }

//   async loadOfferingsReports() {
//     const response = await this.apiService.getOfferingsReports(this.dateFilter).toPromise();
//     if (response) {
//       this.offeringsData = response.map((item: any) => ({
//         className: item.class_name,
//         date: item.date,
//         totalAmount: item.total_amount,
//         trend: item.trend,
//         trendPercentage: item.trend_percentage
//       }));
//     }
//   }

//   // Helper methods for attendance segment
//   getAverageAttendance(): number {
//     if (this.attendanceData.length === 0) return 0;
//     const totalRate = this.attendanceData.reduce((sum, classData) => sum + classData.attendanceRate, 0);
//     return totalRate / this.attendanceData.length;
//   }

//   getTotalPresent(): number {
//     return this.attendanceData.reduce((sum, classData) => sum + classData.presentCount, 0);
//   }

//   // Helper methods for offerings segment
//   getTotalOfferings(): number {
//     return this.offeringsData.reduce((sum, offering) => sum + offering.totalAmount, 0);
//   }

//   // Utility method for template
//   objectKeys(obj: any): string[] {
//     return obj ? Object.keys(obj) : [];
//   }

//   onSegmentChange(event: any) {
//     this.selectedSegment = event.detail.value;
//     this.loadReportsData();
//   }

//   // Add these methods for date filtering in your template
//   onStartDateChange(event: any) {
//     this.dateFilter.startDate = event.detail.value;
//     this.loadReportsData();
//   }

//   onEndDateChange(event: any) {
//     this.dateFilter.endDate = event.detail.value;
//     this.loadReportsData();
//   }
 

//   onDateFilterChange() {
//     this.loadReportsData();
//   }

 
// }





import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { ApiService } from 'src/app/services/api';
import { Notification } from 'src/app/services/notification';

// Import specific Ionic components
import { 
  IonHeader, IonToolbar, IonButtons, IonBackButton, 
  IonTitle, IonContent, IonCard, IonCardHeader, 
  IonCardTitle, IonCardContent, IonItem, IonLabel,
  IonBadge, IonIcon
} from "@ionic/angular/standalone";

interface AttendanceSummary {
  className: string;
  teacherName: string;
  date: string;
  totalMembers: number;
  presentCount: number;
  absentCount: number;
  attendanceRate: number;
  absentReasons: { [reason: string]: number };
}

interface OfferingSummary {
  className: string;
  date: string;
  totalAmount: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

@Component({
  selector: 'app-reports-dashboard',
  templateUrl: './reports-dashboard.page.html',
  styleUrls: ['./reports-dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule,
    IonHeader, IonToolbar, IonButtons, IonBackButton, 
    IonTitle, IonContent, IonCard, IonCardHeader, 
    IonCardTitle, IonCardContent,
    IonBadge, IonIcon
  ]
})
export class ReportsDashboardPage {
  isLoading: boolean = false;
  selectedSegment: 'attendance' | 'offerings' = 'attendance';
  attendanceData: AttendanceSummary[] = [];
  offeringsData: OfferingSummary[] = [];
  filterForm!: FormGroup;

  private authService = inject(AuthService);
  private apiService = inject(ApiService);
  private notification = inject(Notification);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  constructor() {
    this.initializeForm();
    this.loadReportsData();
  }

  initializeForm() {
    const today = new Date().toISOString().split('T')[0];
    this.filterForm = this.fb.group({
      startDate: [today],
      endDate: [today]
    });

    // Listen for form changes
    this.filterForm.valueChanges.subscribe(() => {
      this.loadReportsData();
    });
  }

  async loadReportsData() {
    this.isLoading = true;
    
    try {
      if (this.selectedSegment === 'attendance') {
        await this.loadAttendanceReports();
      } else if (this.selectedSegment === 'offerings') {
        await this.loadOfferingsReports();
      }
    } catch (error) {
      this.notification.error('Failed to load reports data');
      console.error('Error loading reports:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async loadAttendanceReports() {
    const dateFilter = this.filterForm.value;
    const response = await this.apiService.getAttendanceReports(dateFilter).toPromise();
    if (response) {
      this.attendanceData = response.map((item: any) => ({
        className: item.class_name,
        teacherName: item.teacher_name,
        date: item.date,
        totalMembers: item.total_members,
        presentCount: item.present_count,
        absentCount: item.absent_count,
        attendanceRate: item.attendance_rate,
        absentReasons: item.absent_reasons
      }));
    }
  }

  async loadOfferingsReports() {
    const dateFilter = this.filterForm.value;
    const response = await this.apiService.getOfferingsReports(dateFilter).toPromise();
    if (response) {
      this.offeringsData = response.map((item: any) => ({
        className: item.class_name,
        date: item.date,
        totalAmount: item.total_amount,
        trend: item.trend,
        trendPercentage: item.trend_percentage
      }));
    }
  }

  // Helper methods for attendance segment
  getAverageAttendance(): number {
    if (this.attendanceData.length === 0) return 0;
    const totalRate = this.attendanceData.reduce((sum, classData) => sum + classData.attendanceRate, 0);
    return totalRate / this.attendanceData.length;
  }

  getTotalPresent(): number {
    return this.attendanceData.reduce((sum, classData) => sum + classData.presentCount, 0);
  }

  // Helper methods for offerings segment
  getTotalOfferings(): number {
    return this.offeringsData.reduce((sum, offering) => sum + offering.totalAmount, 0);
  }

  // Utility method for template
  objectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  onSegmentChange(segment: 'attendance' | 'offerings') {
    this.selectedSegment = segment;
    this.loadReportsData();
  }

  getTrendIcon(trend: string): string {
    switch (trend) {
      case 'up': return 'trending-up';
      case 'down': return 'trending-down';
      default: return 'remove';
    }
  }

  getTrendColor(trend: string): string {
    switch (trend) {
      case 'up': return 'success';
      case 'down': return 'danger';
      default: return 'medium';
    }
  }
}