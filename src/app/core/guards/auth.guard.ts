import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  // isLoaded check ensures we don't redirect before session is restored
  if (!auth.isLoaded()) return router.createUrlTree(['/sign-in']);
  return auth.isAuthenticated() ? true : router.createUrlTree(['/sign-in']);
};
