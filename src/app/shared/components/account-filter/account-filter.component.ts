import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountsService } from '../../../features/accounts/services/accounts.service';

@Component({
  selector: 'app-account-filter',
  standalone: true,
  imports: [CommonModule],
  template: `
    <select
      [value]="accountId()"
      (change)="onChange($event)"
      class="lg:w-auto w-full h-9 rounded-md px-3 font-normal bg-white/10 hover:bg-white/20 text-white border-none outline-none focus:bg-white/30 transition text-sm"
    >
      <option value="all" class="text-black">All accounts</option>
      @for (account of accountsService.accounts(); track account.id) {
        <option [value]="account.id" class="text-black">{{ account.name }}</option>
      }
    </select>
  `,
})
export class AccountFilterComponent implements OnInit {
  accountsService = inject(AccountsService);
  private router  = inject(Router);
  private route   = inject(ActivatedRoute);
  accountId       = signal('all');

  ngOnInit() {
    this.accountsService.loadAll();
    const id = this.route.snapshot.queryParamMap.get('accountId');
    if (id) this.accountId.set(id);
  }

  onChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.accountId.set(value);
    const query: Record<string, string> = { ...this.route.snapshot.queryParams };
    if (value === 'all') delete query['accountId'];
    else query['accountId'] = value;
    this.router.navigate([], { queryParams: query });
  }
}
