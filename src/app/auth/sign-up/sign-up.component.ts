import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div class="h-full lg:flex flex-col items-center justify-center px-4">
        <div class="text-center space-y-4 pt-16">
          <h1 class="font-bold text-3xl text-[#2E2A47]">Create an account</h1>
          <p class="text-base text-[#7E8CA0]">Sign up to start tracking your finances!</p>
        </div>
        <div class="w-full max-w-sm mt-8">
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
            @if (errorMsg()) {
              <div class="px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {{ errorMsg() }}
              </div>
            }
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="block text-sm font-medium text-gray-700">First Name</label>
                <input formControlName="firstName" type="text" placeholder="John"
                  class="w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div class="space-y-1">
                <label class="block text-sm font-medium text-gray-700">Last Name</label>
                <input formControlName="lastName" type="text" placeholder="Doe"
                  class="w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
            <div class="space-y-1">
              <label class="block text-sm font-medium text-gray-700">Email</label>
              <input formControlName="email" type="email" placeholder="you@example.com"
                class="w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                [class.border-red-400]="form.get('email')?.invalid && form.get('email')?.touched" />
            </div>
            <div class="space-y-1">
              <label class="block text-sm font-medium text-gray-700">Password</label>
              <input formControlName="password" type="password" placeholder="At least 4 characters"
                class="w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                [class.border-red-400]="form.get('password')?.invalid && form.get('password')?.touched" />
            </div>
            <button type="submit" [disabled]="form.invalid || isLoading()"
              class="w-full py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
              @if (isLoading()) {
                <span class="size-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
              }
              Create Account
            </button>
            <p class="text-center text-sm text-gray-500">
              Already have an account? <a routerLink="/sign-in" class="text-blue-600 hover:underline">Sign in</a>
            </p>
          </form>
        </div>
      </div>
      <div class="h-full bg-blue-600 hidden lg:flex items-center justify-center">
        <img src="logo.svg" class="h-24 w-24" alt="Logo" />
      </div>
    </div>
  `,
})
export class SignUpComponent implements OnInit {
  private auth   = inject(AuthService);
  private router = inject(Router);
  private fb     = inject(FormBuilder);

  errorMsg  = signal('');
  isLoading = signal(false);

  form = this.fb.group({
    firstName: [''],
    lastName:  [''],
    email:     ['', [Validators.required, Validators.email]],
    password:  ['', [Validators.required, Validators.minLength(4)]],
  });

  ngOnInit() {
    if (this.auth.isAuthenticated()) this.router.navigate(['/']);
  }

  async onSubmit() {
    if (this.form.invalid) return;
    this.isLoading.set(true);
    this.errorMsg.set('');

    const { email, password, firstName, lastName } = this.form.value;
    const result = await this.auth.signUp(email!, password!, firstName ?? '', lastName ?? '');

    if (result.ok) {
      this.router.navigate(['/']);
    } else {
      this.errorMsg.set(result.error ?? 'Could not create account.');
    }
    this.isLoading.set(false);
  }
}
