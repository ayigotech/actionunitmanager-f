
// 
import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicModule, ModalController, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SubscriptionService } from '../../services/subscription';
import { FeatureGuard } from 'src/app/services/feature-guard';
import { Notification } from '../../services/notification';
import { Subscription } from 'rxjs';

export interface PlanFeature {
  name: string;
  free_trial: boolean;
  // monthly: boolean;
  quarterly:boolean;
  annual: boolean;
}

@Component({
  selector: 'app-subscription-dashboard',
  templateUrl: './subscription-dashboard.component.html',
  styleUrls: ['./subscription-dashboard.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, FormsModule]
})
export class SubscriptionDashboardComponent implements OnInit, OnDestroy {
  isLoading: boolean = true;
  isProcessingPayment: boolean = false;
  subscriptionStatus: any = null;
  
  // Plan features comparison
  planFeatures: PlanFeature[] = [
    { name: 'Unlimited Members', free_trial: true, quarterly: true, annual: true },
    { name: 'Unlimited Classes', free_trial: true, quarterly: true, annual: true },
    { name: 'Attendance Tracking', free_trial: true, quarterly: true, annual: true },
    { name: 'Offerings Management', free_trial: true, quarterly: true, annual: true },
    { name: 'Books Ordering', free_trial: true, quarterly: true, annual: true },
    { name: 'Basic Reports', free_trial: true, quarterly: true, annual: true },
    { name: 'Call Abesenting Members', free_trial: true, quarterly: true, annual: true },
    { name: 'SMS Abesenting Members', free_trial: true, quarterly: true, annual: true },
    { name: 'Data Export', free_trial: true, quarterly: true, annual: true },
  ];

  sForm : FormGroup

  // Payment form
  paymentForm = {
    plan: 'quarterly' as 'quarterly' | 'annual',
    phoneNumber: ''
  };

  private subscriptionStatusSub!: Subscription;

  constructor(
    private subscriptionService: SubscriptionService,
    public featureGuard: FeatureGuard,
    private notification: Notification,
    private modalController: ModalController,
    private alertController: AlertController,
    private router: Router,
     private fb: FormBuilder,
  ) {
     this.sForm = this.fb.group({
      phoneNumber: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.loadSubscriptionStatus();
  }

  ngOnDestroy() {
    if (this.subscriptionStatusSub) {
      this.subscriptionStatusSub.unsubscribe();
    }
  }

  loadSubscriptionStatus() {
    this.isLoading = true;
    this.subscriptionStatusSub = this.subscriptionService.subscriptionStatus$.subscribe({
      next: (status) => {
        this.subscriptionStatus = status;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading subscription status:', error);
        this.isLoading = false;
        this.notification.error('Failed to load subscription status');
      }
    });

    // Refresh from API
    this.subscriptionService.refreshStatus().subscribe();
  }

  getPlanPrice(plan: string): number {
    const prices = {
      free_trial: 0,
      quarterly: 100,
      annual: 350
    };
    return prices[plan as keyof typeof prices] || 0;
  }

  getPlanSavings(plan: string): string {
    if (plan === 'annual') {
      const monthlyCost = 33.3 * 12; // 50 per month for 12 months
      const annualCost = 350;
      const savings = monthlyCost - annualCost;
      return `Save GHS ${savings} per year`;
    }
    return '';
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      active: 'success',
      trialing: 'primary',
      past_due: 'warning',
      canceled: 'medium',
      unpaid: 'danger'
    };
    return colors[status] || 'medium';
  }

  getStatusText(status: string): string {
    const texts: { [key: string]: string } = {
      active: 'Active',
      trialing: 'Free Trial',
      past_due: 'Past Due',
      canceled: 'Canceled',
      unpaid: 'Unpaid'
    };
    return texts[status] || 'Unknown';
  }

  async initiateUpgrade() {
    if (!this.paymentForm.phoneNumber) {
      this.notification.error('Please enter your phone number');
      return;
    }

    this.isProcessingPayment = true;

    try {
      const paymentResponse = await this.subscriptionService.initiatePayment(
        this.paymentForm.plan,
        this.paymentForm.phoneNumber
      ).toPromise();

      if (paymentResponse.success) {
        this.notification.success('Payment initiated! Check your phone to complete.');
        
        // Show payment verification dialog
        await this.showPaymentVerification(paymentResponse.transaction_id);
      } else {
        this.notification.error('Failed to initiate payment');
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      this.notification.error('Payment initiation failed');
    } finally {
      this.isProcessingPayment = false;
    }
  }

  private async showPaymentVerification(transactionId: string) {
    const alert = await this.alertController.create({
      header: 'Verify Payment',
      message: `We've sent a payment request to your phone. Please complete the payment and then verify below.`,
      inputs: [
        {
          name: 'confirmation',
          type: 'text',
          placeholder: 'Enter any confirmation code (demo)'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Verify Payment',
          handler: async (data) => {
            if (data.confirmation) {
              await this.verifyPayment(transactionId);
            }
            return false; // Keep alert open if no confirmation
          }
        }
      ]
    });

    await alert.present();
  }

  private async verifyPayment(transactionId: string) {
    this.isProcessingPayment = true;

    try {
      const verificationResponse = await this.subscriptionService.verifyPayment(
        transactionId,
        this.paymentForm.plan
      ).toPromise();

      if (verificationResponse.success) {
        this.notification.success('Payment verified! Subscription updated.');
        this.loadSubscriptionStatus(); // Refresh status
      } else {
        this.notification.error('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      this.notification.error('Payment verification failed');
    } finally {
      this.isProcessingPayment = false;
    }
  }

  goBack() {
    this.router.navigate(['/superintendent']);
  }
}
