export interface AccessTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  refresh_token: string;
  token_type: string;
  'not-before-policy': number;
  session_state: string;
  scope: string;
}

export interface AccessTokenRequest {
  username: string;
  password: string;
  client_id?: string;
  grant_type?: string;
}
