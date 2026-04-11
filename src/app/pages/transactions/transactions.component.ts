import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TransactionsService, Transaction } from '../../features/transactions/services/transactions.service';
import { TransactionSheetService } from '../../features/transactions/services/transaction-sheet.service';
import { AccountsService } from '../../features/accounts/services/accounts.service';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { format } from 'date-fns';

function formatCurrency(v: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v / 1000);
}

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, DataTableComponent],
  template: `
    <div class="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      <div class="bg-white rounded-xl border-none drop-shadow-sm">
        @if (txService.isLoading()) {
          <div class="p-6">
            <div class="h-8 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div class="h-[500px] flex items-center justify-center">
              <div class="size-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          </div>
        } @else {
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-y-2 p-6 pb-2">
            <h1 class="text-xl font-semibold line-clamp-1">Transaction History</h1>
            <div class="flex flex-col lg:flex-row gap-2">
              <button (click)="sheetService.openNew()"
                class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 justify-center">
                <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Add new
              </button>
              <label class="flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50 cursor-pointer justify-center">
                <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                </svg>
                Import CSV
                <input type="file" accept=".csv" class="hidden" (change)="onFileUpload($event)" />
              </label>
            </div>
          </div>
          <div class="p-6 pt-0">
            <app-data-table
              [columns]="columns"
              [data]="txService.transactions()"
              filterKey="payee"
              [disabled]="txService.isPending()"
              (rowEdit)="sheetService.openEdit($event)"
              (bulkDelete)="onBulkDelete($event)"
            />
          </div>
        }
      </div>
    </div>
  `,
})
export class TransactionsComponent implements OnInit {
  txService       = inject(TransactionsService);
  sheetService    = inject(TransactionSheetService);
  accountsService = inject(AccountsService);
  private route   = inject(ActivatedRoute);

  columns: TableColumn<Transaction>[] = [
    { key: 'date',         label: 'Date',     sortable: true, render: row => format(new Date(row.date), 'MMM dd, yyyy') },
    { key: 'categoryName', label: 'Category', sortable: true, render: row => row.categoryName ?? '-' },
    { key: 'payee',        label: 'Payee',    sortable: true },
    { key: 'amount',       label: 'Amount',   sortable: true, render: row => formatCurrency(row.amount) },
    { key: 'accountName',  label: 'Account',  sortable: true },
  ];

  ngOnInit() {
    const p = this.route.snapshot.queryParamMap;
    this.txService.loadAll({
      from:      p.get('from')      || undefined,
      to:        p.get('to')        || undefined,
      accountId: p.get('accountId') || undefined,
    });
  }

  onBulkDelete(ids: string[]) { this.txService.bulkDelete(ids); }

  onFileUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    // Basic CSV import — parse and bulk-create
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      if (lines.length < 2) return;
      const defaultAcct = this.accountsService.accounts()[0];
      if (!defaultAcct) return;
      const rows = lines.slice(1).map(line => {
        const [date, payee, amount] = line.split(',').map(s => s.trim().replace(/"/g,''));
        return {
          date:      new Date(date || new Date()),
          accountId: defaultAcct.id,
          payee:     payee || 'Unknown',
          amount:    Math.round(parseFloat(amount || '0') * 1000),
        };
      }).filter(r => r.payee && !isNaN(r.amount));
      this.txService.bulkCreate(rows);
    };
    reader.readAsText(file);
  }
}
