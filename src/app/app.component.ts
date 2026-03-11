import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { ToastComponent } from './shared/components/toast/toast.component';
import { FinanceDataService } from './shared/services/finance-data.service';
import { UserStorageService } from './core/services/user-storage.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent],
  template: `
    <router-outlet />
    <app-toast />
  `,
})
export class AppComponent implements OnInit {
  private auth        = inject(AuthService);
  private fin         = inject(FinanceDataService);
  private userStorage = inject(UserStorageService);

  async ngOnInit() {
    // Seed default demo user if no users exist yet
    this.userStorage.seedDefaultUser();

    // Init JWT auth — restores session from stored token
    await this.auth.initClerk();

    // Seed per-user finance data from assets/data/*.json on first run
    this.fin.init().subscribe();
  }
}
