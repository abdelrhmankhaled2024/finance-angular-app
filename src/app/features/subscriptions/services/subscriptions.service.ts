import { Injectable, inject } from '@angular/core';
import { FinanceDataService } from '../../../shared/services/finance-data.service';
import { of } from 'rxjs';

export type { Subscription } from '../../../shared/services/finance-data.service';

/**
 * SubscriptionsService
 * Thin wrapper — delegates entirely to FinanceDataService.
 */
@Injectable({ providedIn: 'root' })
export class SubscriptionsService {
  private data = inject(FinanceDataService);

  subscription = this.data.subscription;
  isLoading    = this.data.isLoadingSummary; // reuse — both fast
  isPending    = this.data.isPending;

  get shouldBlock() { return this.data.shouldBlock; }

  load()     { this.data.loadSubscription(); }
  // checkout() kept as Observable for template compatibility
  checkout() { this.data.checkoutSubscription(); return of(null); }
}
