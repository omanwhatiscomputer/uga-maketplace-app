import { ThemedText } from "@/components/themed-text";
import { TextVariants } from "@/constants/typography";
import { useAppContext } from "@/context/app-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useGoogleAuth } from "@/hooks/use-google-auth";
import { Tabs, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Animated, Dimensions, Pressable, StyleSheet } from "react-native";
import {
    Appbar,
    Drawer,
    FAB,
    Icon,
    IconButton,
    Portal,
    Surface,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

const DRAWER_WIDTH = Dimensions.get("window").width * 0.75;
const MODAL_HEIGHT = 400;

export default function TabsLayout() {
    const router = useRouter();
    const { setUser } = useAppContext();
    const { signOut } = useGoogleAuth();
    const { colors } = useAppTheme();

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
                    name="subscribed"
                    options={{
                        title: "Subscribed",
                        tabBarIcon: ({ color }) => (
                            <Icon
                                source="bell-outline"
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

                {/* `Create post` modal backdrop */}
                <Animated.View
                    pointerEvents={modalVisible ? "auto" : "none"}
                    style={[
                        StyleSheet.absoluteFill,
                        {
                            backgroundColor: "rgba(0,0,0,0.5)",
                            opacity: modalBackdropOpacity,
                        },
                    ]}
                >
                    <Pressable
                        style={StyleSheet.absoluteFill}
                        onPress={closeModal}
                    />
                </Animated.View>

                {/* Create post modal */}
                <Animated.View
                    pointerEvents={modalVisible ? "auto" : "none"}
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
                            borderTopLeftRadius: 16,
                            borderTopRightRadius: 16,
                            padding: 16,
                        }}
                        elevation={4}
                    >
                        <Surface
                            style={{
                                flexDirection: "row",
                                justifyContent: "flex-end",
                            }}
                            elevation={0}
                        >
                            <IconButton icon="close" onPress={closeModal} />
                        </Surface>
                        <ThemedText variant={TextVariants.subtitle_md}>
                            Create Post
                        </ThemedText>
                        <ThemedText variant={TextVariants.label_sm}>
                            This is the Create Post modal - placeholder content
                        </ThemedText>
                    </Surface>
                </Animated.View>
            </Portal>
        </>
    );
}
