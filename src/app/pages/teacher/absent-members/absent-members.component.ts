
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/api';
import { Notification } from 'src/app/services/notification';
import { ActionSheetController, IonRefresher, IonRefresherContent } from '@ionic/angular/standalone';

// Import specific Ionic components
import { 
  IonHeader, IonToolbar, IonButtons, IonButton, 
  IonTitle, IonContent, IonIcon, IonCard, IonCardContent,
  IonSpinner
} from "@ionic/angular/standalone";

export interface AbsentMember {
  id: string;
  name: string;
  phone: string;
  location: string;
  absenceReason: string;
  lastAttendance: Date;
  absenceCount: number;
  notes?: string;
}

@Component({
  selector: 'app-absent-members',
  templateUrl: './absent-members.component.html',
  styleUrls: ['./absent-members.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonHeader, IonToolbar, IonButtons, IonButton,
    IonTitle, IonContent, IonIcon, IonCard, IonCardContent,
    IonSpinner,
    IonRefresher,
    IonRefresherContent
]
})
export class AbsentMembersComponent implements OnInit {
  user: any;
  classInfo: any;
  absentMembers: AbsentMember[] = [];
  filteredMembers: AbsentMember[] = [];
  isLoading: boolean = false;
  selectedFilter: string = 'all';

  private authService = inject(AuthService);
  private router = inject(Router);
  private actionSheetController = inject(ActionSheetController);
  private notification = inject(Notification);
  private apiService = inject(ApiService);

  ngOnInit() {
    this.loadAbsentMembers();
  }

  async loadAbsentMembers() {
    this.isLoading = true;
    
    try {
      const classes = await this.apiService.getTeacherClasses().toPromise();
      
      if (classes && classes.length > 0) {
        this.classInfo = classes[0];
        
        const absentMembersResponse = await this.apiService.getAbsentMembers(
          this.classInfo.id,
          { daysBack: 30, minAbsences: 1 }
        ).toPromise();
        
        if (absentMembersResponse) {
          this.absentMembers = absentMembersResponse.map((member: any) => ({
            id: member.id,
            name: member.name,
            phone: member.phone,
            location: member.location,
            absenceReason: member.absence_reason,
            lastAttendance: member.last_attendance ? new Date(member.last_attendance) : new Date(),
            absenceCount: member.absence_count,
            notes: member.notes || ''
          }));
          
          this.filteredMembers = [...this.absentMembers];
        } else {
          this.absentMembers = [];
          this.filteredMembers = [];
        }

        console.log('filtered member, ', this.filterMembers)
        console.log('absenting member, ', this.absentMembers)
      } else {
        this.notification.error('No class assigned to this teacher');
        this.absentMembers = [];
        this.filteredMembers = [];
      }
    } catch (error) {
      this.notification.error('Failed to load absent members');
      console.error('Error loading absent members:', error);
      this.absentMembers = [];
      this.filteredMembers = [];
    } finally {
      this.isLoading = false;
    }
  }


 filterMembers(filter: string) {
  this.selectedFilter = filter;
  
  if (filter === 'all') {
    this.filteredMembers = [...this.absentMembers];
  } else {
    this.filteredMembers = this.absentMembers.filter(member => {
      const reason = member.absenceReason || ''; // Handle null/undefined
      return reason.toLowerCase() === filter.toLowerCase();
    });
  }
}


  getFilterCount(filter: string): number {
  if (filter === 'all') return this.absentMembers.length;
  
  return this.absentMembers.filter(member => {
    const reason = member.absenceReason || ''; // Handle null/undefined
    return reason.toLowerCase() === filter.toLowerCase();
  }).length;
}

  async showContactOptions(member: AbsentMember) {
    const actionSheet = await this.actionSheetController.create({
      header: `Contact ${member.name}`,
      buttons: [
        {
          text: 'Call',
          icon: 'call',
          handler: () => {
            this.callMember(member.phone);
          }
        },
        {
          text: 'Send Message',
          icon: 'chatbubble',
          handler: () => {
            this.messageMember(member.phone);
          }
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  getAbsenceReasonClass(reason: string | null): string {
  if (!reason) return 'unknown';
  return reason.toLowerCase();
}

  callMember(phone: string) {
    window.open(`tel:${phone}`, '_system');
  }

  messageMember(phone: string) {
    const message = `Hello, we noticed you weren't in class today. We're praying for you and hope to see you next Sabbath!`;
    window.open(`sms:${phone}?body=${encodeURIComponent(message)}`, '_system');
  }

  addNote(member: AbsentMember) {
    // TODO: Open note modal
    console.log('Add note for:', member.name);
  }

  markAsContacted(member: AbsentMember) {
    // TODO: Update member as contacted
    this.notification.info(`Marked ${member.name} as contacted`);
  }

  generateReport() {
    // TODO: Generate absent members report
    console.log('Generate absent members report');
  }

  goBack() {
    this.router.navigate(['/teacher']);
  }


     async handleRefresh(event: any) {
    try {
      // Call your refresh methods
      await this.loadAbsentMembers;
      
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