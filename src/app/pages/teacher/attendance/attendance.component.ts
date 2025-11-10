


// import { Component, OnInit } from '@angular/core';
// import { IonicModule, ModalController, ToastController } from '@ionic/angular';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
// import { AuthService } from 'src/app/services/auth';
// import { Notification } from 'src/app/services/notification';
// import { ApiService } from 'src/app/services/api';
// import { Subject } from 'rxjs';


// export interface Member {
//   id: string;
//   class_member_id: string; // Add this
//   name: string;
//   phone: string;
//   location: string;
//   isPresent: boolean;
//   absenceReason?: string;
// }

// @Component({
//   selector: 'app-attendance',
//   templateUrl: './attendance.component.html',
//   styleUrls: ['./attendance.component.scss'],
//   standalone: true,
//   imports: [IonicModule, CommonModule, FormsModule]
// })
// export class AttendanceComponent implements OnInit {
//   user: any;
//   classInfo: any;
//   members: Member[] = [];
//   selectedDate: string = new Date().toISOString().split('T')[0];
//   isLoading: boolean = false;
//   isSubmitting: boolean = false;

//   absenceReasons = [
//     'sick',
//     'traveling',
//     'work',
//     'family-emergency',
//     'unknown',
//     'other'
//   ];

//   constructor(
//     private apiService: ApiService,
//     private authService: AuthService,
//     private router: Router,
//     private notification: Notification
//   ) {}

//   ngOnInit() {
    
//     this.loadClassData();
//   }


// // attendance.component.ts 
// async loadClassData() {
//   this.isLoading = true;
  
//   try {
//     // Get teacher's assigned classes
//     const classes = await this.apiService.getTeacherClasses().toPromise();
    
//     if (classes && classes.length > 0) {
//       // Use the first assigned class
//       this.classInfo = classes[0];
//       console.log('classes for this teacher ', classes)
//       // Fetch members for this class
//       const membersResponse = await this.apiService.getClassMembers(this.classInfo.id).toPromise();
//        console.log('members for this class ', membersResponse)
      
//       // Handle case where membersResponse might be undefined
//       if (membersResponse) {
//         // Transform API response to match Member interface
//         this.members = membersResponse.map((member: any) => ({
//           id: member.user?.id || member.id,
//           class_member_id: member.id, // This is the ClassMember ID from backend
//           name: member.user?.member_name || member.member_name,
//           phone: member.user?.member_phone || member.member_phone,
//           location: member.user?.location || member.location || '',
//           isPresent: false,
//           absenceReason: undefined
//         }));
//       } else {
//         this.members = [];
//       }
//     } else {
//       this.notification.error('No class assigned to this teacher');
//       this.members = [];
//     }
//   } catch (error) {
//     this.notification.error('Failed to load class data');
//     console.error('Error loading class data:', error);
//     this.members = [];
//   } finally {
//     this.isLoading = false;
//   }
// }




//   toggleAttendance(member: Member) {
//     member.isPresent = !member.isPresent;
//     if (member.isPresent) {
//       member.absenceReason = undefined;
//     }
//   }

//   setAbsenceReason(member: Member, reason: string) {
//     member.absenceReason = reason;
//   }

//   getPresentCount(): number {
//     return this.members.filter(m => m.isPresent).length;
//   }

//   getAbsentCount(): number {
//     return this.members.filter(m => !m.isPresent).length;
//   }


// // submitAttendance method
// async submitAttendance() {
//   this.isSubmitting = true;
  
//   try {
//     // Prepare attendance data for API
//     const attendanceData = this.members.map(member => ({
//       class_member: member.class_member_id, // Use the class_member_id directly
//       date: this.selectedDate,
//       is_present: member.isPresent,
//       absence_reason: member.isPresent ? null : member.absenceReason
//     }));

//     const response = await this.apiService.markAttendance(attendanceData).toPromise();
    
//     this.notification.success(response.message || 'Attendance submitted successfully!');
    
//     // Navigate back to dashboard after success
//     setTimeout(() => {
//       this.router.navigate(['/teacher']);
//     }, 1500);
    
//   } catch (error: any) {
//     console.error('Error submitting attendance:', error);
//     this.notification.error(error.error?.message || 'Failed to submit attendance');
//   } finally {
//     this.isSubmitting = false;
//   }
// }














//   callMember(phone: string) {
//     window.open(`tel:${phone}`, '_system');
//   }

//   messageMember(phone: string) {
//     window.open(`sms:${phone}`, '_system');
//   }

//   goBack() {
//     this.router.navigate(['/teacher']);
//   }



