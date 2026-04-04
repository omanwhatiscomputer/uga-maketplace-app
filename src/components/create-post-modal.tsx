import { createProduct } from "@/api/endpoints/products";
import { TextVariants } from "@/constants/typography";
import { useAppTheme } from "@/hooks/use-app-theme";
import { uploadProductImage } from "@/lib/supabase";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
    Animated,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
} from "react-native";
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
const MAX_IMAGES = 6;

const CATEGORIES = [
    "Electronics",
    "Clothing",
    "Books",
    "Furniture",
    "Sports",
    "Toys",
    "Kitchenwares",
    "Vehicles",
    "Music",
    "Art",
    "Pets",
    "Other",
];

const CONDITIONS = ["Premium", "Excellent", "Good", "Acceptable", "Poor"];

type CreatePostModalProps = {
    visible: boolean;
    translateY: Animated.Value;
    backdropOpacity: Animated.Value;
    onClose: () => void;
};

export function CreatePostModal({
    visible,
    translateY,
    backdropOpacity,
    onClose,
}: CreatePostModalProps) {
    const { colors } = useAppTheme();

    const [images, setImages] = useState<string[]>([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("");
    const [condition, setCondition] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const resetForm = () => {
        setImages([]);
        setTitle("");
        setDescription("");
        setPrice("");
        setCategory("");
        setCondition("");
        setError(null);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const pickImage = async () => {
        if (images.length >= MAX_IMAGES) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setImages((prev) => [...prev, result.assets[0].uri]);
        }
    };

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const canSubmit =
        title.trim() &&
        description.trim() &&
        price.trim() &&
        !isNaN(parseFloat(price)) &&
        category &&
        condition &&
        images.length > 0;

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            const imageUrls = await Promise.all(images.map(uploadProductImage));
            await createProduct({
                productName: title.trim(),
                productDescription: description.trim(),
                price: parseFloat(price),
                category,
                condition,
                productImages: imageUrls,
            });
            handleClose();
        } catch (err: any) {
            setError(
                err instanceof Error ? err.message : "Failed to create post.",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Backdrop */}
            <Animated.View
                pointerEvents={visible ? "auto" : "none"}
                style={[
                    StyleSheet.absoluteFill,
                    {
                        backgroundColor: "rgba(0,0,0,0.5)",
                        opacity: backdropOpacity,
                    },
                ]}
            >
                <TouchableRipple
                    style={StyleSheet.absoluteFill}
                    onPress={handleClose}
                    borderless
                >
                    <Surface style={StyleSheet.absoluteFill} elevation={0} />
                </TouchableRipple>
            </Animated.View>

            {/* Modal panel */}
            <Animated.View
                pointerEvents={visible ? "auto" : "none"}
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: MODAL_HEIGHT,
                    transform: [{ translateY }],
                }}
            >
                <Surface
                    style={{
                        flex: 1,
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                    }}
                    elevation={4}
                >
                    {/* Header */}
                    <Surface
                        elevation={0}
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            paddingHorizontal: 16,
                            paddingTop: 8,
                        }}
                    >
                        <Text
                            variant={TextVariants.subtitle_lg as any}
                            style={{ flex: 1, color: colors.onSurface }}
                        >
                            Create Post
                        </Text>
                        <IconButton icon="close" onPress={handleClose} />
                    </Surface>

                    <ScrollView
                        contentContainerStyle={{ padding: 16, gap: 16 }}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Image picker grid */}
                        <Surface
                            elevation={0}
                            style={{
                                flexDirection: "row",
                                flexWrap: "wrap",
                                gap: 8,
                            }}
                        >
                            {images.map((uri, idx) => (
                                <Surface
                                    key={idx}
                                    elevation={0}
                                    style={styles.imageBox}
                                >
                                    <Image
                                        source={{ uri }}
                                        style={StyleSheet.absoluteFill}
                                        resizeMode="cover"
                                    />
                                    <IconButton
                                        icon="close-circle"
                                        size={20}
                                        iconColor={colors.error}
                                        style={{
                                            position: "absolute",
                                            top: -8,
                                            right: -8,
                                            margin: 0,
                                            backgroundColor: colors.surface,
                                        }}
                                        onPress={() => removeImage(idx)}
                                    />
                                </Surface>
                            ))}
                            {images.length < MAX_IMAGES && (
                                <TouchableRipple
                                    style={[
                                        styles.imageBox,
                                        {
                                            borderColor: colors.outlineVariant,
                                            borderWidth: 1.5,
                                            borderStyle: "dashed",
                                            justifyContent: "center",
                                            alignItems: "center",
                                        },
                                    ]}
                                    onPress={pickImage}
                                    borderless
                                >
                                    <Surface
                                        elevation={0}
                                        style={{ alignItems: "center" }}
                                    >
                                        <IconButton
                                            icon="camera-plus-outline"
                                            size={32}
                                            iconColor={colors.onSurfaceVariant}
                                        />
                                        <Text
                                            variant="labelSmall"
                                            style={{
                                                color: colors.onSurfaceVariant,
                                            }}
                                        >
                                            Add Photo
                                        </Text>
                                    </Surface>
                                </TouchableRipple>
                            )}
                        </Surface>

                        {/* Title */}
                        <TextInput
                            mode="flat"
                            label="Title"
                            value={title}
                            onChangeText={setTitle}
                            maxLength={100}
                        />

                        {/* Description */}
                        <TextInput
                            mode="flat"
                            label="Description"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={3}
                            maxLength={500}
                        />

                        {/* Price */}
                        <TextInput
                            mode="flat"
                            label="Price ($)"
                            value={price}
                            onChangeText={(t) =>
                                setPrice(t.replace(/[^0-9.]/g, ""))
                            }
                            keyboardType="decimal-pad"
                            left={<TextInput.Affix text="$" />}
                        />

                        {/* Category chips */}
                        <Text
                            variant="labelLarge"
                            style={{ color: colors.onSurfaceVariant }}
                        >
                            Category
                        </Text>
                        <Surface
                            elevation={0}
                            style={{
                                flexDirection: "row",
                                flexWrap: "wrap",
                                gap: 8,
                            }}
                        >
                            {CATEGORIES.map((cat) => (
                                <Chip
                                    key={cat}
                                    selected={category === cat}
                                    onPress={() =>
                                        setCategory(category === cat ? "" : cat)
                                    }
                                    showSelectedCheck={false}
                                    selectedColor={colors.onPrimary}
                                    style={
                                        category === cat
                                            ? {
                                                  backgroundColor:
                                                      colors.primary,
                                              }
                                            : undefined
                                    }
                                >
                                    {cat}
                                </Chip>
                            ))}
                        </Surface>

                        {/* Condition chips */}
                        <Text
                            variant="labelLarge"
                            style={{ color: colors.onSurfaceVariant }}
                        >
                            Condition
                        </Text>
                        <Surface
                            elevation={0}
                            style={{
                                flexDirection: "row",
                                flexWrap: "wrap",
                                gap: 8,
                            }}
                        >
                            {CONDITIONS.map((cond) => (
                                <Chip
                                    key={cond}
                                    selected={condition === cond}
                                    onPress={() =>
                                        setCondition(
                                            condition === cond ? "" : cond,
                                        )
                                    }
                                    showSelectedCheck={false}
                                    selectedColor={colors.onPrimary}
                                    style={
                                        condition === cond
                                            ? {
                                                  backgroundColor:
                                                      colors.primary,
                                              }
                                            : undefined
                                    }
                                >
                                    {cond}
                                </Chip>
                            ))}
                        </Surface>

                        {/* Submit */}
                        {loading ? (
                            <ActivityIndicator
                                animating
                                size="large"
                                style={{ marginTop: 8 }}
                            />
                        ) : (
                            <Button
                                mode="contained"
                                onPress={handleSubmit}
                                disabled={!canSubmit}
                                style={{ marginTop: 8, marginBottom: 24 }}
                            >
                                Post Listing
                            </Button>
                        )}
                    </ScrollView>
                </Surface>
            </Animated.View>

            {/* Error snackbar */}
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
        </>
    );
}

const styles = StyleSheet.create({
    imageBox: {
        width: 100,
        height: 100,
        borderRadius: 8,
        overflow: "visible",
    },
});
