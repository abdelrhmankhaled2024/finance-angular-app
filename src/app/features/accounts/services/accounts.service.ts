import { Injectable, inject } from '@angular/core';
import { FinanceDataService } from '../../../shared/services/finance-data.service';

export type { Account } from '../../../shared/services/finance-data.service';

/**
 * AccountsService
 * Thin wrapper — delegates entirely to FinanceDataService.
 * Keeps the same public API that components already depend on,
 * but now uses localStorage instead of HTTP calls.
 */
@Injectable({ providedIn: 'root' })
export class AccountsService {
  private data = inject(FinanceDataService);

  // Expose signals directly
  accounts  = this.data.accounts;
  isLoading = this.data.isLoadingAccounts;
  isPending = this.data.isPending;

  loadAll()                               { this.data.loadAccounts(); }
  getOne(id: string)                      { return this.data.getAccount(id); }
  create(payload: { name: string })       { this.data.createAccount(payload.name); }
  update(id: string, p: { name: string }) { this.data.updateAccount(id, p.name); }
  delete(id: string)                      { this.data.deleteAccount(id); }
  bulkDelete(ids: string[])               { this.data.bulkDeleteAccounts(ids); }
}
