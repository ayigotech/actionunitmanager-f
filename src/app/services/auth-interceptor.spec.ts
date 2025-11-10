import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { of } from 'rxjs';
import { authInterceptor } from './auth-interceptor';

describe('authInterceptor', () => {
  const mockNext: HttpHandlerFn = (req) => of({} as any);

  it('should be created', () => {
    const interceptor = authInterceptor;
    expect(interceptor).toBeTruthy();
  });

  it('should intercept requests', () => {
    const req = new HttpRequest('GET', '/test');
    const interceptor = authInterceptor;
    
    expect(() => {
      interceptor(req, mockNext);
    }).not.toThrow();
  });
});