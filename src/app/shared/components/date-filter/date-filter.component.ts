import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { format, subDays } from 'date-fns';

@Component({
  selector: 'app-date-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative">
      <button
        class="lg:w-auto w-full h-9 rounded-md px-3 font-normal bg-white/10 hover:bg-white/20 text-white border-none outline-none focus:bg-white/30 transition text-sm flex items-center gap-2"
        (click)="toggle()"
      >
        <span>{{ label() }}</span>
        <svg class="size-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      @if (isOpen()) {
        <div class="absolute top-10 right-0 bg-white rounded-xl shadow-lg p-4 z-50 min-w-[260px]">
          <div class="grid grid-cols-2 gap-2 mb-3">
            <div>
              <label class="block text-xs text-gray-500 mb-1">From</label>
              <input type="date" [(ngModel)]="fromDate" class="w-full border rounded-md px-2 py-1 text-sm" />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">To</label>
              <input type="date" [(ngModel)]="toDate" class="w-full border rounded-md px-2 py-1 text-sm" />
            </div>
          </div>
          <div class="flex gap-2">
            <button
              class="flex-1 px-3 py-1.5 border rounded-md text-sm hover:bg-gray-50"
              (click)="reset()"
            >Reset</button>
            <button
              class="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              (click)="apply()"
            >Apply</button>
          </div>
        </div>
        <div class="fixed inset-0 z-40" (click)="isOpen.set(false)"></div>
      }
    </div>
  `,
})
export class DateFilterComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isOpen = signal(false);
  fromDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');
  toDate = format(new Date(), 'yyyy-MM-dd');

  ngOnInit() {
    const params = this.route.snapshot.queryParamMap;
    if (params.get('from')) this.fromDate = params.get('from')!;
    if (params.get('to')) this.toDate = params.get('to')!;
  }

  label() {
    try {
      const from = new Date(this.fromDate);
      const to = new Date(this.toDate);
      return `${format(from, 'LLL dd')} - ${format(to, 'LLL dd, y')}`;
    } catch { return 'Select dates'; }
  }

  toggle() { this.isOpen.update(v => !v); }

  apply() {
    const query = { ...this.route.snapshot.queryParams, from: this.fromDate, to: this.toDate };
    this.router.navigate([], { queryParams: query });
    this.isOpen.set(false);
  }

  reset() {
    this.fromDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');
    this.toDate = format(new Date(), 'yyyy-MM-dd');
    const query = { ...this.route.snapshot.queryParams };
    delete query['from'];
    delete query['to'];
    this.router.navigate([], { queryParams: query });
    this.isOpen.set(false);
  }
}
