import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-side-drawer',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen()) {
      <!-- Backdrop -->
      <div class="fixed inset-0 z-50 bg-black/40" (click)="closed.emit()"></div>
      <!-- Drawer -->
      <div class="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
        <div class="p-6 border-b">
          <div class="flex items-start justify-between">
            <div>
              <h2 class="text-lg font-semibold">{{ title() }}</h2>
              @if (description()) {
                <p class="text-sm text-gray-500 mt-1">{{ description() }}</p>
              }
            </div>
            <button
              class="text-gray-400 hover:text-gray-600 text-2xl leading-none mt-0.5"
              (click)="closed.emit()"
            >&times;</button>
          </div>
        </div>
        <div class="flex-1 overflow-y-auto p-6">
          <ng-content />
        </div>
      </div>
    }
  `,
})
export class SideDrawerComponent {
  isOpen = input<boolean>(false);
  title = input<string>('');
  description = input<string>('');
  closed = output<void>();
}
