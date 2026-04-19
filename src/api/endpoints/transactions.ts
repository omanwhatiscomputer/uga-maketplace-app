import { apiClient } from "@/api/client";
import type { UserSummaryDTO } from "./products";

export type TransactionDTO = {
    id: string;
    productId: string;
    productName: string;
    price: number;
    date: string;
    seller: UserSummaryDTO;
    buyer: UserSummaryDTO;
};

export async function getSalesHistory(): Promise<TransactionDTO[]> {
    const { data } = await apiClient.get<TransactionDTO[]>("/transaction/sales");
    return data;
}

export async function getPurchaseHistory(): Promise<TransactionDTO[]> {
    const { data } = await apiClient.get<TransactionDTO[]>("/transaction/purchases");
    return data;
}
