import { Component } from '@angular/core';
import { AccountFilterComponent } from '../account-filter/account-filter.component';
import { DateFilterComponent } from '../date-filter/date-filter.component';

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [AccountFilterComponent, DateFilterComponent],
  template: `
    <div class="flex flex-col lg:flex-row items-center gap-y-2 lg:gap-y-0 lg:gap-x-2">
      <app-account-filter />
      <app-date-filter />
    </div>
  `,
})
export class FiltersComponent {}
