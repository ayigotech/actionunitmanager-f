


import { Injectable, inject } from '@angular/core';
import { SubscriptionService } from './subscription';

@Injectable({
  providedIn: 'root'
})
export class FeatureGuard {
  private subscriptionService = inject(SubscriptionService);

  // Check if user can perform specific actions
  canCreate(): boolean {
    return this.subscriptionService.canCreate();
  }

  canUpdate(): boolean {
    return this.subscriptionService.canUpdate();
  }

  canDelete(): boolean {
    return this.subscriptionService.canDelete();
  }

  // Check if in read-only mode
  isReadOnly(): boolean {
    return this.subscriptionService.isReadOnly();
  }

  // Check if completely expired
  isExpired(): boolean {
    return this.subscriptionService.isExpired();
  }

  // Get permission message for UI
  getPermissionMessage(): string {
    if (this.subscriptionService.isTrial()) {
      return 'Free trial active - Full access';
    } else if (this.subscriptionService.isGracePeriod()) {
      return 'Read-only mode - Subscribe to edit';
    } else if (this.subscriptionService.isExpired()) {
      return 'Subscription expired - Subscribe to continue';
    } else {
      return 'Full access';
    }
  }

  // Get button color based on permissions
  getButtonColor(requiredPermission: boolean): string {
    return requiredPermission ? 'primary' : 'medium';
  }

  // Show tooltip message for disabled buttons
  getTooltipMessage(): string {
    if (this.subscriptionService.isGracePeriod()) {
      return 'Subscribe to enable this feature';
    } else if (this.subscriptionService.isExpired()) {
      return 'Subscription expired - Renew to continue';
    }
    return '';
  }
}
