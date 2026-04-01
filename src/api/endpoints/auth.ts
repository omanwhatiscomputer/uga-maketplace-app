import { apiClient } from "@/api/client";
import type { AppUser, UserDTO } from "@/context/app-context";

type GoogleSignInResponse = {
    token: string;
    user: UserDTO;
};

type GoogleSignUpCheckResponse = {
    googleId: string;
    email: string;
    name: string;
};

type CreateAccountResponse = {
    token: string;
    user: UserDTO;
};

type CreateAccountDTO = {
    email: string;
    firstName: string;
    lastName: string;
    mobileNumber: string;
};

// Verifies the Google account doesn't exist yet (200 = OK to sign up, 409 = already exists)
export async function verifyGoogleSignUp(
    idToken: string,
): Promise<GoogleSignUpCheckResponse> {
    const response = await apiClient.post<GoogleSignUpCheckResponse>(
        "/auth/google-signup",
        null,
        { headers: { Authorization: `Bearer ${idToken}` } },
    );
    return response.data;
}

// Signs in an existing user with their Google ID token
export async function signInWithGoogle(idToken: string): Promise<AppUser> {
    const response = await apiClient.post<GoogleSignInResponse>(
        "/auth/google-signin",
        null,
        { headers: { Authorization: `Bearer ${idToken}` } },
    );
    return { ...response.data.user, token: response.data.token };
}

// Creates a new account with the collected user data
export async function createAccount(data: CreateAccountDTO): Promise<AppUser> {
    const response = await apiClient.post<CreateAccountResponse>(
        "/auth/create-account",
        data,
    );
    return { ...response.data.user, token: response.data.token };
}
