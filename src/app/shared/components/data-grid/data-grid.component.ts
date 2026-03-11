import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SummaryService } from '../../../features/summary/services/summary.service';
import { DataCardComponent } from '../data-card/data-card.component';
import { format, subDays } from 'date-fns';

function formatDateRange(from?: string, to?: string) {
  const defaultTo = new Date();
  const defaultFrom = subDays(defaultTo, 30);
  const f = from ? new Date(from) : defaultFrom;
  const t = to   ? new Date(to)   : defaultTo;
  return `${format(f, 'LLL dd')} - ${format(t, 'LLL dd, y')}`;
}

// Convert miliunits to dollars for display
function fromMiliunits(v: number) { return v / 1000; }

@Component({
  selector: 'app-data-grid',
  standalone: true,
  imports: [CommonModule, DataCardComponent],
  template: `
    @if (summaryService.isLoading()) {
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-2 mb-8">
        @for (i of [1,2,3]; track i) {
          <div class="bg-white rounded-xl h-[192px] drop-shadow-sm animate-pulse"></div>
        }
      </div>
    } @else {
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-2 mb-8">
        <app-data-card
          title="Remaining"
          [value]="fromMiliunits(summaryService.summary()?.remainingAmount ?? 0)"
          [percentageChange]="summaryService.summary()?.remainingChange ?? 0"
          [dateRange]="dateRangeLabel"
          variant="default"
          iconType="piggy"
        />
        <app-data-card
          title="Income"
          [value]="fromMiliunits(summaryService.summary()?.incomeAmount ?? 0)"
          [percentageChange]="summaryService.summary()?.incomeChange ?? 0"
          [dateRange]="dateRangeLabel"
          variant="success"
          iconType="up"
        />
        <app-data-card
          title="Expenses"
          [value]="fromMiliunits(summaryService.summary()?.expensesAmount ?? 0)"
          [percentageChange]="summaryService.summary()?.expensesChange ?? 0"
          [dateRange]="dateRangeLabel"
          variant="danger"
          iconType="down"
        />
      </div>
    }
  `,
})
export class DataGridComponent implements OnInit {
  summaryService = inject(SummaryService);
  private route  = inject(ActivatedRoute);
  dateRangeLabel = '';
  fromMiliunits  = fromMiliunits;

  ngOnInit() {
    const p = this.route.snapshot.queryParamMap;
    const from      = p.get('from')      || undefined;
    const to        = p.get('to')        || undefined;
    const accountId = p.get('accountId') || undefined;
    this.dateRangeLabel = formatDateRange(from, to);
    this.summaryService.load({ from, to, accountId });
  }
}
