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

export async function addToWishlist(productId: string): Promise<void> {
    await apiClient.post(`/user/wishlist/${productId}`);
}

export async function removeFromWishlist(productId: string): Promise<void> {
    await apiClient.delete(`/user/wishlist/${productId}`);
}

export async function subscribeToProduct(productId: string): Promise<void> {
    await apiClient.post(`/user/subscribe/${productId}`);
}

export async function unsubscribeFromProduct(productId: string): Promise<void> {
    await apiClient.delete(`/user/subscribe/${productId}`);
}
