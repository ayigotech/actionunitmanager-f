

import { Component, OnInit, inject } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth';
import { ApiService } from 'src/app/services/api';
import { Notification } from 'src/app/services/notification';

import { AddMemberModalComponent } from 'src/app/components/add-member-modal/add-member-modal.component';
import { BulkImportMembersModalComponent } from 'src/app/components/bulk-import-members-modal/bulk-import-members-modal.component';

export interface Member {
  id: string;
  name: string;
  phone: string;
  email?: string;
  classId: string;
  className: string;
  joinDate: Date;
  isActive: boolean;
}

@Component({
  selector: 'app-manage-membership',
  templateUrl: './manage-membership.page.html',
  styleUrls: ['./manage-membership.page.scss'],
  standalone: true,
   imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule]
   
  })


export class ManageMembershipPage implements OnInit {
  members: Member[] = [];
  classes: any[] = [];
  isLoading: boolean = false;
  selectedClassId: string = 'all';

  private notification = inject(Notification);
  private authService = inject(AuthService);
  private apiService = inject(ApiService);
  private router = inject(Router);
  private modalController = inject(ModalController);

  async ngOnInit() {
    await this.loadClasses();
    await this.loadMembers();
  }

  async loadClasses() {
    try {
      const response = await this.apiService.getClasses().toPromise();
      this.classes = response || [];
    } catch (error: any) {
      console.error('Error loading classes:', error);
      this.notification.error('Failed to load classes');
    }
  }




async loadMembers() {
  this.isLoading = true;
  
  try {
    // Use real API when ready
    const classId = this.selectedClassId === 'all' ? undefined : this.selectedClassId;
    const response = await this.apiService.getClassMembers(classId).toPromise();
    
    console.log('API Response:', response); // Debug log
    
    if (response && Array.isArray(response)) {
      this.members = response.map(member => {
        // Add null checks for all properties
        return {
          id: member?.id?.toString() || 'unknown',
          name: member?.member_name || 'Unknown Name',
          phone: member?.member_phone || 'No Phone',
          email: member?.member_email || '',
          classId: member?.action_unit_class?.id?.toString() || 'unknown',
          className: member?.class_name || 'Unknown Class',
          joinDate: member?.joined_date ? new Date(member.joined_date) : new Date(),
          isActive: member?.is_active !== false // Default to true if undefined
        };
      });
    } else {
      console.warn('No response or invalid response format');
      this.loadMockMembers(); // Fallback to mock data
    }
  } catch (error: any) {
    console.error('Error loading members:', error);
    console.error('Error details:', error.status, error.message);
    this.notification.error('Failed to load members');
    this.loadMockMembers(); // Fallback to mock data
  } finally {
    this.isLoading = false;
  }
}


private loadMockMembers() {
  // Your existing mock data loading logic
  setTimeout(() => {
    this.members = [
      {
        id: '1',
        name: 'Brother Kofi',
        phone: '+233123456789',
        email: 'kofi@example.com',
        classId: '1',
        className: 'Youth Action Unit',
        joinDate: new Date('2024-01-15'),
        isActive: true
      },
      // ... other mock members
    ];
    this.isLoading = false;
  }, 1000);
}






  onClassFilterChange() {
    this.loadMembers();
  }



  // 
addMember() {
  this.router.navigate(['/add-member'], {
    state: { 
      mode: 'add',
      returnUrl: '/superintendent' 
    }
  });
}


addBulkMember() {
  this.router.navigate(['/add-bulk-member'], {
    state: { 
      mode: 'add',
      returnUrl: '/superintendent' 
    }
  });
}

// For editing member
editMember(member: any) {
  this.router.navigate(['/edit-member'], {
    state: {
      mode: 'edit',
      memberData: member,
      returnUrl: '/superintendent'
    }
  });
}



async deactivateMember(member: Member) {
    if (confirm(`Are you sure you want to deactivate ${member.name}?`)) {
      try {
        // TODO: Replace with actual API call
        // await this.apiService.deleteMember(member.id).toPromise();
        
        this.notification.success('Member deactivated successfully');
        
        // Update local state
        const memberIndex = this.members.findIndex(m => m.id === member.id);
        if (memberIndex > -1) {
          this.members[memberIndex].isActive = false;
        }
      } catch (error: any) {
        console.error('Error deactivating member:', error);
        this.notification.error('Failed to deactivate member');
      }
    }
  }



  viewMemberDetails(member: Member) {
    // TODO: Navigate to member details
    console.log('View member details:', member);
  }

  async refreshMembers(event: any) {
    await this.loadMembers();
    event.target.complete();
  }

  getSelectedClassName(): string {
    if (this.selectedClassId === 'all') return '';
    const selectedClass = this.classes.find(c => c.id === this.selectedClassId);
    return selectedClass ? selectedClass.name : '';
  }





 async bulkImportMembers() {
    const modal = await this.modalController.create({
      component: BulkImportMembersModalComponent
    });

    modal.onDidDismiss().then(async (result) => {
      if (result.data?.success) {
        this.notification.success(`Successfully imported ${result.data.importedCount} members`);
        await this.loadMembers(); // Refresh the list
      }
    });

    await modal.present();
  }




  goBack() {
    this.router.navigate(['/superintendent']);
  }
}
