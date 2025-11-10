
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { ApiService } from './api';


// 
export interface SubscriptionStatus {
  is_active: boolean;
  plan: 'free_trial' | 'quarterly' | 'annual' | 'expired';
  trial_end_date: string;
  current_period_end: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid';
  grace_period_end?: string;
  days_remaining?: number; // Add this line
}


@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private apiService = inject(ApiService);
  
  private subscriptionStatus = new BehaviorSubject<SubscriptionStatus | null>(null);
  public subscriptionStatus$ = this.subscriptionStatus.asObservable();

  constructor() {
    this.initializeSubscription();
  }

  private initializeSubscription() {
    this.refreshStatus().subscribe({
      next: (status) => {
        this.subscriptionStatus.next(status);
      },
      error: (error) => {
        console.error('Failed to load subscription status:', error);
        // Fallback to mock data for development
        this.subscriptionStatus.next(this.getMockSubscription());
      }
    });
  }

  // Get subscription status from API
  refreshStatus(): Observable<SubscriptionStatus> {
    return this.apiService.getSubscriptionStatus().pipe(
      map((response) => this.transformSubscriptionResponse(response))
    );
  }

  
  private transformSubscriptionResponse(response: any): SubscriptionStatus {
  const today = new Date();
  const currentPeriodEnd = new Date(response.current_period_end);
  const trialEnd = new Date(response.trial_end_date);
  
  // Determine if the plan should be marked as 'expired'
  let plan: 'free_trial' | 'quarterly' | 'annual' | 'expired' = response.plan;
  if (!response.is_active && response.days_remaining === 0) {
    plan = 'expired';
  }
  
  return {
    is_active: response.is_active,
    plan: plan,
    trial_end_date: response.trial_end_date,
    current_period_end: response.current_period_end,
    status: response.status,
    grace_period_end: response.grace_period_end,
    days_remaining: response.days_remaining // Now this matches the interface
  };
}


  private getMockSubscription(): SubscriptionStatus {
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 60);
  
  return {
    is_active: true,
    plan: 'free_trial',
    trial_end_date: trialEnd.toISOString().split('T')[0],
    current_period_end: trialEnd.toISOString().split('T')[0],
    status: 'trialing',
    days_remaining: 60 // Add this
  };
}

  // Initiate payment with real API
  initiatePayment(plan: 'quarterly' | 'annual', phoneNumber: string): Observable<any> {
    return this.apiService.initiateSubscriptionPayment(plan, phoneNumber);
  }

  // Verify payment with real API
  verifyPayment(transactionId: string, plan: 'quarterly' | 'annual'): Observable<any> {
    return this.apiService.verifySubscriptionPayment(transactionId, plan);
  }

  // ... rest of your existing methods remain the same
  isPaid(): boolean {
    const status = this.subscriptionStatus.value;
    return status?.status === 'active' && status.plan !== 'free_trial';
  }

  isTrial(): boolean {
    const status = this.subscriptionStatus.value;
    return status?.status === 'trialing' && status.plan === 'free_trial';
  }


  
  // Check if in grace period
  isGracePeriod(): boolean {
    const status = this.subscriptionStatus.value;
    if (!status?.grace_period_end) return false;
    
    const graceEnd = new Date(status.grace_period_end);
    return new Date() <= graceEnd;
  }

  // Check if can perform write operations
  canCreate(): boolean {
    return this.isPaid() || this.isTrial();
  }

  canUpdate(): boolean {
    return this.isPaid() || this.isTrial();
  }

  canDelete(): boolean {
    return this.isPaid() || this.isTrial();
  }

  // Check if read-only mode
  isReadOnly(): boolean {
    return !this.canCreate() && this.isGracePeriod();
  }

  // Check if completely expired (no access)
  isExpired(): boolean {
    return !this.isPaid() && !this.isTrial() && !this.isGracePeriod();
  }

  // Get subscription status for display
  getStatus(): SubscriptionStatus | null {
    return this.subscriptionStatus.value;
  }


  // Check payment status
  checkPaymentStatus(transactionId: string): Observable<any> {
    // TODO: Replace with actual API call
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({ 
          status: 'completed',
          transaction_id: transactionId
        });
        observer.complete();
      }, 1000);
    });
  }
}
