import { useAppContext } from "@/context/app-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { Redirect, Stack } from "expo-router";

export default function ProtectedLayout() {
    const { isAuthenticated } = useAppContext();
    const { colors } = useAppTheme();

    if (!isAuthenticated) {
        return <Redirect href="/(auth)/landing" />;
    }

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
            }}
        />
    );
}
