import { getAllProducts, type ProductSummaryDTO } from "@/api/endpoints/products";
import {
    addToWishlist,
    removeFromWishlist,
    subscribeToProduct,
    unsubscribeFromProduct,
} from "@/api/endpoints/users";
import { ProductCard } from "@/components/product-card";
import { ThemedText } from "@/components/themed-text";
import { TextVariants } from "@/constants/typography";
import { useAppContext } from "@/context/app-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { FlatList, StyleSheet } from "react-native";
import { ActivityIndicator, Snackbar, Surface, Text } from "react-native-paper";

export default function ExploreScreen() {
    const { colors } = useAppTheme();
    const router = useRouter();
    const navigation = useNavigation();
    const { wishlisted, setWishlisted, subscribed, setSubscribed } = useAppContext();

    const [products, setProducts] = useState<ProductSummaryDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const data = await getAllProducts();
            setProducts([...data].reverse());
        } catch {
            setError("Failed to load listings.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
        const unsubscribe = navigation.addListener("tabPress" as any, () => {
            fetchProducts();
        });
        return unsubscribe;
    }, [navigation, fetchProducts]);

    const handleToggleWishlist = async (productId: string) => {
        const already = wishlisted.has(productId);
        setWishlisted((prev) => {
            const next = new Set(prev);
            already ? next.delete(productId) : next.add(productId);
            return next;
        });
        try {
            already
                ? await removeFromWishlist(productId)
                : await addToWishlist(productId);
        } catch (err: any) {
            if (err?.response?.status === 409) return;
            setWishlisted((prev) => {
                const next = new Set(prev);
                already ? next.add(productId) : next.delete(productId);
                return next;
            });
            setError("Could not update wishlist.");
        }
    };

    const handleToggleSubscribe = async (productId: string) => {
        const already = subscribed.has(productId);
        setSubscribed((prev) => {
            const next = new Set(prev);
            already ? next.delete(productId) : next.add(productId);
            return next;
        });
        try {
            already
                ? await unsubscribeFromProduct(productId)
                : await subscribeToProduct(productId);
        } catch (err: any) {
            if (err?.response?.status === 409) return;
            setSubscribed((prev) => {
                const next = new Set(prev);
                already ? next.add(productId) : next.delete(productId);
                return next;
            });
            setError("Could not update subscription.");
        }
    };

    const handleProductPress = (product: ProductSummaryDTO) => {
        router.push({
            pathname: "/(protected)/product/[id]",
            params: {
                id: product.id,
                productName: product.productName,
                price: String(product.price),
                category: product.category,
                condition: product.condition,
                sellerName: product.sellerName,
                imageUrls: product.productImages.join("||"),
            },
        } as any);
    };

    return (
        <Surface style={styles.screen} elevation={0}>
            {loading ? (
                <ActivityIndicator
                    animating
                    size="large"
                    style={styles.loader}
                />
            ) : (
                <FlatList
                    data={products}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <ProductCard
                            product={item}
                            isWishlisted={wishlisted.has(item.id)}
                            isSubscribed={subscribed.has(item.id)}
                            onPress={() => handleProductPress(item)}
                            onToggleWishlist={() =>
                                handleToggleWishlist(item.id)
                            }
                            onToggleSubscribe={() =>
                                handleToggleSubscribe(item.id)
                            }
                        />
                    )}
                    ListHeaderComponent={
                        <ThemedText
                            variant={TextVariants.title_lg}
                            style={styles.heading}
                        >
                            Explore
                        </ThemedText>
                    }
                    ListEmptyComponent={
                        <ThemedText
                            variant={TextVariants.body_md}
                            style={[
                                styles.empty,
                                { color: colors.onSurfaceVariant },
                            ]}
                        >
                            No listings yet.
                        </ThemedText>
                    }
                    contentContainerStyle={styles.list}
                    onRefresh={() => fetchProducts(true)}
                    refreshing={refreshing}
                    showsVerticalScrollIndicator={false}
                />
            )}

            <Snackbar
                visible={!!error}
                onDismiss={() => setError(null)}
                style={{
                    borderRadius: 36,
                    backgroundColor: colors.errorContainer,
                    width: "90%",
                    alignSelf: "center",
                }}
                theme={{
                    colors: { inverseSurface: colors.onErrorContainer },
                }}
                action={{
                    label: "✕",
                    onPress: () => setError(null),
                    textColor: colors.onErrorContainer,
                }}
            >
                <Text style={{ color: colors.onErrorContainer }}>{error}</Text>
            </Snackbar>
        </Surface>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    list: { padding: 16, paddingBottom: 100 },
    heading: { marginBottom: 16 },
    empty: { textAlign: "center", marginTop: 40 },
    loader: { flex: 1 },
});
