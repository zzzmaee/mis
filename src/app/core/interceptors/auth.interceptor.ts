import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import {TokenService} from '../services/token.service';
import {AuthService} from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const authService = inject(AuthService);
  const token = tokenService.getAccessToken();

  // Добавляем токен к запросу, если он есть
  if (token && !req.url.includes('openid-connect/token')) {
    req = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Если 401 ошибка, пытаемся обновить токен
      if (error.status === 401 && !req.url.includes('openid-connect/token')) {
        const refreshToken = tokenService.getRefreshToken();

        if (refreshToken) {
          return authService.refreshToken(refreshToken).pipe(
            switchMap(() => {
              // Повторяем запрос с новым токеном
              const newToken = tokenService.getAccessToken();
              const clonedReq = req.clone({
                headers: req.headers.set('Authorization', `Bearer ${newToken}`)
              });
              return next(clonedReq);
            }),
            catchError(refreshError => {
              // Если обновление токена не удалось - логаут
              authService.logout();
              return throwError(() => refreshError);
            })
          );
        } else {
          authService.logout();
        }
      }

      return throwError(() => error);
    })
  );
};
