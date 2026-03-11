import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubscriptionsService } from '../../features/subscriptions/services/subscriptions.service';
import { SubscriptionModalService } from '../../features/subscriptions/services/subscription-modal.service';
import { FinanceDataService } from '../../shared/services/finance-data.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      <div class="bg-white rounded-xl border-none drop-shadow-sm p-6">
        <h1 class="text-xl font-semibold mb-6">Settings</h1>

        <!-- Subscription Card -->
        <div class="border rounded-xl p-6 mb-6">
          <h2 class="text-lg font-medium mb-2">Subscription</h2>
          @if (subsService.subscription()) {
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                [class.bg-emerald-100]="subsService.subscription()!.status !== 'expired'"
                [class.text-emerald-800]="subsService.subscription()!.status !== 'expired'"
                [class.bg-gray-100]="subsService.subscription()!.status === 'expired'"
                [class.text-gray-600]="subsService.subscription()!.status === 'expired'"
              >
                {{ subsService.subscription()!.status === 'expired' ? 'Expired' : 'Active' }}
              </span>
            </div>
          } @else {
            <div class="flex items-center gap-3">
              <span class="text-sm text-gray-500">No active subscription</span>
              <button (click)="modalService.open()"
                class="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                Upgrade
              </button>
            </div>
          }
        </div>

        <!-- Reset Data -->
        <div class="border rounded-xl p-6">
          <h2 class="text-lg font-medium mb-2">Data</h2>
          <p class="text-sm text-gray-500 mb-4">Reset all data back to the original seed state.</p>
          <button
            (click)="resetData()"
            class="px-4 py-2 border border-red-300 text-red-600 rounded-md text-sm hover:bg-red-50">
            Reset to seed data
          </button>
        </div>
      </div>
    </div>
  `,
})
export class SettingsComponent implements OnInit {
  subsService   = inject(SubscriptionsService);
  modalService  = inject(SubscriptionModalService);
  private fin   = inject(FinanceDataService);

  ngOnInit() { this.subsService.load(); }

  resetData() {
    if (!confirm('Reset all data to seed state? This cannot be undone.')) return;
    this.fin.resetToSeedData().subscribe(() => window.location.reload());
  }
}
