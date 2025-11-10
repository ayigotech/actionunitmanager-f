import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { SubscriptionService, SubscriptionStatus } from '../../services/subscription';
import { PaymentModalComponent } from '../payment-modal/payment-modal.component';

@Component({
  selector: 'app-subscription-status',
  templateUrl: './subscription-status.component.html',
  styleUrls: ['./subscription-status.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class SubscriptionStatusComponent {
  // Make it public for template access
  public subscriptionService = inject(SubscriptionService);
  private modalCtrl = inject(ModalController);

  subscriptionStatus$ = this.subscriptionService.subscriptionStatus$;

  getStatusColor(status: SubscriptionStatus | null): string {
    if (!status) return 'medium';
    
    if (this.subscriptionService.isPaid()) return 'success';
    if (this.subscriptionService.isTrial()) return 'primary';
    if (this.subscriptionService.isGracePeriod()) return 'warning';
    if (this.subscriptionService.isExpired()) return 'danger';
    
    return 'medium';
  }

  getStatusText(status: SubscriptionStatus | null): string {
    if (!status) return 'Loading...';
    
    if (this.subscriptionService.isPaid()) return 'Active Subscription';
    if (this.subscriptionService.isTrial()) return 'Free Trial';
    if (this.subscriptionService.isGracePeriod()) return 'Grace Period';
    if (this.subscriptionService.isExpired()) return 'Subscription Expired';
    
    return 'Unknown Status';
  }

  async openPaymentModal() {
    const modal = await this.modalCtrl.create({
      component: PaymentModalComponent,
      componentProps: {},
      breakpoints: [0, 0.8],
      initialBreakpoint: 0.8
    });
    
    await modal.present();
  }
}