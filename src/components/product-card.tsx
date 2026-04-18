import type { ProductSummaryDTO } from "@/api/endpoints/products";
import { ThemedText } from "@/components/themed-text";
import { TextVariants } from "@/constants/typography";
import { useAppTheme } from "@/hooks/use-app-theme";
import { Image, StyleSheet } from "react-native";
import { Button, Card, Surface } from "react-native-paper";

type ProductCardProps = {
    product: ProductSummaryDTO;
    isWishlisted: boolean;
    isSubscribed: boolean;
    onPress: () => void;
    onToggleWishlist: () => void;
    onToggleSubscribe: () => void;
    showActions?: boolean;
};

export function ProductCard({
    product,
    isWishlisted,
    isSubscribed,
    onPress,
    onToggleWishlist,
    onToggleSubscribe,
    showActions = true,
}: ProductCardProps) {
    const { colors } = useAppTheme();

    const thumbnail = product.productImages[0] ?? null;

    const formattedDate = product.dateCreated
        ? new Date(product.dateCreated).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
          })
        : null;

    return (
        <Card style={styles.card} onPress={onPress}>
            <Card.Content>
                {/*
                 * Lesson from previous attempt: do NOT put flexDirection:row
                 * on Card.Content directly. Use a Surface wrapper inside it.
                 */}
                <Surface elevation={0} style={styles.row}>
                    {/*
                     * Lesson from previous attempt: wrap Image in a Surface
                     * container that owns overflow:hidden + borderRadius so
                     * the image is properly clipped on Android.
                     * Do NOT put overflow or borderRadius on the Image itself.
                     */}
                    <Surface
                        elevation={0}
                        style={[
                            styles.thumbnailContainer,
                            { backgroundColor: colors.surfaceVariant },
                        ]}
                    >
                        {thumbnail && (
                            <Image
                                source={{ uri: thumbnail }}
                                style={styles.thumbnailImage}
                                resizeMode="cover"
                            />
                        )}
                    </Surface>

                    <Surface elevation={0} style={styles.info}>
                        <ThemedText
                            variant={TextVariants.subtitle_sm}
                            numberOfLines={2}
                        >
                            {product.productName}
                        </ThemedText>
                        <ThemedText
                            variant={TextVariants.body_sm}
                            style={{ color: colors.onSurfaceVariant }}
                        >
                            {product.sellerName}
                        </ThemedText>
                        <ThemedText
                            variant={TextVariants.subtitle_sm}
                            style={{ color: colors.primary, marginTop: 4 }}
                        >
                            ${product.price.toFixed(2)}
                        </ThemedText>
                        {product.condition && (
                            <ThemedText
                                variant={TextVariants.body_sm}
                                style={{ color: colors.onSurfaceVariant }}
                            >
                                Condition: {product.condition}
                            </ThemedText>
                        )}
                        {formattedDate && (
                            <ThemedText
                                variant={TextVariants.label_sm}
                                style={{ color: colors.onSurfaceVariant }}
                            >
                                {formattedDate}
                            </ThemedText>
                        )}
                    </Surface>
                </Surface>
            </Card.Content>

            {showActions && (
                <Card.Actions style={styles.actions}>
                    <Button
                        mode={isWishlisted ? "contained" : "outlined"}
                        buttonColor={isWishlisted ? colors.primary : undefined}
                        textColor={isWishlisted ? colors.onPrimary : undefined}
                        icon={isWishlisted ? "heart" : "heart-outline"}
                        onPress={onToggleWishlist}
                        compact
                        style={styles.actionBtn}
                    >
                        {isWishlisted ? "Wishlisted" : "Wishlist"}
                    </Button>
                    <Button
                        mode={isSubscribed ? "contained" : "outlined"}
                        buttonColor={isSubscribed ? colors.primary : undefined}
                        textColor={isSubscribed ? colors.onPrimary : undefined}
                        icon={isSubscribed ? "bell" : "bell-outline"}
                        onPress={onToggleSubscribe}
                        compact
                        style={styles.actionBtn}
                    >
                        {isSubscribed ? "Subscribed" : "Subscribe"}
                    </Button>
                </Card.Actions>
            )}
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: 12,
        // borderRadius: 12,
        borderRadius: 0,
        paddingBottom: 12,
    },
    row: {
        flexDirection: "row",
        gap: 12,
        alignItems: "center",
    },
    thumbnailContainer: {
        width: 90,
        height: 90,
        // borderRadius: 8,
        borderRadius: 0,
        overflow: "hidden",
    },
    thumbnailImage: {
        width: 90,
        height: 90,
    },
    info: {
        flex: 1,
        gap: 2,
    },
    actions: {
        gap: 8,
        paddingBottom: 4,
        marginTop: 6,
    },
    actionBtn: {
        flex: 1,
        borderRadius: 0,
    },
});
