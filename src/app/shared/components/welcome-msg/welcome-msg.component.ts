import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-welcome-msg',
  standalone: true,
  template: `
    <div class="space-y-2 mb-4">
      <h2 class="text-2xl lg:text-4xl text-white font-medium">
        Welcome Back{{ auth.isLoaded() ? ', ' : ' ' }}{{ auth.user()?.firstName }} 👋
      </h2>
      <p class="text-sm lg:text-base text-[#89b6fd]">
        This is your Financial Overview Report
      </p>
    </div>
  `,
})
export class WelcomeMsgComponent {
  auth = inject(AuthService);
}