//   private refreshDashboard = new Subject<void>();
//   refreshDashboard$ = this.refreshDashboard.asObservable();

//   triggerDashboardRefresh() {
//     this.refreshDashboard.next();
//   }
// }













import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth';
import { Notification } from 'src/app/services/notification';
import { ApiService } from 'src/app/services/api';
import { Subject } from 'rxjs';

// Import specific Ionic components
import { 
  IonHeader, IonToolbar, IonButtons, IonButton, 
  IonTitle, IonContent, IonIcon, IonCard, IonCardContent,
  IonSpinner, ToastController
} from "@ionic/angular/standalone";

export interface Member {
  id: string;
  class_member_id: string;
  name: string;
  phone: string;
  location: string;
  isPresent: boolean;
  absenceReason?: string;
}

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule,
    IonHeader, IonToolbar, IonButtons, IonButton, 
    IonTitle, IonContent, IonIcon, IonCard, IonCardContent,
    IonSpinner
  ]
})
export class AttendanceComponent implements OnInit {
  user: any;
  classInfo: any;
  members: Member[] = [];
  selectedDate: string = new Date().toISOString().split('T')[0];
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  dateForm!: FormGroup;

  absenceReasons = [
    'sick',
    'traveling',
    'work',
    'family-emergency',
    'unknown',
    'other'
  ];

  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notification = inject(Notification);
  private fb = inject(FormBuilder);

  private refreshDashboard = new Subject<void>();
  refreshDashboard$ = this.refreshDashboard.asObservable();

  ngOnInit() {
    this.initializeForm();
    this.loadClassData();
  }

  initializeForm() {
    this.dateForm = this.fb.group({
      selectedDate: [this.selectedDate]
    });

    // Listen for date changes
    this.dateForm.get('selectedDate')?.valueChanges.subscribe(date => {
      this.selectedDate = date;
    });
  }

  async loadClassData() {
    this.isLoading = true;
    
    try {
      const classes = await this.apiService.getTeacherClasses().toPromise();
      
      if (classes && classes.length > 0) {
        this.classInfo = classes[0];
        console.log('classes for this teacher ', classes);
        
        const membersResponse = await this.apiService.getClassMembers(this.classInfo.id).toPromise();
        console.log('members for this class ', membersResponse);
        
        if (membersResponse) {
          this.members = membersResponse.map((member: any) => ({
            id: member.user?.id || member.id,
            class_member_id: member.id,
            name: member.user?.member_name || member.member_name,
            phone: member.user?.member_phone || member.member_phone,
            location: member.user?.location || member.location || '',
            isPresent: false,
            absenceReason: undefined
          }));
        } else {
          this.members = [];
        }
      } else {
        this.notification.error('No class assigned to this teacher');
        this.members = [];
      }
    } catch (error) {
      this.notification.error('Failed to load class data');
      console.error('Error loading class data:', error);
      this.members = [];
    } finally {
      this.isLoading = false;
    }
  }

  toggleAttendance(member: Member) {
    member.isPresent = !member.isPresent;
    if (member.isPresent) {
      member.absenceReason = undefined;
    }
  }

  setAbsenceReason(member: Member, reason: string) {
    member.absenceReason = reason;
  }

  getPresentCount(): number {
    return this.members.filter(m => m.isPresent).length;
  }

  getAbsentCount(): number {
    return this.members.filter(m => !m.isPresent).length;
  }

  async submitAttendance() {
    this.isSubmitting = true;
    
    try {
      const attendanceData = this.members.map(member => ({
        class_member: member.class_member_id,
        date: this.selectedDate,
        is_present: member.isPresent,
        absence_reason: member.isPresent ? null : member.absenceReason
      }));

      console.log('attendance data ', attendanceData)

      const response = await this.apiService.markAttendance(attendanceData).toPromise();
      
      this.notification.success(response.message || 'Attendance submitted successfully!');
      
      setTimeout(() => {
        this.router.navigate(['/teacher']);
      }, 1500);
      
    } catch (error: any) {
      console.error('Error submitting attendance:', error);
      this.notification.error(error.error?.message || 'Failed to submit attendance');
    } finally {
      this.isSubmitting = false;
    }
  }


  
  callMember(phone: string) {
    window.open(`tel:${phone}`, '_system');
  }

  messageMember(phone: string) {
    window.open(`sms:${phone}`, '_system');
  }

  goBack() {
    this.router.navigate(['/teacher']);
  }

  triggerDashboardRefresh() {
    this.refreshDashboard.next();
  }
}