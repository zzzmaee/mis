import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { TokenService } from './token.service';
import {ApiConfig} from "../../../../api.config";
import {AccessTokenRequest, AccessTokenResponse} from '../interfaces/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _http: HttpClient = inject(HttpClient);
  private readonly _tokenService: TokenService = inject(TokenService);

  public fetchKeycloakToken(
    payload: Omit<AccessTokenRequest, 'client_id' | 'grant_type'>,
  ): Observable<AccessTokenResponse> {
    return this._http.post<AccessTokenResponse>(
      `${ApiConfig.keycloakApi}/protocol/openid-connect/token`,
      new URLSearchParams({
        client_id: 'frontend',
        grant_type: 'password',
        ...payload,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    ).pipe(
      tap(response => this._tokenService.setTokens(response))
    );
  }

  public refreshToken(refreshToken: string): Observable<AccessTokenResponse> {
    return this._http.post<AccessTokenResponse>(
      `${ApiConfig.keycloakApi}/protocol/openid-connect/token`,
      new URLSearchParams({
        client_id: ApiConfig.keycloakApi,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    ).pipe(
      tap(response => this._tokenService.setTokens(response))
    );
  }

  public logout(): void {
    this._tokenService.logout();
  }
}
