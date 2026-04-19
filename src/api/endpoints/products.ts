import { apiClient } from "@/api/client";

type CreateProductDTO = {
    productName: string;
    productDescription: string;
    price: number;
    category: string;
    condition: string;
    productImages: string[];
};

type UpdateProductDTO = {
    productName?: string;
    productDescription?: string;
    price?: number;
    category?: string;
    condition?: string;
};

export type UserSummaryDTO = {
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

export type ProductSummaryDTO = {
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

export type ProductDTO = {
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
    subscribers: UserSummaryDTO[];
    wishlistedBy: UserSummaryDTO[];
};

export async function createProduct(data: CreateProductDTO): Promise<void> {
    await apiClient.post("/product", data);
}

export async function getProductById(id: string): Promise<ProductDTO> {
    const response = await apiClient.get<ProductDTO>(`/product/${id}`);
    return response.data;
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

export async function updateProduct(
    id: string,
    data: UpdateProductDTO,
): Promise<ProductDTO> {
    const response = await apiClient.patch<ProductDTO>(`/product/${id}`, data);
    return response.data;
}

export async function toggleAvailability(id: string): Promise<ProductDTO> {
    const response = await apiClient.patch<ProductDTO>(
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
): Promise<ProductDTO> {
    const response = await apiClient.patch<ProductDTO>(`/product/${id}/location`, {
        latitude,
        longitude,
    });
    return response.data;
}
