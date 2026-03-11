import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header-logo',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a routerLink="/" class="items-center hidden lg:flex">
      <img src="logo.svg" alt="Logo" class="h-7 w-7" />
      <p class="font-semibold text-white text-2xl ml-2.5">Finance</p>
    </a>
  `,
})
export class HeaderLogoComponent {}
