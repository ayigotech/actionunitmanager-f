import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { SubscriptionService } from '../../services/subscription';
import { Notification } from '../../services/notification';

@Component({
  selector: 'app-payment-modal',
  templateUrl: './payment-modal.component.html',
  styleUrls: ['./payment-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class PaymentModalComponent {
  private subscriptionService = inject(SubscriptionService);
  private modalCtrl = inject(ModalController);
  private notification = inject(Notification);

  phoneNumber = '';
  selectedPlan: 'quarterly' | 'annual' = 'quarterly';
  isLoading = false;
  paymentStep: 'input' | 'processing' | 'success' | 'error' = 'input';

  // Plan details
  plans = {
    quarterly: { amount: 100, name: 'Quarterly' },
    annual: { amount: 350, name: 'Annual' }
  };

  get currentPlan() {
    return this.plans[this.selectedPlan];
  }

  async processPayment() {
    if (!this.phoneNumber || this.phoneNumber.length < 10) {
      this.notification.error('Please enter a valid MTN Mobile Money number');
      return;
    }

    this.isLoading = true;
    this.paymentStep = 'processing';

    try {
      // CORRECTED: initiatePayment now takes (plan, phoneNumber)
      const paymentResult = await this.subscriptionService.initiatePayment(
        this.selectedPlan, 
        this.phoneNumber
      ).toPromise();
      
      if (paymentResult.success) {
        this.notification.success('Payment initiated! Check your phone to complete.');
        
        // Simulate payment verification (in real app, this would be user-triggered)
        setTimeout(async () => {
          try {
            const status = await this.subscriptionService.verifyPayment(
              paymentResult.transaction_id,
              this.selectedPlan
            ).toPromise();
            
            if (status.success) {
              this.paymentStep = 'success';
              this.notification.success('Payment successful! Subscription activated.');
              
              // Refresh subscription status
              this.subscriptionService.refreshStatus().subscribe();
              
              // Close modal after success
              setTimeout(() => {
                this.modalCtrl.dismiss({ success: true, plan: this.selectedPlan });
              }, 2000);
            } else {
              this.paymentStep = 'error';
              this.notification.error('Payment verification failed. Please try again.');
            }
          } catch (verifyError) {
            this.paymentStep = 'error';
            this.notification.error('Payment verification failed. Please try again.');
          }
          
          this.isLoading = false;
        }, 3000);
      } else {
        this.paymentStep = 'error';
        this.isLoading = false;
        this.notification.error('Payment initiation failed. Please try again.');
      }
    } catch (error) {
      this.paymentStep = 'error';
      this.isLoading = false;
      this.notification.error('Payment initiation failed. Please try again.');
    }
  }

  onPlanChange(plan: 'quarterly' | 'annual') {
    this.selectedPlan = plan;
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}