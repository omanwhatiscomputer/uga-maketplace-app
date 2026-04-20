import {
    deleteProduct,
    getProductById,
    toggleAvailability,
    updateProductLocation,
    type Product,
    type UserSummary,
} from "@/api/endpoints/products";
import { getUserById } from "@/api/endpoints/users";
import { EditProductModal } from "@/components/edit-product-modal";
import { MarkAsSoldModal } from "@/components/mark-as-sold-modal";
import { MeetupLocationModal } from "@/components/meetup-location-modal";
import { ThemedText } from "@/components/themed-text";
import { TextVariants } from "@/constants/typography";
import type { User } from "@/context/app-context";
import { useAppContext } from "@/context/app-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    Dimensions,
    FlatList,
    Image,
    Linking,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import {
    ActivityIndicator,
    Appbar,
    Avatar,
    Button,
    Card,
    Divider,
    IconButton,
    Portal,
    Surface,
    Text,
    TouchableRipple,
} from "react-native-paper";
import { TabScreen, Tabs, TabsProvider } from "react-native-paper-tabs";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const CAROUSEL_HEIGHT = 260;

function FullScreenImage({
    uri,
    onClose,
}: {
    uri: string;
    onClose: () => void;
}) {
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);

    const pinch = Gesture.Pinch()
        .onUpdate((e) => {
            scale.value = Math.max(1, Math.min(savedScale.value * e.scale, 5));
        })
        .onEnd(() => {
            savedScale.value = scale.value;
        });

    const doubleTap = Gesture.Tap()
        .numberOfTaps(2)
        .onEnd(() => {
            scale.value = withTiming(1);
            savedScale.value = 1;
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <View style={styles.fullScreenOverlay}>
            <GestureDetector gesture={Gesture.Simultaneous(pinch, doubleTap)}>
                <Animated.Image
                    source={{ uri }}
                    style={[styles.fullScreenImage, animatedStyle]}
                    resizeMode="contain"
                />
            </GestureDetector>
            <IconButton
                icon="close"
                size={28}
                iconColor="white"
                style={styles.fullScreenClose}
                onPress={onClose}
            />
        </View>
    );
}

function SubscriberCard({ subscriber }: { subscriber: UserSummary }) {
    const { colors } = useAppTheme();
    return (
        <Card style={styles.subscriberCard}>
            <Card.Content style={styles.subscriberContent}>
                <Avatar.Text
                    size={44}
                    label={`${subscriber.firstName[0]}${subscriber.lastName[0]}`}
                    style={{ backgroundColor: colors.primary }}
                    color={colors.onPrimary}
                />
                <Surface elevation={0} style={{ flex: 1 }}>
                    <Text
                        variant="titleSmall"
                        style={{ color: colors.onSurface }}
                    >
                        {subscriber.firstName} {subscriber.lastName}
                    </Text>
                    <Text
                        variant="bodySmall"
                        style={{ color: colors.onSurfaceVariant }}
                    >
                        {subscriber.email}
                    </Text>
                    <Text
                        variant="bodySmall"
                        style={{ color: colors.onSurfaceVariant }}
                    >
                        {subscriber.mobileNumber}
                    </Text>
                </Surface>
            </Card.Content>
        </Card>
    );
}

