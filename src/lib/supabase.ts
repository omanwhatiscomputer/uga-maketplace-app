import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { File } from "expo-file-system";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
const PRODUCT_IMAGES_BUCKET = process.env.EXPO_PUBLIC_SUPABASE_BUCKET_NAME!;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

export async function uploadProductImage(uri: string): Promise<string> {
    const {
        data: { session },
    } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated with storage service.");

    const ext = uri.split(".").pop()?.toLowerCase() ?? "jpg";
    const contentType = `image/${ext === "jpg" ? "jpeg" : ext}`;
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

    const bytes = await new File(uri).bytes();

    const { error } = await supabase.storage
        .from(PRODUCT_IMAGES_BUCKET)
        .upload(fileName, bytes, { contentType, upsert: false });

    if (error) throw new Error(`Image upload failed: ${error.message}`);

    const { data } = supabase.storage
        .from(PRODUCT_IMAGES_BUCKET)
        .getPublicUrl(fileName);

    return data.publicUrl;
}
