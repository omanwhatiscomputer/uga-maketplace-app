import { apiClient } from "@/api/client";
import type { AppUser } from "@/context/app-context";

type GoogleSignInResponse = {
    message: string;
    googleId: string;
    email: string;
    name: string;
};

export async function googleSignIn(idToken: string): Promise<AppUser> {
    const response = await apiClient.post<GoogleSignInResponse>(
        "/auth/google-signin",
        null,
        {
            headers: {
                Authorization: `Bearer ${idToken}`,
            },
        },
    );

    return {
        googleId: response.data.googleId,
        email: response.data.email,
        fullName: response.data.name,
    };
}
