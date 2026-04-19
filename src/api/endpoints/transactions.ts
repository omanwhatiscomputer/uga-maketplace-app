import { apiClient } from "@/api/client";
import type { UserSummary } from "./products";

export type Transaction = {
    id: string;
    productId: string;
    productName: string;
    price: number;
    date: string;
    seller: UserSummary;
    buyer: UserSummary;
};

export async function getSalesHistory(): Promise<Transaction[]> {
    const { data } = await apiClient.get<Transaction[]>("/transaction/sales");
    return data;
}

export async function getPurchaseHistory(): Promise<Transaction[]> {
    const { data } = await apiClient.get<Transaction[]>(
        "/transaction/purchases",
    );
    return data;
}
