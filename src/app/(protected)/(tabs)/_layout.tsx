import { clearAuthToken } from "@/api/client";
import { getUserById } from "@/api/endpoints/users";
import { CreatePostModal } from "@/components/create-post-modal";
import { useAppContext } from "@/context/app-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useGoogleAuth } from "@/hooks/use-google-auth";
import { clearAuthData } from "@/utils/auth-storage";
import { Tabs, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Pressable, StyleSheet } from "react-native";
import {
    Appbar,
    Drawer,
    FAB,
    Icon,
    Portal,
    Surface,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

const DRAWER_WIDTH = Dimensions.get("window").width * 0.75;
const MODAL_HEIGHT = Dimensions.get("window").height * 0.88;

export default function TabsLayout() {
    const router = useRouter();
    const { user, setUser, setWishlisted, setSubscribed } = useAppContext();
    const { signOut } = useGoogleAuth();
    const { colors } = useAppTheme();

    useEffect(() => {
        if (!user) return;
        getUserById(user.id, user.token).then((data) => {
            setWishlisted(new Set(data.wishlist.map((p) => p.id)));
            setSubscribed(new Set(data.subscriptions.map((p) => p.id)));
        }).catch(() => {});
    }, [user]);

    const [drawerOpen, setDrawerOpen] = useState(false);
    const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;

    const [modalVisible, setModalVisible] = useState(false);
    const translateY = useRef(new Animated.Value(MODAL_HEIGHT)).current;
    const modalBackdropOpacity = useRef(new Animated.Value(0)).current;

    const openDrawer = () => {
        setDrawerOpen(true);
        Animated.parallel([
            Animated.timing(translateX, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(backdropOpacity, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const closeDrawer = () => {
        Animated.parallel([
            Animated.timing(translateX, {
                toValue: -DRAWER_WIDTH,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(backdropOpacity, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start(() => setDrawerOpen(false));
    };

    const openModal = () => {
        setModalVisible(true);
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(modalBackdropOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const closeModal = () => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: MODAL_HEIGHT,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(modalBackdropOpacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => setModalVisible(false));
    };

    const handleSignOut = async () => {
        closeDrawer();
        await signOut();
        await clearAuthData();
        clearAuthToken();
        setUser(null);
        router.replace("/(auth)/landing");
    };

    const navigateTo = (path: string) => {
        closeDrawer();
        router.push(path as any);
    };

    return (
        <>
            <Tabs
                screenOptions={{
                    tabBarActiveTintColor: colors.primary,
                    tabBarInactiveTintColor: colors.onSurfaceVariant,
                    tabBarStyle: {
                        backgroundColor: colors.elevation.level2,
                        borderTopColor: colors.outlineVariant,
                    },
                    header: () => (
                        <Appbar.Header>
                            <Appbar.Action icon="menu" onPress={openDrawer} />
                            <Appbar.Content title="UGA Marketplace" />
                        </Appbar.Header>
                    ),
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: "Explore",
                        tabBarIcon: ({ color }) => (
                            <Icon
                                source="compass-outline"
                                size={24}
                                color={color}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="category"
                    options={{
                        title: "Category",
                        tabBarIcon: ({ color }) => (
                            <Icon
                                source="shape-outline"
                                size={24}
                                color={color}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="subscribed"
                    options={{
                        title: "Subscribed",
                        tabBarIcon: ({ color }) => (
                            <Icon
                                source="cart-outline"
                                size={24}
                                color={color}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="wishlist"
                    options={{
                        title: "Wishlist",
                        tabBarIcon: ({ color }) => (
                            <Icon
                                source="heart-outline"
                                size={24}
                                color={color}
                            />
                        ),
                    }}
                />
            </Tabs>

            <FAB
                icon="pen"
                style={{
                    position: "absolute",
                    bottom: 80,
                    right: 24,
                    backgroundColor: colors.primary,
                    borderRadius: 28,
                }}
                color={colors.onPrimary}
                onPress={openModal}
            />

            <Portal>
                {/* Drawer backdrop */}
                <Animated.View
                    pointerEvents={drawerOpen ? "auto" : "none"}
                    style={[
                        StyleSheet.absoluteFill,
                        {
                            backgroundColor: "rgba(0,0,0,0.5)",
                            opacity: backdropOpacity,
                        },
                    ]}
                >
                    <Pressable
                        style={StyleSheet.absoluteFill}
                        onPress={closeDrawer}
                    />
                </Animated.View>

                {/* Drawer panel */}
                <Animated.View
                    pointerEvents={drawerOpen ? "auto" : "none"}
                    style={{
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        left: 0,
                        width: DRAWER_WIDTH,
                        transform: [{ translateX }],
                    }}
                >
                    <Surface style={{ flex: 1 }} elevation={2}>
                        <SafeAreaView style={{ flex: 1 }}>
                            <Drawer.Section style={{ marginTop: 16 }}>
                                <Drawer.Item
                                    label="My Active Posts"
                                    icon="pencil-box-outline"
                                    onPress={() =>
                                        navigateTo("/(protected)/active-posts")
                                    }
                                />
                                <Drawer.Item
                                    label="Transaction History"
                                    icon="history"
                                    onPress={() =>
                                        navigateTo(
                                            "/(protected)/transaction-history",
                                        )
                                    }
                                />
                                <Drawer.Item
                                    label="Update Account"
                                    icon="account-edit-outline"
                                    onPress={() =>
                                        navigateTo(
                                            "/(protected)/update-account",
                                        )
                                    }
                                />
                            </Drawer.Section>
                            <Surface elevation={0} style={{ flex: 1 }}>
                                <> </>
                            </Surface>
                            <Drawer.Section showDivider={false}>
                                <Drawer.Item
                                    label="Sign Out"
                                    icon="logout"
                                    onPress={handleSignOut}
                                />
                            </Drawer.Section>
                        </SafeAreaView>
                    </Surface>
                </Animated.View>

                <CreatePostModal
                    visible={modalVisible}
                    translateY={translateY}
                    backdropOpacity={modalBackdropOpacity}
                    onClose={closeModal}
                />
            </Portal>
        </>
    );
}
