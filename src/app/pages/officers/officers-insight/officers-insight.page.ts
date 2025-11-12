
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavigationStart, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api';
import { Notification } from 'src/app/services/notification';
import { AuthService } from 'src/app/services/auth';
import { ActionSheetController, IonRefresher, IonRefresherContent } from '@ionic/angular/standalone';

// Import specific Ionic components
import { 
  IonHeader, IonToolbar, IonButtons, IonButton, 
  IonTitle, IonContent, IonIcon, IonCard, IonCardHeader,
  IonCardTitle, IonCardSubtitle, IonCardContent, IonSpinner,
  IonBadge, ModalController
} from "@ionic/angular/standalone";

export interface AtRiskMember {
  member_id: string;
  member_name: string;
  member_phone: string;
  member_location: string;
  class_name: string;
  attendance_rate: number;
  total_absences: number;
  risk_score: number;
  risk_factors: string[];
  last_attendance: string;
  days_since_last_attendance: number;
}

@Component({
  selector: 'app-officers-insight',
  templateUrl: './officers-insight.page.html',
  styleUrls: ['./officers-insight.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonHeader, IonToolbar, IonButtons, IonButton,
    IonTitle, IonContent, IonIcon, IonCard, IonCardHeader,
    IonCardTitle, IonCardSubtitle,
    IonCardContent,
    IonRefresher,
    IonRefresherContent
]
})
export class OfficersInsightsPage {
  selectedSegment: 'at-risk' | 'trends' | 'follow-up' | 'profiles' = 'at-risk';
  isLoading: boolean = false;
  user: any
  
  atRiskMembers: AtRiskMember[] = [];
  filteredMembers: AtRiskMember[] = [];

  searchTerm: string = ''; 
  
  riskFilters = {
    lower: 1,
    upper: 10
  };

  private apiService = inject(ApiService);
  private notification = inject(Notification);
  private actionSheetController = inject(ActionSheetController);
  private router = inject(Router);
  private authService = inject(AuthService);

