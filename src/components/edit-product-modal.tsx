import { updateProduct, type ProductDTO } from "@/api/endpoints/products";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, ScrollView, StyleSheet } from "react-native";
import {
    ActivityIndicator,
    Button,
    Chip,
    IconButton,
    Snackbar,
    Surface,
    Text,
    TextInput,
    TouchableRipple,
} from "react-native-paper";

const MODAL_HEIGHT = Dimensions.get("window").height * 0.88;

const CATEGORIES = [
    "Electronics", "Clothing", "Books", "Furniture", "Sports",
    "Toys", "Kitchenwares", "Vehicles", "Music", "Art", "Pets", "Other",
];

const CONDITIONS = ["Premium", "Excellent", "Good", "Acceptable", "Poor"];

type EditProductModalProps = {
    visible: boolean;
    product: ProductDTO;
    onClose: () => void;
    onUpdated: (updated: ProductDTO) => void;
};

export function EditProductModal({
    visible,
    product,
    onClose,
    onUpdated,
}: EditProductModalProps) {
    const { colors } = useAppTheme();
    const translateY = useRef(new Animated.Value(MODAL_HEIGHT)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;

    const [title, setTitle] = useState(product.productName);
    const [description, setDescription] = useState(product.productDescription);
    const [price, setPrice] = useState(String(product.price));
    const [category, setCategory] = useState(product.category);
    const [condition, setCondition] = useState(product.condition);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (visible) {
            setTitle(product.productName);
            setDescription(product.productDescription);
            setPrice(String(product.price));
            setCategory(product.category);
            setCondition(product.condition);
            Animated.parallel([
                Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
                Animated.timing(backdropOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(translateY, { toValue: MODAL_HEIGHT, duration: 300, useNativeDriver: true }),
                Animated.timing(backdropOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
            ]).start();
        }
    }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

    const canSubmit =
        title.trim() &&
        description.trim() &&
        price.trim() &&
        !isNaN(parseFloat(price)) &&
        category &&
        condition;

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            const updated = await updateProduct(product.id, {
                productName: title.trim(),
                productDescription: description.trim(),
                price: parseFloat(price),
                category,
                condition,
            });
            onUpdated(updated);
            onClose();
        } catch {
            setError("Failed to update listing.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Animated.View
                pointerEvents={visible ? "auto" : "none"}
                style={[
                    StyleSheet.absoluteFill,
                    { backgroundColor: "rgba(0,0,0,0.5)", opacity: backdropOpacity },
                ]}
            >
                <TouchableRipple style={StyleSheet.absoluteFill} onPress={onClose} borderless>
                    <Surface style={StyleSheet.absoluteFill} elevation={0} />
                </TouchableRipple>
            </Animated.View>

            <Animated.View
                pointerEvents={visible ? "auto" : "none"}
                style={[styles.panel, { transform: [{ translateY }] }]}
            >
                <Surface style={styles.surface} elevation={4}>
                    <Surface elevation={0} style={styles.header}>
                        <Text variant="titleMedium" style={{ flex: 1, color: colors.onSurface }}>
                            Edit Listing
                        </Text>
                        <IconButton icon="close" onPress={onClose} />
                    </Surface>

                    <ScrollView
                        contentContainerStyle={styles.content}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <TextInput mode="flat" label="Title" value={title} onChangeText={setTitle} maxLength={100} />
                        <TextInput
                            mode="flat"
                            label="Description"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={3}
                            maxLength={500}
                        />
                        <TextInput
                            mode="flat"
                            label="Price ($)"
                            value={price}
                            onChangeText={(t) => setPrice(t.replace(/[^0-9.]/g, ""))}
                            keyboardType="decimal-pad"
                            left={<TextInput.Affix text="$" />}
                        />

                        <Text variant="labelLarge" style={{ color: colors.onSurfaceVariant }}>
                            Category
                        </Text>
                        <Surface elevation={0} style={styles.chips}>
                            {CATEGORIES.map((cat) => (
                                <Chip
                                    key={cat}
                                    selected={category === cat}
                                    onPress={() => setCategory(category === cat ? "" : cat)}
                                    showSelectedCheck={false}
                                    selectedColor={colors.onPrimary}
                                    style={category === cat ? { backgroundColor: colors.primary } : undefined}
                                >
                                    {cat}
                                </Chip>
                            ))}
                        </Surface>

                        <Text variant="labelLarge" style={{ color: colors.onSurfaceVariant }}>
                            Condition
                        </Text>
                        <Surface elevation={0} style={styles.chips}>
                            {CONDITIONS.map((cond) => (
                                <Chip
                                    key={cond}
                                    selected={condition === cond}
                                    onPress={() => setCondition(condition === cond ? "" : cond)}
                                    showSelectedCheck={false}
                                    selectedColor={colors.onPrimary}
                                    style={condition === cond ? { backgroundColor: colors.primary } : undefined}
                                >
                                    {cond}
                                </Chip>
                            ))}
                        </Surface>

                        {loading ? (
                            <ActivityIndicator animating size="large" style={{ marginTop: 8 }} />
                        ) : (
                            <Button
                                mode="contained"
                                onPress={handleSubmit}
                                disabled={!canSubmit}
                                style={{ marginTop: 8, marginBottom: 24, borderRadius: 0 }}
                            >
                                Save Changes
                            </Button>
                        )}
                    </ScrollView>
                </Surface>
            </Animated.View>

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
                action={{ label: "✕", onPress: () => setError(null), textColor: colors.onErrorContainer }}
            >
                <Text style={{ color: colors.onErrorContainer }}>{error}</Text>
            </Snackbar>
        </>
    );
}

const styles = StyleSheet.create({
    panel: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: MODAL_HEIGHT,
    },
    surface: {
        flex: 1,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: "hidden",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    content: {
        padding: 16,
        gap: 16,
    },
    chips: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
});
