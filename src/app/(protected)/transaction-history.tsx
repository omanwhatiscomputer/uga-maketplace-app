import { ThemedText } from "@/components/themed-text";
import { globalStyles } from "@/constants/global-styles";
import { TextVariants } from "@/constants/typography";
import { useAppTheme } from "@/hooks/use-app-theme";
import { router } from "expo-router";
import { Appbar, Surface } from "react-native-paper";

export default function TransactionHistoryScreen() {
    const { colors } = useAppTheme();

    return (
        <Surface style={{ flex: 1 }} elevation={0}>
            <Appbar.Header>
                <Appbar.BackAction onPress={router.back} color={colors.primary} />
                <Appbar.Content title="Transaction History" />
            </Appbar.Header>
            <Surface
                style={[globalStyles.container, { flexDirection: "column" }]}
                elevation={0}
            >
                <ThemedText variant={TextVariants.heading_md}>
                    This is the Transaction History screen
                </ThemedText>
            </Surface>
        </Surface>
    );
}
