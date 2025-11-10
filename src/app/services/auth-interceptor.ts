
import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth';
import { catchError, switchMap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const http = inject(HttpClient);

  // Skip token attachment for auth endpoints
  if (
    req.url.includes('/api/church/register/') ||
    req.url.includes('/api/auth/login/') ||
    req.url.includes('/api/auth/teacher-login/') ||
    req.url.includes('/api/auth/member-login/') ||
    req.url.includes('/api/auth/token/refresh/')
  ) {
    return next(req);
  }

  const token = authService.getAccessToken();

  let clonedReq = req;
  if (token) {
    clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // If 401 (expired), try refreshing
      if (error.status === 401 && authService.getRefreshToken()) {
        const refreshToken = authService.getRefreshToken();
        return http.post<any>(`${environment.apiUrl}/api/auth/token/refresh/`, { refresh: refreshToken }).pipe(
          switchMap((res) => {
            // Save new access token
            authService.setAccessToken(res.access);

            // Retry original request with new token
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${res.access}` },
            });
            return next(retryReq);
          }),
          catchError((refreshError) => {
            // Refresh also failed → logout
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
