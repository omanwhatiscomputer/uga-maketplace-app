import { type ProductSummaryDTO } from "@/api/endpoints/products";
import { getUserById, removeFromWishlist } from "@/api/endpoints/users";
import { ProductCard } from "@/components/product-card";
import { ThemedText } from "@/components/themed-text";
import { TextVariants } from "@/constants/typography";
import { useAppContext } from "@/context/app-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { ActivityIndicator, Icon, Snackbar, Surface, Text, TouchableRipple } from "react-native-paper";

function RemoveAction({ onPress }: { onPress: () => void }) {
    const { colors } = useAppTheme();
    return (
        <TouchableRipple onPress={onPress} style={styles.removeAction}>
            <Surface
                elevation={0}
                style={[styles.removeInner, { backgroundColor: colors.error }]}
            >
                <Icon source="trash-can-outline" size={24} color={colors.onError} />
                <Text variant="labelMedium" style={{ color: colors.onError }}>
                    Remove
                </Text>
            </Surface>
        </TouchableRipple>
    );
}

export default function WishlistScreen() {
    const { colors } = useAppTheme();
    const router = useRouter();
    const navigation = useNavigation();
    const { user, setWishlisted } = useAppContext();

    const [products, setProducts] = useState<ProductSummaryDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());

    const fetchWishlist = useCallback(async (isRefresh = false) => {
        if (!user) return;
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const data = await getUserById(user.id, user.token);
            setProducts(data.wishlist as ProductSummaryDTO[]);
        } catch {
            setError("Failed to load wishlist.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    useEffect(() => {
        fetchWishlist();
        const unsubscribe = navigation.addListener("tabPress" as any, () => {
            fetchWishlist();
        });
        return unsubscribe;
    }, [navigation, fetchWishlist]);

    const handleRemove = async (productId: string) => {
        swipeableRefs.current.get(productId)?.close();
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        setWishlisted((prev) => {
            const next = new Set(prev);
            next.delete(productId);
            return next;
        });
        try {
            await removeFromWishlist(productId);
        } catch {
            setError("Failed to remove from wishlist.");
            fetchWishlist();
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
                <ActivityIndicator animating size="large" style={styles.loader} />
            ) : (
                <FlatList
                    data={products}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <Swipeable
                            ref={(ref) => {
                                if (ref) swipeableRefs.current.set(item.id, ref);
                                else swipeableRefs.current.delete(item.id);
                            }}
                            renderRightActions={() => (
                                <RemoveAction onPress={() => handleRemove(item.id)} />
                            )}
                            overshootRight={false}
                        >
                            <ProductCard
                                product={item}
                                isWishlisted
                                isSubscribed={false}
                                showActions={false}
                                onPress={() => handleProductPress(item)}
                                onToggleWishlist={() => {}}
                                onToggleSubscribe={() => {}}
                            />
                        </Swipeable>
                    )}
                    ListHeaderComponent={
                        <ThemedText
                            variant={TextVariants.title_lg}
                            style={styles.heading}
                        >
                            Wishlist
                        </ThemedText>
                    }
                    ListEmptyComponent={
                        <ThemedText
                            variant={TextVariants.body_md}
                            style={[styles.empty, { color: colors.onSurfaceVariant }]}
                        >
                            Your wishlist is empty.
                        </ThemedText>
                    }
                    contentContainerStyle={styles.list}
                    onRefresh={() => fetchWishlist(true)}
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
                theme={{ colors: { inverseSurface: colors.onErrorContainer } }}
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
    loader: { flex: 1 },
    list: { padding: 16, paddingBottom: 100 },
    heading: { marginBottom: 16 },
    empty: { textAlign: "center", marginTop: 40 },
    removeAction: {
        justifyContent: "center",
        marginBottom: 12,
    },
    removeInner: {
        width: 80,
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        gap: 4,
    },
});
