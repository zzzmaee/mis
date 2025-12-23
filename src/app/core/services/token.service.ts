import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {AccessTokenResponse} from '../interfaces/auth.model';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly TOKEN_EXPIRY_KEY = 'token_expiry';
  private readonly REFRESH_EXPIRY_KEY = 'refresh_expiry';

  constructor(private router: Router) {}

  setTokens(tokenResponse: AccessTokenResponse): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokenResponse.access_token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokenResponse.refresh_token);

    // Сохраняем время истечения access_token (expires_in в секундах)
    const accessExpiryTime = Date.now() + (tokenResponse.expires_in * 1000);
    localStorage.setItem(this.TOKEN_EXPIRY_KEY, accessExpiryTime.toString());

    // Сохраняем время истечения refresh_token
    const refreshExpiryTime = Date.now() + (tokenResponse.refresh_expires_in * 1000);
    localStorage.setItem(this.REFRESH_EXPIRY_KEY, refreshExpiryTime.toString());
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    const token = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    const expiryTime = localStorage.getItem(this.REFRESH_EXPIRY_KEY);

    // Проверяем не истёк ли refresh token
    if (token && expiryTime && Date.now() < parseInt(expiryTime)) {
      return token;
    }

    return null;
  }

  hasValidToken(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    const expiryTime = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (!expiryTime) return false;

    // Проверяем, не истёк ли токен (с запасом 60 секунд)
    return Date.now() < (parseInt(expiryTime) - 60000);
  }

  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
    localStorage.removeItem(this.REFRESH_EXPIRY_KEY);
  }

  logout(): void {
    this.clearTokens();
    this.router.navigate(['/login']);
  }
}
