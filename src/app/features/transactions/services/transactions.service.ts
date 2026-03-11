import { Injectable, inject } from '@angular/core';
import { FinanceDataService } from '../../../shared/services/finance-data.service';

export type { Transaction } from '../../../shared/services/finance-data.service';

export interface TransactionCreate {
  date: Date;
  accountId: string;
  categoryId?: string | null;
  payee: string;
  amount: number;   // miliunits
  notes?: string | null;
}

/**
 * TransactionsService
 * Thin wrapper — delegates entirely to FinanceDataService.
 */
@Injectable({ providedIn: 'root' })
export class TransactionsService {
  private data = inject(FinanceDataService);

  transactions = this.data.transactions;
  isLoading    = this.data.isLoadingTransactions;
  isPending    = this.data.isPending;

  loadAll(filters: { from?: string; to?: string; accountId?: string } = {}) {
    this.data.loadTransactions(filters);
  }
  getOne(id: string)                        { return this.data.getTransaction(id); }
  create(payload: TransactionCreate)        { this.data.createTransaction(payload); }
  update(id: string, p: Partial<TransactionCreate>) { this.data.updateTransaction(id, p); }
  delete(id: string)                        { this.data.deleteTransaction(id); }
  bulkDelete(ids: string[])                 { this.data.bulkDeleteTransactions(ids); }
  bulkCreate(rows: TransactionCreate[])     { this.data.bulkCreateTransactions(rows); }
}
