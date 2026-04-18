import {
    getProductsByCategory,
    type ProductSummaryDTO,
} from "@/api/endpoints/products";
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
import {
    ActivityIndicator,
    Divider,
    IconButton,
    List,
    Snackbar,
    Surface,
    Text,
} from "react-native-paper";

const CATEGORIES: { label: string; icon: string }[] = [
    { label: "Electronics", icon: "laptop" },
    { label: "Clothing", icon: "tshirt-crew" },
    { label: "Books", icon: "book-open-variant" },
    { label: "Furniture", icon: "sofa" },
    { label: "Sports", icon: "basketball" },
    { label: "Toys", icon: "toy-brick" },
    { label: "Kitchenwares", icon: "pot-steam" },
    { label: "Vehicles", icon: "car" },
    { label: "Music", icon: "music" },
    { label: "Art", icon: "palette" },
    { label: "Pets", icon: "paw" },
    { label: "Other", icon: "dots-horizontal" },
];

export default function CategoryScreen() {
    const { colors } = useAppTheme();
    const router = useRouter();
    const navigation = useNavigation();
    const { wishlisted, setWishlisted, subscribed, setSubscribed } = useAppContext();

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [products, setProducts] = useState<ProductSummaryDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchByCategory = useCallback(async (category: string, isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const data = await getProductsByCategory(category);
            setProducts(data);
        } catch {
            setError("Failed to load products.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener("tabPress" as any, () => {
            if (selectedCategory) fetchByCategory(selectedCategory);
        });
        return unsubscribe;
    }, [navigation, selectedCategory, fetchByCategory]);

    const handleCategoryPress = (category: string) => {
        setSelectedCategory(category);
        fetchByCategory(category);
    };

    const handleBack = () => {
        setSelectedCategory(null);
        setProducts([]);
    };

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

    const snackbar = (
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
    );

    // ── Category drill-down view ──────────────────────────────────────────
    if (selectedCategory) {
        return (
            <Surface style={styles.screen} elevation={0}>
                {loading ? (
                    <>
                        <Surface elevation={0} style={styles.drillHeader}>
                            <IconButton
                                icon="arrow-left"
                                onPress={handleBack}
                                iconColor={colors.onSurface}
                            />
                            <ThemedText
                                variant={TextVariants.title_lg}
                                style={styles.drillTitle}
                            >
                                {selectedCategory}
                            </ThemedText>
                        </Surface>
                        <Divider />
                        <ActivityIndicator
                            animating
                            size="large"
                            style={styles.loader}
                        />
                    </>
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
                                onToggleWishlist={() => handleToggleWishlist(item.id)}
                                onToggleSubscribe={() => handleToggleSubscribe(item.id)}
                            />
                        )}
                        ListHeaderComponent={
                            <>
                                <Surface elevation={0} style={styles.drillHeader}>
                                    <IconButton
                                        icon="arrow-left"
                                        onPress={handleBack}
                                        iconColor={colors.onSurface}
                                    />
                                    <ThemedText
                                        variant={TextVariants.title_lg}
                                        style={styles.drillTitle}
                                    >
                                        {selectedCategory}
                                    </ThemedText>
                                </Surface>
                                <Divider style={{ marginBottom: 12 }} />
                            </>
                        }
                        ListEmptyComponent={
                            <ThemedText
                                variant={TextVariants.body_md}
                                style={[
                                    styles.empty,
                                    { color: colors.onSurfaceVariant },
                                ]}
                            >
                                No listings in this category.
                            </ThemedText>
                        }
                        contentContainerStyle={styles.list}
                        onRefresh={() => fetchByCategory(selectedCategory, true)}
                        refreshing={refreshing}
                        showsVerticalScrollIndicator={false}
                    />
                )}
                {snackbar}
            </Surface>
        );
    }

    // ── Category list view ────────────────────────────────────────────────
    return (
        <Surface style={styles.screen} elevation={0}>
            <FlatList
                data={CATEGORIES}
                keyExtractor={(item) => item.label}
                renderItem={({ item }) => (
                    <List.Item
                        title={item.label}
                        titleStyle={{ color: colors.onSurface }}
                        left={(props) => (
                            <List.Icon
                                {...props}
                                icon={item.icon}
                                color={colors.primary}
                            />
                        )}
                        right={(props) => (
                            <List.Icon
                                {...props}
                                icon="chevron-right"
                                color={colors.onSurfaceVariant}
                            />
                        )}
                        onPress={() => handleCategoryPress(item.label)}
                    />
                )}
                ListHeaderComponent={
                    <ThemedText
                        variant={TextVariants.title_lg}
                        style={styles.heading}
                    >
                        Categories
                    </ThemedText>
                }
                ItemSeparatorComponent={() => <Divider />}
                contentContainerStyle={styles.categoryList}
                showsVerticalScrollIndicator={false}
            />
            {snackbar}
        </Surface>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    heading: { padding: 16, paddingBottom: 8 },
    categoryList: { paddingBottom: 100 },
    drillHeader: {
        flexDirection: "row",
        alignItems: "center",
        paddingRight: 16,
        paddingTop: 4,
    },
    drillTitle: { flex: 1 },
    loader: { flex: 1 },
    list: { paddingHorizontal: 16, paddingBottom: 100 },
    empty: { textAlign: "center", marginTop: 40 },
});
