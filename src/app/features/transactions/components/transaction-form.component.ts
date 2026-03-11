import { Component, input, output, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { inject } from '@angular/core';
export interface SelectOption { label: string; value: string; }

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmDialogComponent],
  template: `
    <app-confirm-dialog
      title="Are you sure?"
      message="You are about to delete this transaction."
      [isOpen]="showConfirm"
      (confirmed)="onConfirmDelete()"
      (cancelled)="showConfirm = false"
    />
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4 pt-4">

      <!-- Date -->
      <div class="space-y-1">
        <label class="block text-sm font-medium text-gray-700">Date</label>
        <input formControlName="date" type="date" [disabled]="disabled()"
          class="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50" />
      </div>

      <!-- Account -->
      <div class="space-y-1">
        <label class="block text-sm font-medium text-gray-700">Account</label>
        <div class="flex gap-2">
          <select formControlName="accountId" [disabled]="disabled()"
            class="flex-1 px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50">
            <option value="">Select an account</option>
            @for (opt of accountOptions(); track opt.value) {
              <option [value]="opt.value">{{ opt.label }}</option>
            }
          </select>
          <button type="button" (click)="createAccount()" class="px-3 py-2 border rounded-md text-sm hover:bg-gray-50" title="Create new">+</button>
        </div>
      </div>

      <!-- Category -->
      <div class="space-y-1">
        <label class="block text-sm font-medium text-gray-700">Category</label>
        <div class="flex gap-2">
          <select formControlName="categoryId" [disabled]="disabled()"
            class="flex-1 px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50">
            <option value="">Select a category</option>
            @for (opt of categoryOptions(); track opt.value) {
              <option [value]="opt.value">{{ opt.label }}</option>
            }
          </select>
          <button type="button" (click)="createCategory()" class="px-3 py-2 border rounded-md text-sm hover:bg-gray-50" title="Create new">+</button>
        </div>
      </div>

      <!-- Payee -->
      <div class="space-y-1">
        <label class="block text-sm font-medium text-gray-700">Payee</label>
        <input formControlName="payee" type="text" placeholder="Add a payee" [disabled]="disabled()"
          class="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50" />
      </div>

      <!-- Amount -->
      <div class="space-y-1">
        <label class="block text-sm font-medium text-gray-700">Amount</label>
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
          <input formControlName="amount" type="number" step="0.01" placeholder="0.00" [disabled]="disabled()"
            class="w-full pl-7 pr-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50" />
        </div>
      </div>

      <!-- Notes -->
      <div class="space-y-1">
        <label class="block text-sm font-medium text-gray-700">Notes</label>
        <textarea formControlName="notes" placeholder="Optional notes" [disabled]="disabled()" rows="3"
          class="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 resize-none"></textarea>
      </div>

      <button type="submit" [disabled]="disabled() || form.invalid"
        class="w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
        {{ id() ? 'Save changes' : 'Create transaction' }}
      </button>
      @if (id()) {
        <button type="button" [disabled]="disabled()" (click)="showConfirm = true"
          class="w-full px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2">
          <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
          Delete transaction
        </button>
      }
    </form>
  `,
})
export class TransactionFormComponent implements OnInit {
  id = input<string | undefined>(undefined);
  defaultValues = input<any>({});
  disabled = input<boolean>(false);
  accountOptions = input<SelectOption[]>([]);
  categoryOptions = input<SelectOption[]>([]);

  submitted = output<any>();
  deleted = output<void>();
  createAccountRequest = output<string>();
  createCategoryRequest = output<string>();

  showConfirm = false;
  private fb = inject(FormBuilder);

  form = this.fb.group({
    date: ['', Validators.required],
    accountId: ['', Validators.required],
    categoryId: [''],
    payee: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    notes: [''],
  });

  ngOnInit() {
    const dv = this.defaultValues();
    if (dv && Object.keys(dv).length > 0) {
      this.form.patchValue({
        ...dv,
        date: dv.date ? this.toDateInput(new Date(dv.date)) : this.toDateInput(new Date()),
        amount: dv.amount ?? 0,
      });
    } else {
      this.form.patchValue({ date: this.toDateInput(new Date()) });
    }
  }

  toDateInput(d: Date) {
    return d.toISOString().split('T')[0];
  }

  onSubmit() {
    if (this.form.valid) {
      const v = this.form.value;
      const amount = Math.round((Number(v.amount) || 0) * 1000);
      this.submitted.emit({
        ...v,
        date: new Date(v.date!),
        amount,
        categoryId: v.categoryId || null,
        notes: v.notes || null,
      });
    }
  }

  createAccount() {
    const name = prompt('Account name:');
    if (name) this.createAccountRequest.emit(name);
  }

  createCategory() {
    const name = prompt('Category name:');
    if (name) this.createCategoryRequest.emit(name);
  }

  onConfirmDelete() {
    this.showConfirm = false;
    this.deleted.emit();
  }
}
