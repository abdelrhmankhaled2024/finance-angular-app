import { Injectable, inject } from '@angular/core';
import { FinanceDataService } from '../../../shared/services/finance-data.service';

export type { SummaryData } from '../../../shared/services/finance-data.service';

/**
 * SummaryService
 * Thin wrapper — delegates entirely to FinanceDataService.
 * Converts miliunits → display units so components remain unchanged.
 */
@Injectable({ providedIn: 'root' })
export class SummaryService {
  private data = inject(FinanceDataService);

  isLoading = this.data.isLoadingSummary;

  /** Returns summary with amounts already converted from miliunits (÷1000) */
  get summary() {
    return this.data.summary;
  }

  load(filters: { from?: string; to?: string; accountId?: string } = {}) {
    this.data.loadSummary(filters);
  }
}
