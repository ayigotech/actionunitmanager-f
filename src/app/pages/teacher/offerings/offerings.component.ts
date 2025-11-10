

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { ApiService } from 'src/app/services/api';
import { Notification } from 'src/app/services/notification';

// Import specific Ionic components
import { IonHeader, IonToolbar, IonButtons, IonButton, IonTitle, IonContent, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonSpinner, IonRefresher, IonRefresherContent } from "@ionic/angular/standalone";

export interface Offering {
  id: string;
  date: Date;
  amount: number;
  currency: string;
  recordedBy: string;
  notes?: string;
}

@Component({
  selector: 'app-offerings',
  templateUrl: './offerings.component.html',
  styleUrls: ['./offerings.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonHeader, IonToolbar, IonButtons, IonButton,
    IonTitle, IonContent, IonIcon, IonCard, IonCardHeader,
    IonCardTitle, IonCardContent, IonSpinner,
    IonRefresher,
    IonRefresherContent
]
})
export class OfferingsComponent implements OnInit {
  user: any;
  classInfo: any;
  offerings: Offering[] = [];
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  offeringForm!: FormGroup;

  currencies = [
    { code: 'GHS', symbol: 'GH₵', name: 'Ghana Cedi' },
    { code: 'USD', symbol: '$', name: 'US Dollar' }
  ];

  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notification = inject(Notification);
  private fb = inject(FormBuilder);

  ngOnInit() {
    this.initializeForm();
    this.loadOfferings();
  }

  initializeForm() {
    this.offeringForm = this.fb.group({
      amount: [null, [Validators.required, Validators.min(0.01)]],
      currency: ['GHS', Validators.required],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      notes: ['']
    });
  }

  async loadOfferings() {
    this.isLoading = true;
    
    try {
      const classes = await this.apiService.getTeacherClasses().toPromise();
      
      if (classes && classes.length > 0) {
        this.classInfo = classes[0];
        
        const offeringsResponse = await this.apiService.getOfferings(this.classInfo.id).toPromise();
        
        if (offeringsResponse) {
          this.offerings = offeringsResponse.map((offering: any) => ({
            id: offering.id,
            date: new Date(offering.date),
            amount: parseFloat(offering.amount),
            currency: offering.currency,
            recordedBy: offering.recorded_by_name,
            notes: offering.notes || ''
          }));
        } else {
          this.offerings = [];
        }
      } else {
        this.notification.error('No class assigned to this teacher');
        this.offerings = [];
      }
    } catch (error) {
      this.notification.error('Failed to load offerings');
      console.error('Error loading offerings:', error);
      this.offerings = [];
    } finally {
      this.isLoading = false;
    }
  }

  async submitOffering() {
    if (this.offeringForm.invalid) {
      this.notification.error('Please enter a valid amount');
      return;
    }

    this.isSubmitting = true;

    try {
      const formValues = this.offeringForm.value;
      const offeringData = {
        action_unit_class: this.classInfo.id,
        amount: formValues.amount,
        currency: formValues.currency,
        date: formValues.date,
        notes: formValues.notes
      };

      const response = await this.apiService.createOffering(offeringData).toPromise();
      
      // Add new offering to list
      const newOffering: Offering = {
        id: response.id,
        date: new Date(response.date),
        amount: parseFloat(response.amount),
        currency: response.currency,
        recordedBy: response.recorded_by_name,
        notes: response.notes || ''
      };

      this.offerings.unshift(newOffering);
      
      // Reset form
      this.offeringForm.reset({
        amount: null,
        currency: 'GHS',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });

      this.notification.success('Offering recorded successfully!');
      
    } catch (error) {
      this.notification.error('Failed to record offering');
      console.error('Error submitting offering:', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  getTotalOfferings(): number {
    return this.offerings.reduce((total, offering) => total + offering.amount, 0);
  }

  getCurrencySymbol(currencyCode: string): string {
    const currency = this.currencies.find(c => c.code === currencyCode);
    return currency ? currency.symbol : currencyCode;
  }

  goBack() {
    this.router.navigate(['/teacher']);
  }





     async handleRefresh(event: any) {
    try {
      // Call your refresh methods
      //await this.loadData();
       await this.initializeForm();
       await this.loadOfferings();
      
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