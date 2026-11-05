import  { httpClient } from "./client.ts";
import type {LoginRequest, Role, User} from "../types/auth.ts";

/**
 * Calls to the backend's /api/auth endpoints.
 *
 * Mock mode: set VITE_MOCK_AUTH=true in .env.development.local to sign in without a backend.
 * Any email/password works; emails starting with "admin" or "patient" get that role,
 * everything else signs in as a Therapist. Never enable this outside local development.
 */

const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true'
const MOCK_KEY = "mockSignedIn"

const AUTH_ENDPOINTS = {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    ME: "/auth/me"
}

export const login = async (loginRequest: LoginRequest): Promise<User> => {
    if (MOCK_AUTH) {
        sessionStorage.setItem(MOCK_KEY, "1");
        return mockUser(loginRequest.email);
    }
    
    const {data, statusText} = await httpClient.post<User>(
        AUTH_ENDPOINTS.LOGIN,
        loginRequest
    );
    
    console.log(statusText);
    return data;
}

export const logout = async () => {
    if (MOCK_AUTH){
        sessionStorage.removeItem(MOCK_KEY);
        return;
    } 
    
    const {data, statusText} = await httpClient.post(AUTH_ENDPOINTS.LOGOUT);
    console.log(statusText);
    return data;
}

export const getCurrentUser =  async (): Promise<User | null> => {
    if (MOCK_AUTH) return sessionStorage.getItem(MOCK_KEY) ? mockUser("dr.hale@example.com") : null
    
    const { data, statusText } = await httpClient.get<User>(AUTH_ENDPOINTS.ME);
    console.log(statusText);
    return data;
}

const mockUser = (email: string): User => {
    const lower = email.toLowerCase()
    const role: Role = lower.startsWith('admin') ? 'Admin' : lower.startsWith('patient') ? 'Patient' : 'Therapist'
    return { id: 'mock-user', email, firstName: 'Dr. Morgan', lastName: 'Hale', roles: [role] }
}