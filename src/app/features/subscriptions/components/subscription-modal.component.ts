import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubscriptionModalService } from '../services/subscription-modal.service';
import { SubscriptionsService } from '../services/subscriptions.service';

@Component({
  selector: 'app-subscription-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (modalService.isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="fixed inset-0 bg-black/40" (click)="modalService.close()"></div>
        <div class="relative bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4 z-10">
          <div class="flex flex-col items-center space-y-4 mb-4">
            <img src="logo-dark.svg" alt="Logo" class="h-9 w-9" />
            <h2 class="text-lg font-semibold text-center">Upgrade to a paid plan</h2>
            <p class="text-sm text-gray-500 text-center">Unlock more features with a premium subscription</p>
          </div>
          <hr class="mb-4" />
          <ul class="space-y-2 mb-6">
            @for (feature of features; track feature) {
              <li class="flex items-center gap-2">
                <svg class="size-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <span class="text-sm text-gray-500">{{ feature }}</span>
              </li>
            }
          </ul>
          <button
            [disabled]="subsService.isPending()"
            (click)="subsService.checkout().subscribe()"
            class="w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >Upgrade</button>
        </div>
      </div>
    }
  `,
})
export class SubscriptionModalComponent {
  modalService = inject(SubscriptionModalService);
  subsService = inject(SubscriptionsService);
  features = ['Bank account syncing', 'Upload CSV files', 'Different chart types'];
}
