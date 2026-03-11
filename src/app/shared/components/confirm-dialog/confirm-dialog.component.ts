import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="fixed inset-0 bg-black/40" (click)="cancelled.emit()"></div>
        <div class="relative bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4 z-10">
          <h2 class="text-lg font-semibold mb-2">{{ title() }}</h2>
          <p class="text-gray-500 text-sm mb-6">{{ message() }}</p>
          <div class="flex gap-3 justify-end">
            <button
              class="px-4 py-2 border rounded-md text-sm hover:bg-gray-50"
              (click)="cancelled.emit()"
            >Cancel</button>
            <button
              class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              (click)="confirmed.emit()"
            >Confirm</button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  title = input<string>('Are you sure?');
  message = input<string>('This action cannot be undone.');
  isOpen = input<boolean>(false);
  confirmed = output<void>();
  cancelled = output<void>();
}