export default function MyProductScreen() {
    const { colors } = useAppTheme();
    const router = useRouter();
    const { id, productName: initialName } = useLocalSearchParams<{
        id: string;
        productName: string;
    }>();
    const { user } = useAppContext();

    const [product, setProduct] = useState<Product | null>(null);
    const [seller, setSeller] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const [fullScreenUri, setFullScreenUri] = useState<string | null>(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [soldModalVisible, setSoldModalVisible] = useState(false);
    const [meetupModalVisible, setMeetupModalVisible] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        getProductById(id)
            .then(async (p) => {
                setProduct(p);
                if (user) {
                    try {
                        const s = await getUserById(p.sellerId, user.token);
                        setSeller(s);
                    } catch {}
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [id, user]);

    const handleDelete = () => {
        Alert.alert(
            "Delete Listing",
            "Are you sure you want to delete this listing? This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        setDeleting(true);
                        try {
                            await deleteProduct(id);
                            router.back();
                        } catch {
                            setDeleting(false);
                        }
                    },
                },
            ],
        );
    };

    const handleToggleAvailability = async () => {
        if (!product) return;
        if (product.isAvailable) {
            setSoldModalVisible(true);
        } else {
            try {
                const updated = await toggleAvailability(product.id);
                setProduct(updated);
            } catch {}
        }
    };

    const handleLocationConfirm = async (location: {
        latitude: number;
        longitude: number;
    }) => {
        if (!product) return;
        try {
            const updated = await updateProductLocation(
                product.id,
                location.latitude,
                location.longitude,
            );
            setProduct(updated);
        } catch {}
    };

    const openInMaps = (lat: number, lng: number) => {
        Linking.openURL(
            `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
        );
    };

    return (
        <Surface style={styles.screen} elevation={0}>
            <Appbar.Header>
                <Appbar.Content
                    title={product?.productName ?? initialName ?? "My Listing"}
                    titleStyle={{ fontWeight: "bold" }}
                />
                <Appbar.Action
                    icon="pencil"
                    onPress={() => setEditModalVisible(true)}
                />
                <Appbar.Action icon="close" onPress={() => router.back()} />
            </Appbar.Header>

            <Divider />

            {loading ? (
                <ActivityIndicator
                    animating
                    size="large"
                    style={styles.loader}
                />
            ) : product ? (
                <TabsProvider defaultIndex={0}>
                    <Tabs
                        style={{ backgroundColor: colors.surface }}
                        theme={{ colors: { primary: colors.primary } }}
                    >
                        <TabScreen label="Details">
                            <ScrollView
                                contentContainerStyle={styles.content}
                                showsVerticalScrollIndicator={false}
                                style={{ backgroundColor: colors.background }}
                            >
                                {/* Mark as sold / available */}
                                <Button
                                    mode="contained"
                                    buttonColor={
                                        product.isAvailable
                                            ? colors.primary
                                            : colors.secondary
                                    }
                                    textColor={
                                        product.isAvailable
                                            ? colors.onPrimary
                                            : colors.onSecondary
                                    }
                                    onPress={handleToggleAvailability}
                                    style={styles.availabilityBtn}
                                >
                                    {product.isAvailable
                                        ? "Mark as Sold"
                                        : "Mark as Available"}
                                </Button>

                                {/* Description */}
                                {product.productDescription ? (
                                    <Surface
                                        elevation={0}
                                        style={styles.fieldBlock}
                                    >
                                        <ThemedText
                                            variant={TextVariants.label_lg}
                                            style={{
                                                color: colors.onSurfaceVariant,
                                            }}
                                        >
                                            Description:
                                        </ThemedText>
                                        <ThemedText
                                            variant={TextVariants.body_md}
                                        >
                                            {product.productDescription}
                                        </ThemedText>
                                    </Surface>
                                ) : null}

                                {/* Price */}
                                <Surface elevation={0} style={styles.inlineRow}>
                                    <ThemedText
                                        variant={TextVariants.label_lg}
                                        style={{
                                            color: colors.onSurfaceVariant,
                                        }}
                                    >
                                        Price:
                                    </ThemedText>
                                    <ThemedText
                                        variant={TextVariants.subtitle_sm}
                                        style={{ color: colors.primary }}
                                    >
                                        ${product.price.toFixed(2)}
                                    </ThemedText>
                                </Surface>

                                {/* Image carousel */}
                                {product.productImages.length > 0 && (
                                    <Surface
                                        elevation={0}
                                        style={styles.carouselWrapper}
                                    >
                                        <FlatList
                                            data={product.productImages}
                                            keyExtractor={(_, i) => String(i)}
                                            horizontal
                                            pagingEnabled
                                            showsHorizontalScrollIndicator={
                                                false
                                            }
                                            onMomentumScrollEnd={(e) => {
                                                setActiveIndex(
                                                    Math.round(
                                                        e.nativeEvent
                                                            .contentOffset.x /
                                                            SCREEN_WIDTH,
                                                    ),
                                                );
                                            }}
                                            renderItem={({ item }) => (
                                                <TouchableRipple
                                                    onPress={() =>
                                                        setFullScreenUri(item)
                                                    }
                                                    style={
                                                        styles.carouselImageWrapper
                                                    }
                                                >
                                                    <Image
                                                        source={{ uri: item }}
                                                        style={
                                                            styles.carouselImage
                                                        }
                                                        resizeMode="cover"
                                                    />
                                                </TouchableRipple>
                                            )}
                                        />
                                        {product.productImages.length > 1 && (
                                            <Surface
                                                elevation={0}
                                                style={styles.dots}
                                            >
                                                {product.productImages.map(
                                                    (_, i) => (
                                                        <View
                                                            key={i}
                                                            style={[
                                                                styles.dot,
                                                                {
                                                                    backgroundColor:
                                                                        i ===
                                                                        activeIndex
                                                                            ? colors.primary
                                                                            : colors.outlineVariant,
                                                                },
                                                            ]}
                                                        />
                                                    ),
                                                )}
                                            </Surface>
                                        )}
                                    </Surface>
                                )}

                                <Divider style={styles.divider} />

                                {/* Condition */}
                                <Surface elevation={0} style={styles.inlineRow}>
                                    <ThemedText
                                        variant={TextVariants.label_lg}
                                        style={{
                                            color: colors.onSurfaceVariant,
                                        }}
                                    >
                                        Condition:
                                    </ThemedText>
                                    <ThemedText variant={TextVariants.body_md}>
                                        {product.condition}
                                    </ThemedText>
                                </Surface>

                                {/* Category */}
                                <Surface elevation={0} style={styles.inlineRow}>
                                    <ThemedText
                                        variant={TextVariants.label_lg}
                                        style={{
                                            color: colors.onSurfaceVariant,
                                        }}
                                    >
                                        Category:
                                    </ThemedText>
                                    <ThemedText variant={TextVariants.body_md}>
                                        {product.category}
                                    </ThemedText>
                                </Surface>

                                {/* Contact info */}
                                {seller?.email ? (
                                    <Surface
                                        elevation={0}
                                        style={styles.inlineRow}
                                    >
                                        <ThemedText
                                            variant={TextVariants.label_lg}
                                            style={{
                                                color: colors.onSurfaceVariant,
                                            }}
                                        >
                                            Email:
                                        </ThemedText>
                                        <ThemedText
                                            variant={TextVariants.body_md}
                                        >
                                            {seller.email}
                                        </ThemedText>
                                    </Surface>
                                ) : null}
                                {seller?.mobileNumber ? (
                                    <Surface
                                        elevation={0}
                                        style={styles.inlineRow}
                                    >
                                        <ThemedText
                                            variant={TextVariants.label_lg}
                                            style={{
                                                color: colors.onSurfaceVariant,
                                            }}
                                        >
                                            Phone:
                                        </ThemedText>
                                        <ThemedText
                                            variant={TextVariants.body_md}
                                        >
                                            {seller.mobileNumber}
                                        </ThemedText>
                                    </Surface>
                                ) : null}

                                <Divider style={styles.divider} />

                                {/* Meetup location */}
                                {product.meetupLocation && (
                                    <MapView
                                        provider={PROVIDER_GOOGLE}
                                        style={styles.locationPreview}
                                        initialRegion={{
                                            latitude:
                                                product.meetupLocation.latitude,
                                            longitude:
                                                product.meetupLocation
                                                    .longitude,
                                            latitudeDelta: 0.01,
                                            longitudeDelta: 0.01,
                                        }}
                                        scrollEnabled={false}
                                        zoomEnabled={false}
                                        pitchEnabled={false}
                                        rotateEnabled={false}
                                        pointerEvents="none"
                                    >
                                        <Marker
                                            coordinate={product.meetupLocation}
                                        />
                                    </MapView>
                                )}

                                <Button
                                    mode="outlined"
                                    icon="map-marker"
                                    onPress={() => setMeetupModalVisible(true)}
                                    style={styles.locationBtn}
                                >
                                    {product.meetupLocation
                                        ? "Update Meetup Location"
                                        : "Set Meetup Location"}
                                </Button>

                                {product.meetupLocation && (
                                    <Button
                                        mode="text"
                                        icon="directions"
                                        onPress={() =>
                                            openInMaps(
                                                product.meetupLocation!
                                                    .latitude,
                                                product.meetupLocation!
                                                    .longitude,
                                            )
                                        }
                                    >
                                        Open in Google Maps
                                    </Button>
                                )}

                                <Divider style={styles.divider} />

                                {/* Delete */}
                                <Button
                                    mode="contained"
                                    buttonColor={colors.primary}
                                    textColor={colors.onPrimary}
                                    icon="trash-can-outline"
                                    onPress={handleDelete}
                                    loading={deleting}
                                    disabled={deleting}
                                    style={[styles.deleteBtn]}
                                >
                                    Delete Listing
                                </Button>
                            </ScrollView>
                        </TabScreen>

                        <TabScreen label="Subscribers">
                            <FlatList
                                data={product.subscribers}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <SubscriberCard subscriber={item} />
                                )}
                                style={{ flex: 1, backgroundColor: colors.background }}
                                contentContainerStyle={styles.subscriberList}
                                ListEmptyComponent={
                                    <ThemedText
                                        variant={TextVariants.body_md}
                                        style={[
                                            styles.empty,
                                            { color: colors.onSurfaceVariant },
                                        ]}
                                    >
                                        No subscribers yet.
                                    </ThemedText>
                                }
                                showsVerticalScrollIndicator={false}
                            />
                        </TabScreen>
                    </Tabs>
                </TabsProvider>
            ) : (
                <Surface elevation={0} style={styles.loader}>
                    <ThemedText
                        variant={TextVariants.body_md}
                        style={{ color: colors.onSurfaceVariant }}
                    >
                        Product not found.
                    </ThemedText>
                </Surface>
            )}

            {/* Full screen image viewer */}
            <Portal>
                {fullScreenUri && (
                    <FullScreenImage
                        uri={fullScreenUri}
                        onClose={() => setFullScreenUri(null)}
                    />
                )}
            </Portal>

            {/* Edit modal */}
            {editModalVisible && product && (
                <Portal>
                    <EditProductModal
                        visible={editModalVisible}
                        product={product}
                        onClose={() => setEditModalVisible(false)}
                        onUpdated={(updated) => setProduct(updated)}
                    />
                </Portal>
            )}

            {/* Mark as sold modal */}
            {soldModalVisible && product && (
                <Portal>
                    <MarkAsSoldModal
                        visible={soldModalVisible}
                        product={product}
                        onClose={() => setSoldModalVisible(false)}
                        onConfirm={(updated) => setProduct(updated)}
                    />
                </Portal>
            )}

            {/* Meetup location modal */}
            {meetupModalVisible && (
                <Portal>
                    <MeetupLocationModal
                        visible={meetupModalVisible}
                        initialLocation={product?.meetupLocation}
                        onClose={() => setMeetupModalVisible(false)}
                        onConfirm={handleLocationConfirm}
                    />
                </Portal>
            )}
        </Surface>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    loader: { flex: 1, justifyContent: "center", alignItems: "center" },
    content: { padding: 16, gap: 12 },
    fieldBlock: { gap: 4 },
    inlineRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    carouselWrapper: { marginHorizontal: -16 },
    carouselImageWrapper: { width: SCREEN_WIDTH, height: CAROUSEL_HEIGHT },
    carouselImage: { width: SCREEN_WIDTH, height: CAROUSEL_HEIGHT },
    dots: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 6,
        paddingTop: 8,
    },
    dot: { width: 7, height: 7, borderRadius: 4 },
    divider: { marginVertical: 4 },
    availabilityBtn: { borderRadius: 0 },
    locationPreview: { height: 180, marginHorizontal: -16 },
    locationBtn: { borderRadius: 0 },
    deleteBtn: { borderRadius: 0, marginBottom: 16 },
    subscriberList: { padding: 16, gap: 12, paddingBottom: 100 },
    subscriberCard: { borderRadius: 0 },
    subscriberContent: { flexDirection: "row", alignItems: "center", gap: 12 },
    empty: { textAlign: "center", marginTop: 40 },
    fullScreenOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        backgroundColor: "black",
        justifyContent: "center",
        alignItems: "center",
    },
    fullScreenImage: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT },
    fullScreenClose: {
        position: "absolute",
        top: 40,
        right: 8,
        backgroundColor: "rgba(0,0,0,0.5)",
        borderRadius: 20,
    },
});
