// User Response from API (GET /users/{id})
export interface UserResponse {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  enabled: boolean;
  emailVerified: boolean;
  createdTimestamp: number;
  attributes?: Record<string, string[]>;
  requiredActions?: string[];
}

// Alias for backward compatibility
export interface UserDto extends UserResponse {}

// Create User Request (POST /users)
export interface CreateUserRequest {
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  enabled?: boolean;
  emailVerified?: boolean;
  attributes?: Record<string, string[]>;
  credentials?: CredentialRepresentation[];
  requiredActions?: string[];
  roles?: string[];
}

// Update User Request (PUT /users/{id})
export interface UpdateUserRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  enabled?: boolean;
  emailVerified?: boolean;
  attributes?: Record<string, string[]>;
  roles?: string[];
}

// Alias for backward compatibility
export interface UserRequestDto extends CreateUserRequest, UpdateUserRequest {}

// Credential Representation
export interface CredentialRepresentation {
  type?: string;
  value?: string;
  temporary?: boolean;
}

// Paginated Response (GET /users)
export interface PageResponse<T> {
  content: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

// Query parameters for GET /users
export interface GetUsersParams {
  search?: string;
  page?: number;
  size?: number;
  sortBy?: 'USERNAME' | 'EMAIL' | 'FIRST_NAME' | 'LAST_NAME' | 'CREATED' | 'ENABLED';
  sortDesc?: boolean;
  enabled?: boolean;
  emailVerified?: boolean;
  role?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

// Bulk operations
export interface BulkOperationRequest {
  userIds: string[];
}

export interface BulkUpdateRequest {
  userIds: string[];
  updateRequest: UpdateUserRequest;
}

export interface BulkOperationError {
  userId: string;
  message: string;
}

export interface BulkOperationResponse {
  successCount: number;
  failureCount: number;
  successfulIds: string[];
  errors: BulkOperationError[];
}

// Role operations
export interface AddRoleRequest {
  roleNames: string[];
}

export interface RemoveRoleRequest {
  roleNames: string[];
}

// Password reset (response is 204, no body)
// PasswordResetResponseDto removed as API returns 204 with no body
