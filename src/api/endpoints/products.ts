import { apiClient } from "@/api/client";

type CreateProduct = {
    productName: string;
    productDescription: string;
    price: number;
    category: string;
    condition: string;
    productImages: string[];
};

type UpdateProduct = {
    productName?: string;
    productDescription?: string;
    price?: number;
    category?: string;
    condition?: string;
};

export type UserSummary = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
    expoPushToken?: string | null;
};

export type MeetupLocation = {
    latitude: number;
    longitude: number;
};

export type ProductSummary = {
    id: string;
    sellerId: string;
    productName: string;
    price: number;
    category: string;
    condition: string;
    sellerName: string;
    isAvailable: boolean;
    productImages: string[];
    dateCreated: string;
    meetupLocation?: MeetupLocation | null;
};

export type Product = {
    id: string;
    sellerId: string;
    sellerName: string;
    productImages: string[];
    productName: string;
    productDescription: string;
    price: number;
    dateCreated: string;
    isAvailable: boolean;
    category: string;
    condition: string;
    meetupLocation?: MeetupLocation | null;
    subscribers: UserSummary[];
    wishlistedBy: UserSummary[];
};

export async function createProduct(data: CreateProduct): Promise<void> {
    await apiClient.post("/product", data);
}

export async function getProductById(id: string): Promise<Product> {
    const response = await apiClient.get<Product>(`/product/${id}`);
    return response.data;
}

export async function getAllProducts(): Promise<ProductSummary[]> {
    const response = await apiClient.get<ProductSummary[]>("/product");
    return response.data;
}

export async function getProductsByCategory(
    category: string,
): Promise<ProductSummary[]> {
    const response = await apiClient.get<ProductSummary[]>(
        `/product/category/${encodeURIComponent(category)}`,
    );
    return response.data;
}

export async function updateProduct(
    id: string,
    data: UpdateProduct,
): Promise<Product> {
    const response = await apiClient.patch<Product>(`/product/${id}`, data);
    return response.data;
}

export async function toggleAvailability(id: string): Promise<Product> {
    const response = await apiClient.patch<Product>(
        `/product/${id}/availability`,
    );
    return response.data;
}

export async function deleteProduct(id: string): Promise<void> {
    await apiClient.delete(`/product/${id}`);
}

export async function updateProductLocation(
    id: string,
    latitude: number,
    longitude: number,
): Promise<Product> {
    const response = await apiClient.patch<Product>(`/product/${id}/location`, {
        latitude,
        longitude,
    });
    return response.data;
}
