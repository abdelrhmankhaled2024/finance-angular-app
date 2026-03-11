import {
  Component, input, signal, inject,
  AfterViewInit, OnChanges, OnDestroy, ElementRef, ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartType, registerables } from 'chart.js';
import { format } from 'date-fns';
import { SubscriptionsService } from '../../../features/subscriptions/services/subscriptions.service';
import { SubscriptionModalService } from '../../../features/subscriptions/services/subscription-modal.service';

Chart.register(...registerables);

type DayData = { date: string; income: number; expenses: number };

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="border-none drop-shadow-sm bg-white rounded-xl p-6">
      <div class="flex space-y-2 lg:space-y-0 lg:flex-row lg:items-center justify-between mb-4">
        <h3 class="text-xl font-semibold line-clamp-1">Transactions</h3>
        <select [value]="chartType()" (change)="onTypeChange($event)"
          class="lg:w-auto h-9 rounded-md px-3 border text-sm">
          <option value="area">Area chart</option>
          <option value="line">Line chart</option>
          <option value="bar">Bar chart</option>
        </select>
      </div>

      @if (!data() || data()!.length === 0) {
        <div class="flex flex-col gap-y-4 items-center justify-center h-[350px] w-full text-gray-400">
          <svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <p class="text-sm">No data for this period</p>
        </div>
      } @else {
        <div style="position:relative; height:350px;">
          <canvas #chartCanvas></canvas>
        </div>
      }
    </div>
  `,
})
export class ChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('chartCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  data      = input<DayData[]>([]);
  chartType = signal<'area' | 'line' | 'bar'>('area');

  private subs  = inject(SubscriptionsService);
  private modal = inject(SubscriptionModalService);
  private chart: Chart | null = null;

  ngAfterViewInit() { this.buildChart(); }
  ngOnChanges()     { this.buildChart(); }
  ngOnDestroy()     { this.chart?.destroy(); }

  private buildChart() {
    if (!this.canvasRef) return;
    const d    = this.data() ?? [];
    const type = this.chartType();
    const isBar  = type === 'bar';
    const isArea = type === 'area';

    this.chart?.destroy();
    this.chart = new Chart(this.canvasRef.nativeElement, {
      type: isBar ? 'bar' : 'line',
      data: {
        labels: d.map(r => format(new Date(r.date), 'dd MMM')),
        datasets: [
          {
            label: 'Income',
            data: d.map(r => r.income),
            borderColor: '#3b82f6',
            backgroundColor: isArea ? 'rgba(59,130,246,0.15)' : '#3b82f6',
            fill: isArea,
            tension: 0.4,
            pointRadius: 0,
            borderWidth: 2,
          },
          {
            label: 'Expenses',
            data: d.map(r => r.expenses),
            borderColor: '#f43f5e',
            backgroundColor: isArea ? 'rgba(244,63,94,0.15)' : '#f43f5e',
            fill: isArea,
            tension: 0.4,
            pointRadius: 0,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: true, position: 'top' },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.dataset.label}: $${(ctx.parsed.y ?? 0).toFixed(2)}`,
            },
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { maxRotation: 0 } },
          y: { grid: { color: '#f3f4f6' }, ticks: { callback: v => `$${v}` } },
        },
      },
    });
  }

  onTypeChange(event: Event) {
    const type = (event.target as HTMLSelectElement).value as 'area' | 'line' | 'bar';
    if (type !== 'area' && this.subs.shouldBlock) { this.modal.open(); return; }
    this.chartType.set(type);
    this.buildChart();
  }
}
