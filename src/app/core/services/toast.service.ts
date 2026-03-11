import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);

  private add(message: string, type: Toast['type']) {
    const id = Math.random().toString(36).slice(2);
    this.toasts.update(t => [...t, { id, message, type }]);
    setTimeout(() => this.remove(id), 4000);
  }

  success(message: string) { this.add(message, 'success'); }
  error(message: string) { this.add(message, 'error'); }
  info(message: string) { this.add(message, 'info'); }

  remove(id: string) {
    this.toasts.update(t => t.filter(toast => toast.id !== id));
  }
}
