import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  UserResponse,
  UserDto,
  CreateUserRequest,
  UpdateUserRequest,
  UserRequestDto,
  PageResponse,
  GetUsersParams,
  BulkOperationRequest,
  BulkUpdateRequest,
  BulkOperationResponse,
  AddRoleRequest,
  RemoveRoleRequest,
} from './user.model';
import { ApiConfig } from '../../../../api.config';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly _http: HttpClient = inject(HttpClient);
  private readonly _apiUrl: string = `${ApiConfig.misApi}/users`;

  /**
   * Get users with pagination and filters (GET /users)
   */
  public getUsers(params?: GetUsersParams): Observable<PageResponse<UserResponse>> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
      if (params.size) httpParams = httpParams.set('size', params.size.toString());
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortDesc !== undefined) httpParams = httpParams.set('sortDesc', params.sortDesc.toString());
      if (params.enabled !== undefined) httpParams = httpParams.set('enabled', params.enabled.toString());
      if (params.emailVerified !== undefined) httpParams = httpParams.set('emailVerified', params.emailVerified.toString());
      if (params.role) httpParams = httpParams.set('role', params.role);
      if (params.firstName) httpParams = httpParams.set('firstName', params.firstName);
      if (params.lastName) httpParams = httpParams.set('lastName', params.lastName);
      if (params.email) httpParams = httpParams.set('email', params.email);
    }

    return this._http.get<PageResponse<UserResponse>>(this._apiUrl, { params: httpParams });
  }

  /**
   * Get user by ID (GET /users/{id})
   */
  public getUserById(id: string): Observable<UserResponse> {
    return this._http.get<UserResponse>(`${this._apiUrl}/${id}`);
  }

  /**
   * Create a new user (POST /users)
   */
  public createUser(request: CreateUserRequest): Observable<string> {
    return this._http.post<string>(this._apiUrl, request, { responseType: 'text' as 'json' });
  }

  /**
   * Update user (PUT /users/{id})
   */
  public updateUser(id: string, request: UpdateUserRequest): Observable<void> {
    return this._http.put<void>(`${this._apiUrl}/${id}`, request);
  }

  /**
   * Bulk update users (PUT /users/bulk)
   */
  public bulkUpdateUsers(request: BulkUpdateRequest): Observable<BulkOperationResponse> {
    return this._http.put<BulkOperationResponse>(`${this._apiUrl}/bulk`, request);
  }

  /**
   * Bulk delete users (DELETE /users/bulk)
   */
  public bulkDeleteUsers(request: BulkOperationRequest): Observable<BulkOperationResponse> {
    return this._http.delete<BulkOperationResponse>(`${this._apiUrl}/bulk`, { body: request });
  }

  /**
   * Block user (POST /users/{id}/block)
   */
  public blockUser(id: string): Observable<void> {
    return this._http.post<void>(`${this._apiUrl}/${id}/block`, null);
  }

  /**
   * Unblock user (POST /users/{id}/unblock)
   */
  public unblockUser(id: string): Observable<void> {
    return this._http.post<void>(`${this._apiUrl}/${id}/unblock`, null);
  }

  /**
   * Bulk block users (POST /users/bulk/block)
   */
  public bulkBlockUsers(request: BulkOperationRequest): Observable<BulkOperationResponse> {
    return this._http.post<BulkOperationResponse>(`${this._apiUrl}/bulk/block`, request);
  }

  /**
   * Bulk unblock users (POST /users/bulk/unblock)
   */
  public bulkUnblockUsers(request: BulkOperationRequest): Observable<BulkOperationResponse> {
    return this._http.post<BulkOperationResponse>(`${this._apiUrl}/bulk/unblock`, request);
  }

  /**
   * Add roles to user (POST /users/{id}/roles)
   */
  public addRoles(id: string, request: AddRoleRequest): Observable<void> {
    return this._http.post<void>(`${this._apiUrl}/${id}/roles`, request);
  }

  /**
   * Remove roles from user (DELETE /users/{id}/roles)
   */
  public removeRoles(id: string, request: RemoveRoleRequest): Observable<void> {
    return this._http.delete<void>(`${this._apiUrl}/${id}/roles`, { body: request });
  }

  /**
   * Reset password (POST /users/{id}/reset-password)
   * Returns 204 with no body
   */
  public resetPassword(id: string): Observable<void> {
    return this._http.post<void>(`${this._apiUrl}/${id}/reset-password`, null);
  }

  /**
   * Logout user from all sessions (DELETE /users/{id}/sessions)
   */
  public logoutUser(id: string): Observable<void> {
    return this._http.delete<void>(`${this._apiUrl}/${id}/sessions`);
  }

  // Legacy methods for backward compatibility
  public addUser(request: UserRequestDto): Observable<string> {
    return this.createUser(request as CreateUserRequest);
  }
}
