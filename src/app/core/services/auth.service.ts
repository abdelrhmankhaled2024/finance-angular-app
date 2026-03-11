import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface LocalUser {
  id: string;
  firstName: string;
  lastName: string;
  emailAddresses: { emailAddress: string }[];
  imageUrl: string;
}

interface UserRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  imageUrl: string;
}

export interface AuthResult {
  ok: boolean;
  error?: string;
}

const TOKEN_KEY = 'fin_auth_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);
  private http   = inject(HttpClient);

  isLoaded   = signal(false);
  isSignedIn = signal(false);
  user       = signal<LocalUser | null>(null);

  private usersCache: UserRecord[] = [];

  async initClerk() {
    try {
      this.usersCache = await firstValueFrom(
        this.http.get<UserRecord[]>('assets/data/users.json')
      );
    } catch { this.usersCache = []; }

    const userId = localStorage.getItem(TOKEN_KEY);
    if (userId) {
      const found = this.usersCache.find(u => u.id === userId);
      if (found) {
        this.user.set(this.toLocalUser(found));
        this.isSignedIn.set(true);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    }
    this.isLoaded.set(true);
  }

  async getToken(): Promise<string | null> {
    return this.isSignedIn() ? localStorage.getItem(TOKEN_KEY) : null;
  }

  signIn(email: string, password: string): AuthResult {
    if (!email || !password)
      return { ok: false, error: 'Email and password are required.' };

    const found = this.usersCache.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found)
      return { ok: false, error: 'Invalid email or password.' };

    localStorage.setItem(TOKEN_KEY, found.id);
    this.user.set(this.toLocalUser(found));
    this.isSignedIn.set(true);
    return { ok: true };
  }

  signUp(email: string, password: string, firstName = '', lastName = ''): AuthResult {
    if (!email || !password)
      return { ok: false, error: 'Email and password are required.' };

    const exists = this.usersCache.find(
      u => u.email.toLowerCase() === email.toLowerCase()
    );
    if (exists)
      return { ok: false, error: 'An account with this email already exists.' };

    const newUser: UserRecord = {
      id:        'user_' + Date.now().toString(36),
      firstName: firstName || email.split('@')[0],
      lastName,
      email,
      password,
      imageUrl:  '',
    };

    this.usersCache = [...this.usersCache, newUser];
    localStorage.setItem(TOKEN_KEY, newUser.id);
    this.user.set(this.toLocalUser(newUser));
    this.isSignedIn.set(true);
    return { ok: true };
  }

  signOut() {
    localStorage.removeItem(TOKEN_KEY);
    this.isSignedIn.set(false);
    this.user.set(null);
    this.router.navigate(['/sign-in']);
  }

  isAuthenticated(): boolean { return this.isSignedIn(); }

  private toLocalUser(u: UserRecord): LocalUser {
    return {
      id:              u.id,
      firstName:       u.firstName,
      lastName:        u.lastName,
      emailAddresses:  [{ emailAddress: u.email }],
      imageUrl:        u.imageUrl,
    };
  }
}