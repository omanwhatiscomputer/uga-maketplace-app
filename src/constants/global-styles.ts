import { Platform, StyleSheet } from "react-native";
const Spacing = {
    half: 2,
    one: 4,
    two: 8,
    three: 16,
    four: 24,
    five: 32,
    six: 64,
} as const;

const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
const MaxContentWidth = 800;

export const globalStyles = StyleSheet.create({
    safeAreaExtra: {
        flex: 1,
        paddingHorizontal: Spacing.four,
        alignItems: "center",
        gap: Spacing.three,
        paddingBottom: BottomTabInset + Spacing.three,
        maxWidth: MaxContentWidth,
    },
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
    },
    landingPageButtons: {
        width: "70%",
    },
});
