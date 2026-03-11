import { Injectable, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { format, subDays } from 'date-fns';

@Injectable({ providedIn: 'root' })
export class FiltersService {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  params$ = this.route.queryParamMap.pipe(
    map(params => ({
      from: params.get('from') || '',
      to: params.get('to') || '',
      accountId: params.get('accountId') || '',
    }))
  );

  updateFilters(filters: { from?: string; to?: string; accountId?: string }) {
    const current = this.route.snapshot.queryParams;
    const query: Record<string, string> = { ...current };

    if (filters.from !== undefined) query['from'] = filters.from;
    if (filters.to !== undefined) query['to'] = filters.to;
    if (filters.accountId !== undefined) query['accountId'] = filters.accountId;

    // Remove empty values
    Object.keys(query).forEach(k => { if (!query[k]) delete query[k]; });

    this.router.navigate([], { queryParams: query, queryParamsHandling: 'merge' });
  }

  getDefaultDateRange() {
    const to = new Date();
    const from = subDays(to, 30);
    return {
      from: format(from, 'yyyy-MM-dd'),
      to: format(to, 'yyyy-MM-dd'),
    };
  }
}