  constructor() {
    this.loadAtRiskMembers();


    this.user = this.authService.getCurrentUser();
      if (!this.user) {
        this.router.navigate(['/auth']);
        return;
      }

    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        console.log('🔍 OfficersInsightsPage - Navigation starting to:', event.url);
      }
    });
  }

  async loadAtRiskMembers() {
    this.isLoading = true;
    
    try {
      const response = await this.apiService.getAtRiskMembers().toPromise();
      if (response) {
        this.atRiskMembers = response;
        this.applyRiskFilters();
      }
    } catch (error) {
      this.notification.error('Failed to load at-risk members analysis');
      console.error('Error loading at-risk members:', error);
    } finally {
      this.isLoading = false;
    }
  }

  getRiskColor(score: number): string {
    if (score >= 7) return 'danger';
    if (score >= 4) return 'warning';
    return 'custom';
  }

  getRiskLevel(score: number): string {
    if (score >= 7) return 'High Risk';
    if (score >= 4) return 'Medium Risk';
    return 'Low Risk';
  }

  async showContactOptions(member: AtRiskMember) {
    const actionSheet = await this.actionSheetController.create({
      header: `Contact ${member.member_name}`,
      subHeader: `Risk: ${this.getRiskLevel(member.risk_score)}`,
      buttons: [
        {
          text: 'Call',
          icon: 'call',
          handler: () => {
            this.callMember(member.member_phone);
          }
        },
        {
          text: 'Send Encouragement Message',
          icon: 'chatbubble',
          handler: () => {
            this.sendEncouragementMessage(member);
          }
        },
        {
          text: 'Schedule Visit',
          icon: 'calendar',
          handler: () => {
            this.scheduleVisit(member);
          }
        },
        {
          text: 'Add Note',
          icon: 'document',
          handler: () => {
            this.addMemberNote(member);
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

  callMember(phone: string) {
    window.open(`tel:${phone}`, '_system');
  }

  sendEncouragementMessage(member: AtRiskMember) {
    const message = `Hello ${member.member_name.split(' ')[0]}, we noticed you've been missed in class recently. We're praying for you and hope to see you soon! 🕊️`;
    window.open(`sms:${member.member_phone}?body=${encodeURIComponent(message)}`, '_system');
  }

  scheduleVisit(member: AtRiskMember) {
    this.notification.info(`Visit scheduling for ${member.member_name} will be implemented soon`);
  }

  addMemberNote(member: AtRiskMember) {
    this.notification.info(`Note taking for ${member.member_name} will be implemented soon`);
  }

  markAsContacted(member: AtRiskMember) {
    this.notification.success(`Marked ${member.member_name} as contacted`);
  }

  getSummaryStats() {
    const highRisk = this.filteredMembers.filter(m => m.risk_score >= 7).length;
    const mediumRisk = this.filteredMembers.filter(m => m.risk_score >= 4 && m.risk_score < 7).length;
    const total = this.filteredMembers.length;
    
    return { highRisk, mediumRisk, total };
  }

  onSegmentChange(segment: 'at-risk' | 'trends' | 'follow-up' | 'profiles') {
    this.selectedSegment = segment;
  }

  contactAllHighRisk() {
    const highRiskMembers = this.filteredMembers.filter(m => m.risk_score >= 7);
    if (highRiskMembers.length > 0) {
      this.notification.info(`Would contact ${highRiskMembers.length} high-risk members`);
    }
  }

  messageAllAtRisk() {
    if (this.filteredMembers.length > 0) {
      this.notification.info(`Would message ${this.filteredMembers.length} at-risk members`);
    }
  }

  applyRiskFilters3() {
    this.filteredMembers = this.atRiskMembers.filter(member => 
      member.risk_score >= this.riskFilters.lower && 
      member.risk_score <= this.riskFilters.upper
    );
  }



applyRiskFilters() {
  // Always start from the full atRiskMembers array
  let filtered = this.atRiskMembers.filter(member => 
    member.risk_score >= this.riskFilters.lower && 
    member.risk_score <= this.riskFilters.upper
  );
  
  // Then apply search filter if search term exists
  if (this.searchTerm.trim()) {
    const searchTermLower = this.searchTerm.toLowerCase().trim();
    filtered = filtered.filter(member =>
      member.member_name.toLowerCase().includes(searchTermLower)
    );
  }
  
  this.filteredMembers = filtered;
}


  onRiskFilterChange(event: any) {
    this.riskFilters.lower = parseInt(event.target.value.split(',')[0]);
    this.riskFilters.upper = parseInt(event.target.value.split(',')[1]);
    this.applyRiskFilters();
  }


  onMinRiskChange(event: any) {
  this.riskFilters.lower = parseInt(event.target.value);
  // Ensure min doesn't exceed max
  if (this.riskFilters.lower > this.riskFilters.upper) {
    this.riskFilters.upper = this.riskFilters.lower;
  }
  this.applyRiskFilters();
}

onMaxRiskChange(event: any) {
  this.riskFilters.upper = parseInt(event.target.value);
  // Ensure max doesn't go below min
  if (this.riskFilters.upper < this.riskFilters.lower) {
    this.riskFilters.lower = this.riskFilters.upper;
  }
  this.applyRiskFilters();
}


   // New method: Filter by member name search
  applySearchFilter() {
    if (this.searchTerm.trim()) {
      const searchTermLower = this.searchTerm.toLowerCase().trim();

      console.log("search input: ", searchTermLower)

      this.filteredMembers = this.filteredMembers.filter(member =>
        member.member_name.toLowerCase().includes(searchTermLower)
      );

      console.log("filtered members: ", this,this.filteredMembers)
    }
  }

  // New method: Handle search input
  onMemberSearch(event: any) {
    this.searchTerm = event.target.value;
    //this.applySearchFilter()
   
    this.applyRiskFilters(); // Re-apply both risk and search filters
  }

  // New method: Clear search
  clearSearch() {
    this.searchTerm = '';
    this.applyRiskFilters();
  }


  async refreshInsight(event: any) {
    await this.loadAtRiskMembers();
    event.target.complete();
  }

  goBack() {
    this.authService.logout();
    this.isLoading = false;
  }


  memberList() {
   this.router.navigate(['/member-list'])
  }
}