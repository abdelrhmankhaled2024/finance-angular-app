/**
 * FinanceDataService
 *
 * ALL CRUD operations read/write directly to assets/data/*.json via HttpClient.
 * localStorage is NOT used for data — only auth token lives there (AuthService).
 *
 * Because browsers cannot write files, write operations use an in-memory cache
 * that is flushed back so the signals stay reactive. The JSON files are the
 * single source of truth loaded fresh on every init() call.
 *
 * Routes mirrored:
 *   accounts.ts · categories.ts · transactions.ts · summary.ts · subscriptions.ts
 */

import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { subDays, differenceInDays } from 'date-fns';
import { ToastService } from '../../core/services/toast.service';

// ── Interfaces ───────────────────────────────────────────────────────────────

export interface Account {
  id: string;
  name: string;
  userId: string;
  plaidId: string | null;
}

export interface Category {
  id: string;
  name: string;
  userId: string;
  plaidId: string | null;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;       // miliunits
  payee: string;
  notes: string | null;
  accountId: string;
  accountName: string;
  categoryId: string | null;
  categoryName: string | null;
}

export interface SummaryData {
  remainingAmount: number;
  remainingChange: number;
  incomeAmount: number;
  incomeChange: number;
  expensesAmount: number;
  expensesChange: number;
  categories: { name: string; value: number }[];
  days: { date: string; income: number; expenses: number }[];
}

