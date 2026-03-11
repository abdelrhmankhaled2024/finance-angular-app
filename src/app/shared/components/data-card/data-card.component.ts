import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value);
}
function formatPercentage(value: number, addPrefix = false) {
  const result = new Intl.NumberFormat('en-US', { style: 'percent' }).format(value / 100);
  return addPrefix && value > 0 ? `+${result}` : result;
}

@Component({
  selector: 'app-data-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="border-none drop-shadow-sm bg-white rounded-xl p-6">
      <div class="flex flex-row items-center justify-between gap-x-4 mb-4">
        <div class="space-y-2">
          <h3 class="text-2xl font-semibold line-clamp-1">{{ title() }}</h3>
          <p class="text-sm text-gray-500 line-clamp-1">{{ dateRange() }}</p>
        </div>
        <div class="shrink-0 rounded-md p-3" [ngClass]="boxClass()">
          <ng-content select="[icon]"></ng-content>
          @if (iconType() === 'piggy') {
            <svg class="size-6" [ngClass]="iconClass()" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 11H7.83l4.88-4.88c.39-.39.39-1.03 0-1.42-.39-.39-1.02-.39-1.41 0l-6.59 6.59c-.39.39-.39 1.02 0 1.41l6.59 6.59c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L7.83 13H19c.55 0 1-.45 1-1s-.45-1-1-1z"/>
            </svg>
          } @else if (iconType() === 'up') {
            <svg class="size-6" [ngClass]="iconClass()" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
            </svg>
          } @else {
            <svg class="size-6" [ngClass]="iconClass()" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 18l2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6z"/>
            </svg>
          }
        </div>
      </div>
      <h1 class="font-bold text-2xl mb-2 line-clamp-1 break-all">{{ formatCurrency(value()) }}</h1>
      <p class="text-sm line-clamp-1" [ngClass]="pctClass()">
        {{ formatPct(percentageChange()) }} from last period
      </p>
    </div>
  `,
})
export class DataCardComponent {
  title = input.required<string>();
  value = input<number>(0);
  dateRange = input.required<string>();
  percentageChange = input<number>(0);
  variant = input<'default' | 'success' | 'danger'>('default');
  iconType = input<'piggy' | 'up' | 'down'>('piggy');

  formatCurrency = formatCurrency;

  boxClass() {
    return {
      'bg-blue-500/20': this.variant() === 'default',
      'bg-emerald-500/20': this.variant() === 'success',
      'bg-rose-500/20': this.variant() === 'danger',
    };
  }

  iconClass() {
    return {
      'text-blue-500': this.variant() === 'default',
      'text-emerald-500': this.variant() === 'success',
      'text-rose-500': this.variant() === 'danger',
    };
  }

  pctClass() {
    const pct = this.percentageChange();
    return {
      'text-gray-500': pct === 0,
      'text-emerald-500': pct > 0,
      'text-rose-500': pct < 0,
    };
  }

  formatPct(v: number) { return formatPercentage(v, true); }
}
