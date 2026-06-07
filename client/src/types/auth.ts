export interface AuthUser {
  id: string;
  email: string;
  storeName: string;
  createdAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  storeName: string;
}