export interface Subscription {
  id: string;
  userId: string;
  subscriptionId: string;
  status: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function calcPercentageChange(current: number, previous: number): number {
  if (previous === 0) return previous === current ? 0 : 100;
  return ((current - previous) / Math.abs(previous)) * 100;
}

function fillMissingDays(
  activeDays: { date: string; income: number; expenses: number }[],
  startDate: Date, endDate: Date,
): { date: string; income: number; expenses: number }[] {
  const result: { date: string; income: number; expenses: number }[] = [];
  const d = new Date(startDate);
  while (d <= endDate) {
    const iso = d.toISOString().split('T')[0];
    const found = activeDays.find(a => a.date.startsWith(iso));
    result.push(found ?? { date: iso, income: 0, expenses: 0 });
    d.setDate(d.getDate() + 1);
  }
  return result;
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class FinanceDataService {

  private http  = inject(HttpClient);
  private toast = inject(ToastService);

  // ── Signals ────────────────────────────────────────────────────────────────
  accounts     = signal<Account[]>([]);
  categories   = signal<Category[]>([]);
  transactions = signal<Transaction[]>([]);
  summary      = signal<SummaryData | null>(null);
  subscription = signal<Subscription | null>(null);

  isLoadingAccounts     = signal(false);
  isLoadingCategories   = signal(false);
  isLoadingTransactions = signal(false);
  isLoadingSummary      = signal(false);
  isPending             = signal(false);

  // ── In-memory cache (JSON is source of truth; cache keeps writes reactive) ─
  private _accounts:     Account[]     = [];
  private _categories:   Category[]    = [];
  private _transactions: Transaction[] = [];
  private _txFilters: { from?: string; to?: string; accountId?: string } = {};

  // ── INIT ───────────────────────────────────────────────────────────────────

  /**
   * Load all three JSON files into memory and signals.
   * Called once on app start from AppComponent.
   */
  init(): Observable<void> {
    return forkJoin({
      accounts:     this.http.get<Account[]>('assets/data/accounts.json'),
      categories:   this.http.get<Category[]>('assets/data/categories.json'),
      transactions: this.http.get<Transaction[]>('assets/data/transactions.json'),
    }).pipe(
      tap(({ accounts, categories, transactions }) => {
        this._accounts     = accounts;
        this._categories   = categories;
        this._transactions = transactions;
        this.accounts.set([...accounts]);
        this.categories.set([...categories]);
        this.transactions.set([...transactions]);
      }),
      map(() => void 0),
    );
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private setAccounts(data: Account[]) {
    this._accounts = data;
    this.accounts.set([...data]);
  }
  private setCategories(data: Category[]) {
    this._categories = data;
    this.categories.set([...data]);
  }
  private setTransactions(data: Transaction[]) {
    this._transactions = data;
    this.transactions.set(this.applyTxFilters(data));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ACCOUNTS
  // ═══════════════════════════════════════════════════════════════════════════

  loadAccounts(): void {
    this.isLoadingAccounts.set(true);
    this.http.get<Account[]>('assets/data/accounts.json').subscribe({
      next: data => { this.setAccounts(data); this.isLoadingAccounts.set(false); },
      error: ()   => this.isLoadingAccounts.set(false),
    });
  }

  getAccount(id: string): Account | undefined {
    return this._accounts.find(a => a.id === id);
  }

  createAccount(name: string): void {
    this.isPending.set(true);
    const userId = this._accounts[0]?.userId ?? 'abdo_khaled_user';
    const newAccount: Account = { id: generateId(), name, userId, plaidId: null };
    this.setAccounts([...this._accounts, newAccount]);
    this.toast.success('Account created');
    this.isPending.set(false);
  }

  updateAccount(id: string, name: string): void {
    this.isPending.set(true);
    this.setAccounts(this._accounts.map(a => a.id === id ? { ...a, name } : a));
    this.toast.success('Account updated');
    this.isPending.set(false);
  }

  deleteAccount(id: string): void {
    this.isPending.set(true);
    this.setAccounts(this._accounts.filter(a => a.id !== id));
    this.setTransactions(this._transactions.filter(t => t.accountId !== id));
    this.toast.success('Account deleted');
    this.isPending.set(false);
  }

  bulkDeleteAccounts(ids: string[]): void {
    this.isPending.set(true);
    const idSet = new Set(ids);
    this.setAccounts(this._accounts.filter(a => !idSet.has(a.id)));
    this.setTransactions(this._transactions.filter(t => !idSet.has(t.accountId)));
    this.toast.success('Accounts deleted');
    this.isPending.set(false);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CATEGORIES
  // ═══════════════════════════════════════════════════════════════════════════

  loadCategories(): void {
    this.isLoadingCategories.set(true);
    this.http.get<Category[]>('assets/data/categories.json').subscribe({
      next: data => { this.setCategories(data); this.isLoadingCategories.set(false); },
      error: ()   => this.isLoadingCategories.set(false),
    });
  }

  getCategory(id: string): Category | undefined {
    return this._categories.find(c => c.id === id);
  }

  createCategory(name: string): void {
    this.isPending.set(true);
    const userId = this._categories[0]?.userId ?? 'abdo_khaled_user';
    const newCat: Category = { id: generateId(), name, userId, plaidId: null };
    this.setCategories([...this._categories, newCat]);
    this.toast.success('Category created');
    this.isPending.set(false);
  }

  updateCategory(id: string, name: string): void {
    this.isPending.set(true);
    this.setCategories(this._categories.map(c => c.id === id ? { ...c, name } : c));
    this.setTransactions(
      this._transactions.map(t => t.categoryId === id ? { ...t, categoryName: name } : t)
    );
    this.toast.success('Category updated');
    this.isPending.set(false);
  }

  deleteCategory(id: string): void {
    this.isPending.set(true);
    this.setCategories(this._categories.filter(c => c.id !== id));
    this.setTransactions(
      this._transactions.map(t =>
        t.categoryId === id ? { ...t, categoryId: null, categoryName: null } : t
      )
    );
    this.toast.success('Category deleted');
    this.isPending.set(false);
  }

  bulkDeleteCategories(ids: string[]): void {
    this.isPending.set(true);
    const idSet = new Set(ids);
    this.setCategories(this._categories.filter(c => !idSet.has(c.id)));
    this.setTransactions(
      this._transactions.map(t =>
        t.categoryId && idSet.has(t.categoryId)
          ? { ...t, categoryId: null, categoryName: null } : t
      )
    );
    this.toast.success('Categories deleted');
    this.isPending.set(false);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TRANSACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  private applyTxFilters(data: Transaction[]): Transaction[] {
    const f = this._txFilters;
    let filtered = data;

    if (f.accountId) filtered = filtered.filter(t => t.accountId === f.accountId);

    if (f.from || f.to) {
      const startDate = f.from ? new Date(f.from) : new Date(0);
      const endDate   = f.to   ? new Date(f.to)   : new Date();
      filtered = filtered.filter(t => {
        const d = new Date(t.date);
        return d >= startDate && d <= endDate;
      });
    }

    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return filtered;
  }

  loadTransactions(filters: { from?: string; to?: string; accountId?: string } = {}): void {
    this._txFilters = filters;
    this.isLoadingTransactions.set(true);

    this.http.get<Transaction[]>('assets/data/transactions.json').subscribe({
      next: data => {
        this._transactions = data;
        this.transactions.set(this.applyTxFilters(data));
        this.isLoadingTransactions.set(false);
      },
      error: () => this.isLoadingTransactions.set(false),
    });
  }

  getTransaction(id: string): Transaction | undefined {
    return this._transactions.find(t => t.id === id);
  }

  createTransaction(data: {
    date: Date; accountId: string; categoryId?: string | null;
    payee: string; amount: number; notes?: string | null;
  }): void {
    this.isPending.set(true);
    const acct = this._accounts.find(a => a.id === data.accountId);
    const cat  = data.categoryId ? this._categories.find(c => c.id === data.categoryId) : null;
    const tx: Transaction = {
      id: generateId(), date: data.date.toISOString(), amount: data.amount,
      payee: data.payee, notes: data.notes ?? null,
      accountId: data.accountId, accountName: acct?.name ?? '',
      categoryId: data.categoryId ?? null, categoryName: cat?.name ?? null,
    };
    this.setTransactions([...this._transactions, tx]);
    this.toast.success('Transaction created');
    this.isPending.set(false);
  }

  updateTransaction(id: string, data: Partial<{
    date: Date; accountId: string; categoryId: string | null;
    payee: string; amount: number; notes: string | null;
  }>): void {
    this.isPending.set(true);
    const list = this._transactions.map(t => {
      if (t.id !== id) return t;
      const acct = data.accountId  ? this._accounts.find(a => a.id === data.accountId)   : undefined;
      const cat  = data.categoryId ? this._categories.find(c => c.id === data.categoryId) : undefined;
      return {
        ...t, ...data,
        date:         data.date ? data.date.toISOString() : t.date,
        accountName:  acct?.name  ?? t.accountName,
        categoryName: data.categoryId !== undefined ? (cat?.name ?? null) : t.categoryName,
      };
    });
    this.setTransactions(list);
    this.toast.success('Transaction updated');
    this.isPending.set(false);
  }

  deleteTransaction(id: string): void {
    this.isPending.set(true);
    this.setTransactions(this._transactions.filter(t => t.id !== id));
    this.toast.success('Transaction deleted');
    this.isPending.set(false);
  }

  bulkDeleteTransactions(ids: string[]): void {
    this.isPending.set(true);
    const idSet = new Set(ids);
    this.setTransactions(this._transactions.filter(t => !idSet.has(t.id)));
    this.toast.success('Transactions deleted');
    this.isPending.set(false);
  }

  bulkCreateTransactions(rows: {
    date: Date; accountId: string; categoryId?: string | null;
    payee: string; amount: number; notes?: string | null;
  }[]): void {
    this.isPending.set(true);
    const newTxns: Transaction[] = rows.map(r => {
      const acct = this._accounts.find(a => a.id === r.accountId);
      const cat  = r.categoryId ? this._categories.find(c => c.id === r.categoryId) : null;
      return {
        id: generateId(), date: r.date.toISOString(), amount: r.amount,
        payee: r.payee, notes: r.notes ?? null,
        accountId: r.accountId, accountName: acct?.name ?? '',
        categoryId: r.categoryId ?? null, categoryName: cat?.name ?? null,
      };
    });
    this.setTransactions([...this._transactions, ...newTxns]);
    this.toast.success(`${newTxns.length} transactions imported`);
    this.isPending.set(false);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════

  loadSummary(filters: { from?: string; to?: string; accountId?: string } = {}): void {
    this.isLoadingSummary.set(true);

    // Use in-memory cache if already loaded, else fetch from JSON
    const compute = (allTxns: Transaction[]) => {
      const scoped = filters.accountId
        ? allTxns.filter(t => t.accountId === filters.accountId)
        : allTxns;

      // If no explicit date range, derive it from the actual data so nothing is hidden
      let startDate: Date, endDate: Date;
      if (filters.from || filters.to) {
        const defaultTo   = new Date();
        const defaultFrom = subDays(defaultTo, 30);
        startDate = filters.from ? new Date(filters.from) : defaultFrom;
        endDate   = filters.to   ? new Date(filters.to)   : defaultTo;
      } else if (scoped.length > 0) {
        const ms  = scoped.map(t => new Date(t.date).getTime());
        startDate = new Date(Math.min(...ms));
        endDate   = new Date(Math.max(...ms));
      } else {
        endDate   = new Date();
        startDate = subDays(endDate, 30);
      }

      const periodLength    = differenceInDays(endDate, startDate) + 1;
      const lastPeriodStart = subDays(startDate, periodLength);
      const lastPeriodEnd   = subDays(endDate,   periodLength);

      const fetch = (start: Date, end: Date) => {
        const f = scoped.filter(t => { const d = new Date(t.date); return d >= start && d <= end; });
        return {
          income:    f.reduce((s,t) => s + (t.amount >= 0 ? t.amount : 0), 0),
          expenses:  f.reduce((s,t) => s + (t.amount  < 0 ? t.amount : 0), 0),
          remaining: f.reduce((s,t) => s + t.amount, 0),
        };
      };
      const current = fetch(startDate, endDate);
      const last    = fetch(lastPeriodStart, lastPeriodEnd);

      const expenseTxns = scoped.filter(t => {
        const d = new Date(t.date);
        return d >= startDate && d <= endDate && t.amount < 0 && t.categoryId !== null;
      });
      const catMap = new Map<string, number>();
      for (const t of expenseTxns) {
        const key = t.categoryName ?? 'Unknown';
        catMap.set(key, (catMap.get(key) ?? 0) + Math.abs(t.amount));
      }
      const allCats = [...catMap.entries()]
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
      const top   = allCats.slice(0, 3);
      const other = allCats.slice(3);
      const finalCats = [...top];
      if (other.length > 0)
        finalCats.push({ name: 'Other', value: other.reduce((s,c) => s + c.value, 0) });

      const dayMap = new Map<string, { income: number; expenses: number }>();
      scoped.filter(t => { const d = new Date(t.date); return d >= startDate && d <= endDate; })
        .forEach(t => {
          const key = t.date.split('T')[0];
          const cur = dayMap.get(key) ?? { income: 0, expenses: 0 };
          if (t.amount >= 0) cur.income   += t.amount;
          else               cur.expenses += Math.abs(t.amount);
          dayMap.set(key, cur);
        });
      const activeDays = [...dayMap.entries()]
        .sort(([a],[b]) => a.localeCompare(b))
        .map(([date,v]) => ({ date, ...v }));

      this.summary.set({
        remainingAmount: current.remaining,
        remainingChange: calcPercentageChange(current.remaining, last.remaining),
        incomeAmount:    current.income,
        incomeChange:    calcPercentageChange(current.income,    last.income),
        expensesAmount:  current.expenses,
        expensesChange:  calcPercentageChange(current.expenses,  last.expenses),
        categories:      finalCats,
        days:            fillMissingDays(activeDays, startDate, endDate),
      });
      this.isLoadingSummary.set(false);
    };

    if (this._transactions.length > 0) {
      compute(this._transactions);
    } else {
      this.http.get<Transaction[]>('assets/data/transactions.json').subscribe({
        next: data => { this._transactions = data; compute(data); },
        error: ()   => this.isLoadingSummary.set(false),
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SUBSCRIPTIONS — always active (no paywall)
  // ═══════════════════════════════════════════════════════════════════════════

  loadSubscription(): void {
    const sub: Subscription = {
      id: 'sub_local', userId: 'abdo_khaled_user',
      subscriptionId: 'local_sub_1', status: 'active',
    };
    this.subscription.set(sub);
  }

  checkoutSubscription(): void {
    this.toast.info('Subscription checkout is disabled in offline/local mode.');
  }

  get shouldBlock(): boolean { return false; }

  // ── Reset: re-reads from JSON files ───────────────────────────────────────
  resetToSeedData(): Observable<void> {
    return this.init();
  }
}
