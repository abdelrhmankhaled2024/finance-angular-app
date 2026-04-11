import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SideDrawerComponent } from '../../../shared/components/side-drawer/side-drawer.component';
import { TransactionFormComponent } from './transaction-form.component';
import { TransactionSheetService } from '../services/transaction-sheet.service';
import { TransactionsService } from '../services/transactions.service';
import { AccountsService } from '../../accounts/services/accounts.service';
import { CategoriesService } from '../../categories/services/categories.service';

@Component({
  selector: 'app-transaction-sheets',
  standalone: true,
  imports: [CommonModule, SideDrawerComponent, TransactionFormComponent],
  template: `
    <app-side-drawer [isOpen]="sheetService.isNewOpen()" title="New Transaction"
      description="Add a new transaction." (closed)="sheetService.closeNew()">
      <app-transaction-form
        [disabled]="txService.isPending()"
        [accountOptions]="accountOptions()"
        [categoryOptions]="categoryOptions()"
        (submitted)="onCreate($event)"
        (createAccountRequest)="onCreateAccount($event)"
        (createCategoryRequest)="onCreateCategory($event)"
      />
    </app-side-drawer>

    <app-side-drawer [isOpen]="sheetService.isEditOpen()" title="Edit Transaction"
      description="Edit an existing transaction." (closed)="onCloseEdit()">
      @if (sheetService.isEditOpen() && editDefaults) {
        <app-transaction-form
          [id]="sheetService.editId()"
          [defaultValues]="editDefaults"
          [disabled]="txService.isPending()"
          [accountOptions]="accountOptions()"
          [categoryOptions]="categoryOptions()"
          (submitted)="onEdit($event)"
          (deleted)="onDelete()"
          (createAccountRequest)="onCreateAccount($event)"
          (createCategoryRequest)="onCreateCategory($event)"
        />
      }
    </app-side-drawer>
  `,
})
export class TransactionSheetsComponent implements OnInit {
  sheetService      = inject(TransactionSheetService);
  txService         = inject(TransactionsService);
  accountsService   = inject(AccountsService);
  categoriesService = inject(CategoriesService);

  accountOptions  = computed(() => this.accountsService.accounts().map(a => ({ label: a.name, value: a.id })));
  categoryOptions = computed(() => this.categoriesService.categories().map(c => ({ label: c.name, value: c.id })));
  editDefaults: any = null;

  ngOnInit() {
    this.accountsService.loadAll();
    this.categoriesService.loadAll();
  }

  ngDoCheck() {
    if (this.sheetService.isEditOpen() && this.sheetService.editId() && !this.editDefaults) {
      const t = this.txService.getOne(this.sheetService.editId()!);
      if (t) {
        this.editDefaults = {
          date:       t.date,
          accountId:  t.accountId,
          categoryId: t.categoryId ?? '',
          payee:      t.payee,
          amount:     t.amount / 1000,
          notes:      t.notes ?? '',
        };
      }
    }
    if (!this.sheetService.isEditOpen()) this.editDefaults = null;
  }

  onCreate(values: any) {
    this.txService.create(values);
    this.sheetService.closeNew();
  }

  onEdit(values: any) {
    const id = this.sheetService.editId();
    if (!id) return;
    this.txService.update(id, values);
    this.sheetService.closeEdit();
  }

  onDelete() {
    const id = this.sheetService.editId();
    if (!id) return;
    this.txService.delete(id);
    this.sheetService.closeEdit();
  }

  onCreateAccount(name: string) {
    this.accountsService.create({ name });
  }

  onCreateCategory(name: string) {
    this.categoriesService.create({ name });
  }

  onCloseEdit() { this.editDefaults = null; this.sheetService.closeEdit(); }
}
