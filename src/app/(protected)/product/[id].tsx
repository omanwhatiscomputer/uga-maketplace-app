import { ThemedText } from "@/components/themed-text";
import { TextVariants } from "@/constants/typography";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet } from "react-native";
import { Divider, Surface } from "react-native-paper";

export default function ProductDetailScreen() {
    const { colors } = useAppTheme();
    const { id, productName, imageUrls } = useLocalSearchParams<{
        id: string;
        productName: string;
        imageUrls: string;
    }>();

    const urls = imageUrls ? imageUrls.split("||") : [];

    return (
        <Surface style={styles.screen} elevation={0}>
            <ScrollView contentContainerStyle={styles.content}>
                <ThemedText variant={TextVariants.title_sm}>
                    {productName ?? "Product Details"}
                </ThemedText>

                <Divider style={styles.divider} />

                <ThemedText
                    variant={TextVariants.label_lg}
                    style={{ color: colors.onSurfaceVariant }}
                >
                    Product ID
                </ThemedText>
                <ThemedText variant={TextVariants.body_sm}>{id}</ThemedText>

                <Divider style={styles.divider} />

                <ThemedText
                    variant={TextVariants.label_lg}
                    style={{ color: colors.onSurfaceVariant }}
                >
                    Image URLs ({urls.length})
                </ThemedText>
                {urls.map((url, i) => (
                    <ThemedText
                        key={i}
                        variant={TextVariants.body_sm}
                        style={{ color: colors.primary, marginTop: 4 }}
                    >
                        {i + 1}. {url}
                    </ThemedText>
                ))}
            </ScrollView>
        </Surface>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    content: {
        padding: 16,
        gap: 8,
    },
    divider: {
        marginVertical: 8,
    },
});
