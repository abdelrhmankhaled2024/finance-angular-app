import { Component } from '@angular/core';
import { DataGridComponent } from '../../shared/components/data-grid/data-grid.component';
import { DataChartsComponent } from '../../shared/components/data-charts/data-charts.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [DataGridComponent, DataChartsComponent],
  template: `
    <div class="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      <app-data-grid />
      <app-data-charts />
    </div>
  `,
})
export class HomeComponent {}
