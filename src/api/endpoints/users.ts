import { apiClient } from "@/api/client";
import type { AppUser, UserDTO } from "@/context/app-context";

export async function getUserById(
    userId: string,
    token: string,
): Promise<AppUser> {
    const response = await apiClient.get<UserDTO>(`/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return { ...response.data, token };
}
