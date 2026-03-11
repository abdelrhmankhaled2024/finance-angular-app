import { Injectable } from '@angular/core';

export interface StoredUser {
  id:        string;
  email:     string;
  password:  string;
  firstName: string;
  lastName:  string;
  createdAt: string;
}

const STORAGE_KEY = 'fin_users';

function generateId(): string {
  return 'user_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}

@Injectable({ providedIn: 'root' })
export class UserStorageService {

  // ── Read all users from localStorage ─────────────────────────────────────
  getAll(): StoredUser[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as StoredUser[];
    } catch { return []; }
  }

  // ── Find by email (case-insensitive) ──────────────────────────────────────
  findUser(email: string): StoredUser | undefined {
    return this.getAll().find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  // ── Create a new user and persist ─────────────────────────────────────────
  createUser(data: {
    email:     string;
    password:  string;
    firstName: string;
    lastName:  string;
  }): StoredUser {
    const user: StoredUser = {
      id:        generateId(),
      email:     data.email,
      password:  data.password,
      firstName: data.firstName || data.email.split('@')[0],
      lastName:  data.lastName  || '',
      createdAt: new Date().toISOString(),
    };
    const all = this.getAll();
    all.push(user);
    this._save(all);
    return user;
  }

  // ── Update password ───────────────────────────────────────────────────────
  updatePassword(id: string, newPassword: string): boolean {
    const all = this.getAll();
    const idx = all.findIndex(u => u.id === id);
    if (idx === -1) return false;
    all[idx] = { ...all[idx], password: newPassword };
    this._save(all);
    return true;
  }

  // ── Update profile ────────────────────────────────────────────────────────
  updateProfile(id: string, data: Partial<Pick<StoredUser, 'firstName' | 'lastName'>>): boolean {
    const all = this.getAll();
    const idx = all.findIndex(u => u.id === id);
    if (idx === -1) return false;
    all[idx] = { ...all[idx], ...data };
    this._save(all);
    return true;
  }

  // ── Seed a default demo user if the store is empty ───────────────────────
  seedDefaultUser(): void {
    if (this.getAll().length > 0) return;
    this.createUser({
      email:     'demo@example.com',
      password:  'demo1234',
      firstName: 'Demo',
      lastName:  'User',
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  private _save(users: StoredUser[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }
}
