import {
  Component, input, signal, inject,
  AfterViewInit, OnChanges, OnDestroy, ViewChild, ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { SubscriptionsService } from '../../../features/subscriptions/services/subscriptions.service';
import { SubscriptionModalService } from '../../../features/subscriptions/services/subscription-modal.service';

Chart.register(...registerables);

const COLORS = ['#0062FF','#12C6FF','#FF647F','#FF9354','#8B5CF6','#10B981'];

@Component({
  selector: 'app-spending-pie',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="border-none drop-shadow-sm bg-white rounded-xl p-6">
      <div class="flex space-y-2 lg:space-y-0 lg:flex-row lg:items-center justify-between mb-4">
        <h3 class="text-xl font-semibold line-clamp-1">Categories</h3>
        <select [value]="chartType()" (change)="onTypeChange($event)"
          class="lg:w-auto h-9 rounded-md px-3 border text-sm">
          <option value="pie">Pie chart</option>
          <option value="doughnut">Doughnut chart</option>
          <option value="radar">Radar chart</option>
        </select>
      </div>

      @if (!data() || data()!.length === 0) {
        <div class="flex flex-col gap-y-4 items-center justify-center h-[350px] text-gray-400">
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
export class SpendingPieComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('chartCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  data      = input<{ name: string; value: number }[]>([]);
  chartType = signal<'pie' | 'doughnut' | 'radar'>('pie');

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

    this.chart?.destroy();
    this.chart = new Chart(this.canvasRef.nativeElement, {
      type,
      data: {
        labels: d.map(i => i.name),
        datasets: [{
          data: d.map(i => i.value),
          backgroundColor: COLORS,
          borderColor: '#fff',
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.label}: $${(ctx.parsed ?? 0).toFixed(2)}`,
            },
          },
        },
      },
    });
  }

  onTypeChange(event: Event) {
    const type = (event.target as HTMLSelectElement).value as 'pie' | 'doughnut' | 'radar';
    if (type !== 'pie' && this.subs.shouldBlock) { this.modal.open(); return; }
    this.chartType.set(type);
    this.buildChart();
  }
}
