import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SummaryService } from '../../../features/summary/services/summary.service';
import { ChartComponent } from '../chart/chart.component';
import { SpendingPieComponent } from '../spending-pie/spending-pie.component';

// Convert miliunits to dollars for chart display
function daysFromMiliunits(days: { date: string; income: number; expenses: number }[]) {
  return days.map(d => ({
    date:     d.date,
    income:   d.income   / 1000,
    expenses: d.expenses / 1000,
  }));
}
function catsFromMiliunits(cats: { name: string; value: number }[]) {
  return cats.map(c => ({ name: c.name, value: c.value / 1000 }));
}

@Component({
  selector: 'app-data-charts',
  standalone: true,
  imports: [CommonModule, ChartComponent, SpendingPieComponent],
  template: `
    @if (summaryService.isLoading()) {
      <div class="grid grid-cols-1 lg:grid-cols-6 gap-8">
        <div class="col-span-1 lg:col-span-3 xl:col-span-4 bg-white rounded-xl h-[450px] drop-shadow-sm animate-pulse"></div>
        <div class="col-span-1 lg:col-span-3 xl:col-span-2 bg-white rounded-xl h-[450px] drop-shadow-sm animate-pulse"></div>
      </div>
    } @else {
      <div class="grid grid-cols-1 lg:grid-cols-6 gap-8">
        <div class="col-span-1 lg:col-span-3 xl:col-span-4">
          <app-chart [data]="chartDays" />
        </div>
        <div class="col-span-1 lg:col-span-3 xl:col-span-2">
          <app-spending-pie [data]="chartCats" />
        </div>
      </div>
    }
  `,
})
export class DataChartsComponent implements OnInit {
  summaryService = inject(SummaryService);
  private route  = inject(ActivatedRoute);

  get chartDays() { return daysFromMiliunits(this.summaryService.summary()?.days ?? []); }
  get chartCats() { return catsFromMiliunits(this.summaryService.summary()?.categories ?? []); }

  ngOnInit() {
    const p = this.route.snapshot.queryParamMap;
    this.summaryService.load({
      from:      p.get('from')      || undefined,
      to:        p.get('to')        || undefined,
      accountId: p.get('accountId') || undefined,
    });
  }
}
