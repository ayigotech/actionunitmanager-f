



import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { ApiService, AuthResponse } from './api';
import { NetworkService } from './network';
// import { NetworkService } from './network.service'; // Add this import

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'superintendent' | 'teacher' | 'member';
  church?: any;
  is_officer: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private apiService = inject(ApiService);
  private networkService = inject(NetworkService); // Inject network service
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Check for existing auth on service initialization
    this.checkExistingAuth();
  }

  private checkExistingAuth(): void {
    const token = this.getAccessToken();
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
      } catch (e) {
        this.logout();
      }
    }
  }

  // Token management
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  setAccessToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  setRefreshToken(token: string): void {
    localStorage.setItem('refresh_token', token);
  }

  // Enhanced Auth methods with network awareness
  loginSuperintendent(email: string, password: string): Observable<AuthResponse> {
    return from(this.networkService.isOnline()).pipe(
      switchMap(isOnline => {
        if (!isOnline) {
          // Offline login attempt
          return this.offlineLogin(email, password, 'superintendent');
        } else {
          // Online login
          return this.apiService.loginSuperintendent({ email, password }).pipe(
            tap(response => this.cacheLoginData(email, password, response))
          );
        }
      }),
      catchError(error => {
        // Handle network errors gracefully
        if (error.status === 0) {
          throw { 
            status: 0, 
            message: 'Cannot connect to server. Please check your internet connection.' 
          };
        }
        throw error;
      })
    );
  }

  loginTeacher(phone: string): Observable<AuthResponse> {
    return from(this.networkService.isOnline()).pipe(
      switchMap(isOnline => {
        if (!isOnline) {
          return this.offlineLogin(phone, '', 'teacher');
        } else {
          return this.apiService.loginTeacherMember({ phone }).pipe(
            tap(response => this.cacheLoginData(phone, '', response))
          );
        }
      }),
      catchError(error => {
        if (error.status === 0) {
          throw { 
            status: 0, 
            message: 'Cannot connect to server. Please check your internet connection.' 
          };
        }
        throw error;
      })
    );
  }

  loginMember(phone: string): Observable<AuthResponse> {
    return from(this.networkService.isOnline()).pipe(
      switchMap(isOnline => {
        if (!isOnline) {
          return this.offlineLogin(phone, '', 'member');
        } else {
          return this.apiService.loginTeacherMember({ phone }).pipe(
            tap(response => this.cacheLoginData(phone, '', response))
          );
        }
      }),
      catchError(error => {
        if (error.status === 0) {
          throw { 
            status: 0, 
            message: 'Cannot connect to server. Please check your internet connection.' 
          };
        }
        throw error;
      })
    );
  }

  // Offline login method
  private offlineLogin(identifier: string, password: string, role: string): Observable<AuthResponse> {
    return new Observable<AuthResponse>(observer => {
      const cachedAuth = localStorage.getItem('cached_auth');
      
      if (cachedAuth) {
        try {
          const authData = JSON.parse(cachedAuth);
          
          // Check if cached credentials match and are not expired (e.g., within 24 hours)
          const isExpired = Date.now() - authData.timestamp > 24 * 60 * 60 * 1000; // 24 hours
          
          if (!isExpired && authData.identifier === identifier && authData.role === role) {
            // Successful offline login
            observer.next({
              ...authData.response,
              message: 'Offline login successful (using cached data)',
              offline: true
            });
            observer.complete();
            return;
          }
        } catch (e) {
          console.error('Error parsing cached auth data:', e);
        }
      }
      
      // No valid cached data
      observer.error({
        status: 0,
        message: 'No internet connection and no cached login data available.'
      });
    });
  }

  // Cache login data for offline use
  private cacheLoginData(identifier: string, password: string, response: AuthResponse): void {
    const authData = {
      identifier,
      password: password ? '***' : '', // Don't store actual password for security
      role: response.user.role,
      response: response,
      timestamp: Date.now()
    };
    
    localStorage.setItem('cached_auth', JSON.stringify(authData));
  }

  registerChurch(data: any): Observable<AuthResponse> {
    return from(this.networkService.isOnline()).pipe(
      switchMap(isOnline => {
        if (!isOnline) {
          throw { 
            status: 0, 
            message: 'Internet connection required to register church.' 
          };
        }
        return this.apiService.registerChurch(data);
      })
    );
  }

  // Handle successful authentication
  handleAuthentication(response: AuthResponse): void {
    this.setAccessToken(response.access);
    this.setRefreshToken(response.refresh);
    
    const user: User = {
      id: response.user.id,
      name: response.user.name,
      email: response.user.email,
      role: response.user.role,
      church: response.user.church,
      is_officer: response.user.is_officer,
    };
    
    console.log('🔍 Storing user in localStorage:', user);
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  // Logout
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    // Don't remove cached_auth so user can login offline
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth']);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Check user role
  isSuperintendent(): boolean {
    return this.currentUserSubject.value?.role === 'superintendent';
  }

  isTeacher(): boolean {
    return this.currentUserSubject.value?.role === 'teacher';
  }

  // Token refresh with network awareness
  refreshToken(): Observable<{ access: string }> {
    return from(this.networkService.isOnline()).pipe(
      switchMap(isOnline => {
        if (!isOnline) {
          throw { 
            status: 0, 
            message: 'Internet connection required to refresh token.' 
          };
        }
        return this.apiService.refreshToken(this.getRefreshToken()!);
      })
    );
  }

  // Check if device is online
  async checkNetworkStatus(): Promise<boolean> {
    return await this.networkService.isOnline();
  }
}