import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoaded()) {
    return auth.isAuthenticated() ? true : router.createUrlTree(['/sign-in']);
  }

  // Wait for initClerk() to finish before deciding
  return toObservable(auth.isLoaded).pipe(
    filter(loaded => loaded),
    take(1),
    map(() => auth.isAuthenticated() ? true : router.createUrlTree(['/sign-in'])),
  );
};
