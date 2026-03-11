import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SideDrawerComponent } from '../../../shared/components/side-drawer/side-drawer.component';
import { AccountFormComponent } from './account-form.component';
import { AccountSheetService } from '../services/account-sheet.service';
import { AccountsService } from '../services/accounts.service';

@Component({
  selector: 'app-account-sheets',
  standalone: true,
  imports: [CommonModule, SideDrawerComponent, AccountFormComponent],
  template: `
    <!-- New Account Drawer -->
    <app-side-drawer
      [isOpen]="sheetService.isNewOpen()"
      title="New Account"
      description="Create a new account to track your transactions."
      (closed)="sheetService.closeNew()"
    >
      <app-account-form
        [disabled]="accountsService.isPending()"
        (submitted)="onCreate($event)"
      />
    </app-side-drawer>

    <!-- Edit Account Drawer -->
    <app-side-drawer
      [isOpen]="sheetService.isEditOpen()"
      title="Edit Account"
      description="Edit an existing account."
      (closed)="onCloseEdit()"
    >
      @if (sheetService.isEditOpen() && editDefaults) {
        <app-account-form
          [id]="sheetService.editId()"
          [defaultValues]="editDefaults"
          [disabled]="accountsService.isPending()"
          (submitted)="onEdit($event)"
          (deleted)="onDelete()"
        />
      }
    </app-side-drawer>
  `,
})
export class AccountSheetsComponent {
  sheetService    = inject(AccountSheetService);
  accountsService = inject(AccountsService);
  editDefaults: { name?: string } | null = null;

  ngDoCheck() {
    if (this.sheetService.isEditOpen() && this.sheetService.editId() && !this.editDefaults) {
      const account = this.accountsService.getOne(this.sheetService.editId()!);
      if (account) this.editDefaults = { name: account.name };
    }
    if (!this.sheetService.isEditOpen()) this.editDefaults = null;
  }

  onCreate(values: { name: string }) {
    this.accountsService.create(values);
    this.sheetService.closeNew();
  }

  onEdit(values: { name: string }) {
    const id = this.sheetService.editId();
    if (!id) return;
    this.accountsService.update(id, values);
    this.sheetService.closeEdit();
  }

  onDelete() {
    const id = this.sheetService.editId();
    if (!id) return;
    this.accountsService.delete(id);
    this.sheetService.closeEdit();
  }

  onCloseEdit() {
    this.editDefaults = null;
    this.sheetService.closeEdit();
  }
}
