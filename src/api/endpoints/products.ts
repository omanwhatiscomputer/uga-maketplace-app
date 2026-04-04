import { apiClient } from "@/api/client";

type CreateProductDTO = {
    productName: string;
    productDescription: string;
    price: number;
    category: string;
    productImages: string[];
};

export type ProductSummaryDTO = {
    id: string;
    productName: string;
    price: number;
    category: string;
    sellerName: string;
    isAvailable: boolean;
    productImages: string[];
    dateCreated?: string;
};

export async function createProduct(data: CreateProductDTO): Promise<void> {
    await apiClient.post("/product", data);
}

export async function getAllProducts(): Promise<ProductSummaryDTO[]> {
    const response = await apiClient.get<ProductSummaryDTO[]>("/product");
    return response.data;
}

export async function getProductsByCategory(
    category: string,
): Promise<ProductSummaryDTO[]> {
    const response = await apiClient.get<ProductSummaryDTO[]>(
        `/product/category/${encodeURIComponent(category)}`,
    );
    return response.data;
}
