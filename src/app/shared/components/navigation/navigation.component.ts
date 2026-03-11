import { Component, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

const routes = [
  { href: '/', label: 'Overview' },
  { href: '/transactions', label: 'Transactions' },
  { href: '/accounts', label: 'Accounts' },
  { href: '/categories', label: 'Categories' },
  { href: '/settings', label: 'Settings' },
];

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <!-- Desktop -->
    <nav class="hidden lg:flex items-center gap-x-2 overflow-x-auto">
      @for (route of routes; track route.href) {
        <a
          [routerLink]="route.href"
          routerLinkActive="bg-white/10 text-white"
          [routerLinkActiveOptions]="{ exact: route.href === '/' }"
          class="px-3 py-2 text-sm font-normal rounded-md text-white hover:bg-white/20 hover:text-white border-none outline-none focus:bg-white/30 transition"
        >
          {{ route.label }}
        </a>
      }
    </nav>

    <!-- Mobile -->
    <div class="lg:hidden">
      <button
        class="px-3 py-2 text-white bg-white/10 hover:bg-white/20 rounded-md border-none"
        (click)="isOpen.set(!isOpen())"
      >
        <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>

      @if (isOpen()) {
        <!-- Backdrop -->
        <div class="fixed inset-0 z-40 bg-black/40" (click)="isOpen.set(false)"></div>
        <!-- Drawer -->
        <div class="fixed top-0 left-0 h-full w-64 bg-white z-50 shadow-xl p-4">
          <nav class="flex flex-col gap-y-2 pt-6">
            @for (route of routes; track route.href) {
              <a
                [routerLink]="route.href"
                routerLinkActive="bg-gray-100 font-medium"
                [routerLinkActiveOptions]="{ exact: route.href === '/' }"
                class="w-full text-left px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition"
                (click)="isOpen.set(false)"
              >
                {{ route.label }}
              </a>
            }
          </nav>
        </div>
      }
    </div>
  `,
})
export class NavigationComponent {
  routes = routes;
  isOpen = signal(false);
}
