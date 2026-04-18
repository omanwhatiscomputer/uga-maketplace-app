import { setAuthToken } from "@/api/client";
import { getUserById } from "@/api/endpoints/users";
import { DarkTheme, LightTheme } from "@/constants/theme";
import { AppProvider, useAppContext } from "@/context/app-context";
import { clearAuthData, getAuthData } from "@/utils/auth-storage";
import { Slot } from "expo-router";
import React, { useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";

function AppInitializer({ children }: { children: React.ReactNode }) {
    const { setUser } = useAppContext();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        async function restoreSession() {
            const stored = await getAuthData();
            if (stored) {
                try {
                    const user = await getUserById(stored.userId, stored.token);
                    setAuthToken(stored.token);
                    setUser(user);
                } catch {
                    await clearAuthData();
                }
            }
            setIsReady(true);
        }
        restoreSession();
    }, []);

    if (!isReady) return null;

    return <>{children}</>;
}

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const activeTheme = colorScheme === "dark" ? DarkTheme : LightTheme;

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <AppProvider>
                <PaperProvider theme={activeTheme}>
                    <AppInitializer>
                        <Slot />
                    </AppInitializer>
                </PaperProvider>
            </AppProvider>
        </GestureHandlerRootView>
    );
}
