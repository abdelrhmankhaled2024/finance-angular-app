import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../shared/components/header/header.component';
import { AccountSheetsComponent } from '../features/accounts/components/account-sheets.component';
import { CategorySheetsComponent } from '../features/categories/components/category-sheets.component';
import { TransactionSheetsComponent } from '../features/transactions/components/transaction-sheets.component';
import { SubscriptionModalComponent } from '../features/subscriptions/components/subscription-modal.component';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    AccountSheetsComponent,
    CategorySheetsComponent,
    TransactionSheetsComponent,
    SubscriptionModalComponent,
  ],
  template: `
    <app-header />
    <main class="px-3 lg:px-14">
      <router-outlet />
    </main>

    <!-- Global drawers/modals (replaces SheetProvider) -->
    <app-account-sheets />
    <app-category-sheets />
    <app-transaction-sheets />
    <app-subscription-modal />
  `,
})
export class DashboardLayoutComponent {}
