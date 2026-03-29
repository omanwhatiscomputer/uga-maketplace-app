import { DarkTheme, LightTheme } from "@/constants/theme";
import { AppProvider } from "@/context/app-context";
import { Slot } from "expo-router";
import React from "react";
import { useColorScheme } from "react-native";
import { PaperProvider } from "react-native-paper";

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const activeTheme = colorScheme === "dark" ? DarkTheme : LightTheme;

    // const { user } = useAuth();
    const user = false;

    return (
        <AppProvider>
            <PaperProvider theme={activeTheme}>
                <Slot />
            </PaperProvider>
        </AppProvider>
    );
}
