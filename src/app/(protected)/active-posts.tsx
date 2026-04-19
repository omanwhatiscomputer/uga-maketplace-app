import { deleteProduct, getAllProducts, type ProductSummaryDTO } from "@/api/endpoints/products";
import { ProductCard } from "@/components/product-card";
import { ThemedText } from "@/components/themed-text";
import { TextVariants } from "@/constants/typography";
import { useAppContext } from "@/context/app-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { FlatList, StyleSheet } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import {
    ActivityIndicator,
    Appbar,
    Icon,
    Snackbar,
    Surface,
    Text,
    TouchableRipple,
} from "react-native-paper";

function DeleteAction({ onPress }: { onPress: () => void }) {
    const { colors } = useAppTheme();
    return (
        <TouchableRipple onPress={onPress} style={styles.deleteAction}>
            <Surface
                elevation={0}
                style={[styles.deleteInner, { backgroundColor: colors.error }]}
            >
                <Icon source="trash-can-outline" size={24} color={colors.onError} />
                <Text variant="labelMedium" style={{ color: colors.onError }}>
                    Delete
                </Text>
            </Surface>
        </TouchableRipple>
    );
}

export default function ActivePostsScreen() {
    const { colors } = useAppTheme();
    const { user } = useAppContext();

    const [products, setProducts] = useState<ProductSummaryDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());

    const fetchPosts = useCallback(async (isRefresh = false) => {
        if (!user) return;
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const data = await getAllProducts();
            setProducts(data.filter((p) => p.sellerId === user.id));
        } catch {
            setError("Failed to load posts.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    useFocusEffect(fetchPosts);

    const handleDelete = async (productId: string) => {
        swipeableRefs.current.get(productId)?.close();
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        try {
            await deleteProduct(productId);
        } catch {
            setError("Failed to delete post.");
            fetchPosts();
        }
    };

    const handleProductPress = (product: ProductSummaryDTO) => {
        router.push({
            pathname: "/(protected)/my-product/[id]",
            params: { id: product.id, productName: product.productName },
        } as any);
    };

    return (
        <Surface style={styles.screen} elevation={0}>
            <Appbar.Header>
                <Appbar.BackAction onPress={router.back} color={colors.primary} />
                <Appbar.Content title="My Active Posts" />
            </Appbar.Header>

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
                                <DeleteAction onPress={() => handleDelete(item.id)} />
                            )}
                            overshootRight={false}
                        >
                            <ProductCard
                                product={item}
                                isWishlisted={false}
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
                            My Active Posts
                        </ThemedText>
                    }
                    ListEmptyComponent={
                        <ThemedText
                            variant={TextVariants.body_md}
                            style={[styles.empty, { color: colors.onSurfaceVariant }]}
                        >
                            You have no active posts.
                        </ThemedText>
                    }
                    contentContainerStyle={styles.list}
                    onRefresh={() => fetchPosts(true)}
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
    deleteAction: {
        justifyContent: "center",
        marginBottom: 12,
    },
    deleteInner: {
        width: 80,
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        gap: 4,
    },
});
