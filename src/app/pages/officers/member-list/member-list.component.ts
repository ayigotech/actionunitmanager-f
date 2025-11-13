import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonToolbar, 
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
  IonSearchbar,
  IonSpinner
} from '@ionic/angular/standalone';
import { ApiService } from 'src/app/services/api';
import { Notification } from 'src/app/services/notification';

interface Member {
  id: number;
  member_name: string;
  member_phone: string;
  member_email?: string;
  location: string;
  class_name: string;
  joined_date: string;
  is_active: boolean;
}

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader, 
    IonToolbar, 
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    // IonList,
    IonItem,
    IonLabel,
    IonAvatar,
    // IonSearchbar,
    IonSpinner
  ]
})
export class MemberListComponent implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);
  private notification = inject(Notification);

  searchTerm: string = '';
  filteredMembers: Member[] = [];
  isLoading: boolean = false;
  members: Member[] = [];
  

  ngOnInit() {
    this.loadMembers();
  }

  async loadMembers() {
    this.isLoading = true;
    try {
      // Using your existing endpoint to get all members
      this.members = await this.apiService.getClassMembers().toPromise() || [];
      this.filteredMembers = [...this.members];
    } catch (error: any) {
      console.error('Error loading members:', error);
      const errorMessage = error.error?.error || 'Failed to load members';
      this.notification.error(errorMessage);
    } finally {
      this.isLoading = false;
    }
  }
  

  searchMembers(event: any) {
    const term = event.target.value.toLowerCase();
    this.searchTerm = term;
    
    if (!term) {
      this.filteredMembers = [...this.members];
      return;
    }

    this.filteredMembers = this.members.filter(member => 
      member.member_name.toLowerCase().includes(term) ||
      member.member_phone.includes(term) ||
      member.location.toLowerCase().includes(term) ||
      member.class_name.toLowerCase().includes(term)
    );
  }


  formatPhoneNumber(phone: string): string {
    // Clean phone number for tel: link
    return phone.replace(/\s+/g, '');
  }

  getInitials(name: string): string {
    return name.split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  goBack() {
    this.router.navigate(['/officers-insight']);
  }
}