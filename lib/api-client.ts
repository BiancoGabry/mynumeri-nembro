import { LoginResponse, RefreshResponse, ApiError } from "@/types/auth";

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string = API_URL) {
        this.baseUrl = baseUrl;
    }

    /**
     * Login user with username and password
     * The backend sets refresh token as HTTP-only cookie automatically
     */
    async login(username: string, password: string): Promise<LoginResponse> {
        const response = await fetch(`${this.baseUrl}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include", // Important: allows cookies to be sent/received
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            const error: ApiError = await response.json().catch(() => ({
                message: "Login failed",
            }));
            throw new Error(error.message || "Invalid credentials");
        }

        return response.json();
    }

    /**
     * Refresh access token using the HTTP-only refresh token cookie
     */
    async refreshAccessToken(): Promise<RefreshResponse> {
        const response = await fetch(`${this.baseUrl}/auth/refresh`, {
            method: "POST",
            credentials: "include", // Sends the refresh token cookie
        });

        if (!response.ok) {
            const error: ApiError = await response.json().catch(() => ({
                message: "Token refresh failed",
            }));
            throw new Error(error.message || "Failed to refresh token");
        }

        return response.json();
    }

    /**
     * Logout user and revoke refresh token
     */
    async logout(): Promise<void> {
        const response = await fetch(`${this.baseUrl}/auth/logout`, {
            method: "POST",
            credentials: "include", // Sends the refresh token cookie to revoke it
        });

        if (!response.ok) {
            // Don't throw on logout errors, just log them
            console.error("Logout failed:", response.statusText);
        }
    }
}

export const apiClient = new ApiClient();
