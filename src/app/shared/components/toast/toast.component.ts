import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium flex items-center gap-2 min-w-[200px] max-w-[350px]"
          [class.bg-emerald-500]="toast.type === 'success'"
          [class.bg-rose-500]="toast.type === 'error'"
          [class.bg-blue-500]="toast.type === 'info'"
        >
          @if (toast.type === 'success') { <span>✓</span> }
          @if (toast.type === 'error') { <span>✕</span> }
          <span>{{ toast.message }}</span>
          <button class="ml-auto opacity-70 hover:opacity-100" (click)="toastService.remove(toast.id)">×</button>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  toastService = inject(ToastService);
}
