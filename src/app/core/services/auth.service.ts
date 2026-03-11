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

// localStorage is used ONLY for the session token (who is logged in)
const TOKEN_KEY = 'fin_auth_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);
  private http   = inject(HttpClient);

  isLoaded   = signal(false);
  isSignedIn = signal(false);
  user       = signal<LocalUser | null>(null);

  private usersCache: UserRecord[] = [];

  /** Load users.json once, restore session from token in localStorage */
  async initClerk() {
    try {
      this.usersCache = await firstValueFrom(
        this.http.get<UserRecord[]>('assets/data/users.json')
      );
    } catch { this.usersCache = []; }

    // Restore session: token in localStorage holds the userId
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

  /** Sign in: validates against users.json, stores userId token in localStorage */
  signIn(email: string, password: string): boolean {
    if (!email || !password) return false;
    const found = this.usersCache.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) return false;
    localStorage.setItem(TOKEN_KEY, found.id);   // token only — no user data
    this.user.set(this.toLocalUser(found));
    this.isSignedIn.set(true);
    return true;
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
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      emailAddresses: [{ emailAddress: u.email }],
      imageUrl: u.imageUrl,
    };
  }
}
