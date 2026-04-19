import { toggleAvailability, type ProductDTO, type UserSummaryDTO } from "@/api/endpoints/products";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, FlatList, StyleSheet } from "react-native";
import {
    ActivityIndicator,
    Avatar,
    Button,
    Divider,
    IconButton,
    Snackbar,
    Surface,
    Text,
    TouchableRipple,
} from "react-native-paper";
import * as Notifications from "expo-notifications";

const MODAL_HEIGHT = Dimensions.get("window").height * 0.6;

type MarkAsSoldModalProps = {
    visible: boolean;
    product: ProductDTO;
    onClose: () => void;
    onConfirm: (updated: ProductDTO) => void;
};

export function MarkAsSoldModal({
    visible,
    product,
    onClose,
    onConfirm,
}: MarkAsSoldModalProps) {
    const { colors } = useAppTheme();
    const translateY = useRef(new Animated.Value(MODAL_HEIGHT)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;

    const [selected, setSelected] = useState<UserSummaryDTO | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (visible) {
            setSelected(null);
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

    const handleConfirm = async () => {
        if (!selected) return;
        setLoading(true);
        setError(null);
        try {
            const updated = await toggleAvailability(product.id);

            if (selected.expoPushToken) {
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: "Item Sold to You!",
                        body: `${product.sellerName} has marked "${product.productName}" as sold to you. Meet up at the agreed location to complete the transaction.`,
                        data: { productId: product.id },
                    },
                    trigger: null,
                });

                await fetch("https://exp.host/--/api/v2/push/send", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        to: selected.expoPushToken,
                        title: "Item Sold to You!",
                        body: `${product.sellerName} has marked "${product.productName}" as sold to you. Meet up at the agreed location to complete the transaction.`,
                        data: { productId: product.id },
                    }),
                });
            }

            onConfirm(updated);
            onClose();
        } catch {
            setError("Failed to mark as sold.");
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
                            Select Buyer
                        </Text>
                        <IconButton icon="close" onPress={onClose} />
                    </Surface>

                    <Text
                        variant="bodySmall"
                        style={{ color: colors.onSurfaceVariant, paddingHorizontal: 16, paddingBottom: 8 }}
                    >
                        Choose the subscriber this item is being sold to.
                    </Text>

                    <FlatList
                        data={product.subscribers}
                        keyExtractor={(item) => item.id}
                        ItemSeparatorComponent={() => <Divider />}
                        renderItem={({ item }) => {
                            const isSelected = selected?.id === item.id;
                            return (
                                <TouchableRipple
                                    onPress={() => setSelected(item)}
                                    style={[
                                        styles.subscriberRow,
                                        isSelected && { backgroundColor: colors.primaryContainer },
                                    ]}
                                >
                                    <Surface
                                        elevation={0}
                                        style={[
                                            styles.subscriberInner,
                                            isSelected && { backgroundColor: colors.primaryContainer },
                                        ]}
                                    >
                                        <Avatar.Text
                                            size={40}
                                            label={`${item.firstName[0]}${item.lastName[0]}`}
                                            style={{ backgroundColor: colors.primary }}
                                            color={colors.onPrimary}
                                        />
                                        <Surface elevation={0} style={{ flex: 1, backgroundColor: "transparent" }}>
                                            <Text variant="titleSmall" style={{ color: colors.onSurface }}>
                                                {item.firstName} {item.lastName}
                                            </Text>
                                            <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                                                {item.email}
                                            </Text>
                                            <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                                                {item.mobileNumber}
                                            </Text>
                                        </Surface>
                                    </Surface>
                                </TouchableRipple>
                            );
                        }}
                        ListEmptyComponent={
                            <Text
                                variant="bodyMedium"
                                style={{ color: colors.onSurfaceVariant, textAlign: "center", marginTop: 24 }}
                            >
                                No subscribers yet.
                            </Text>
                        }
                        style={{ flex: 1 }}
                    />

                    <Surface elevation={0} style={styles.footer}>
                        {loading ? (
                            <ActivityIndicator animating size="large" />
                        ) : (
                            <Button
                                mode="contained"
                                onPress={handleConfirm}
                                disabled={!selected}
                                style={{ borderRadius: 0 }}
                            >
                                Confirm Sale
                            </Button>
                        )}
                    </Surface>
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
    subscriberRow: {
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    subscriberInner: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        backgroundColor: "transparent",
    },
    footer: {
        padding: 16,
        paddingBottom: 24,
    },
});
