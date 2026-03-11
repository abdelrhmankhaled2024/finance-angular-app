import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { HeaderLogoComponent } from '../header-logo/header-logo.component';
import { NavigationComponent } from '../navigation/navigation.component';
import { WelcomeMsgComponent } from '../welcome-msg/welcome-msg.component';
import { FiltersComponent } from '../filters/filters.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, HeaderLogoComponent, NavigationComponent, WelcomeMsgComponent, FiltersComponent],
  template: `
    <header class="bg-gradient-to-b from-blue-700 to-blue-500 px-4 py-8 lg:px-14 pb-36">
      <div class="max-w-screen-2xl mx-auto">
        <div class="w-full flex items-center justify-between mb-14">
          <div class="flex items-center lg:gap-x-16">
            <app-header-logo />
            <app-navigation />
          </div>
          <!-- User avatar + sign out -->
          <button
            class="flex items-center gap-2 text-white hover:opacity-80 transition group"
            (click)="auth.signOut()"
            title="Sign out"
          >
            <div class="size-8 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold text-sm uppercase">
              {{ auth.user()?.firstName?.[0] ?? 'U' }}
            </div>
            <span class="text-xs hidden lg:block opacity-70 group-hover:opacity-100">Sign out</span>
          </button>
        </div>
        <app-welcome-msg />
        <app-filters />
      </div>
    </header>
  `,
})
export class HeaderComponent {
  auth = inject(AuthService);
}
