import { useAppContext } from "@/context/app-context";
import { Redirect, Stack } from "expo-router";

export default function ProtectedLayout() {
    const { isAuthenticated } = useAppContext();

    if (!isAuthenticated) {
        return <Redirect href="/(auth)/landing" />;
    }

    return <Stack screenOptions={{ headerShown: false }} />;
}
