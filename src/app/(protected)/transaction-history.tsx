import {
    getSalesHistory,
    type Transaction,
} from "@/api/endpoints/transactions";
import { ThemedText } from "@/components/themed-text";
import { TextVariants } from "@/constants/typography";
import { useAppContext } from "@/context/app-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet } from "react-native";
import {
    ActivityIndicator,
    Appbar,
    Avatar,
    Card,
    Divider,
    Surface,
    Text,
} from "react-native-paper";

function TransactionCard({ record }: { record: Transaction }) {
    const { colors } = useAppTheme();
    const { buyer } = record;

    return (
        <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
                <Avatar.Text
                    size={44}
                    label={`${buyer.firstName[0]}${buyer.lastName[0]}`}
                    style={{ backgroundColor: colors.primary }}
                    color={colors.onPrimary}
                />
                <Surface elevation={0} style={styles.info}>
                    <Text
                        variant="titleSmall"
                        style={{ color: colors.onSurface }}
                    >
                        {buyer.firstName} {buyer.lastName}
                    </Text>
                    {buyer.mobileNumber ? (
                        <Text
                            variant="bodySmall"
                            style={{ color: colors.onSurfaceVariant }}
                        >
                            {buyer.mobileNumber}
                        </Text>
                    ) : null}
                    <Text
                        variant="bodySmall"
                        style={{ color: colors.onSurfaceVariant }}
                    >
                        {record.productName}
                    </Text>
                    <Text
                        variant="titleSmall"
                        style={{ color: colors.primary, marginTop: 2 }}
                    >
                        ${record.price.toFixed(2)}
                    </Text>
                </Surface>
            </Card.Content>
        </Card>
    );
}

export default function TransactionHistoryScreen() {
    const { colors } = useAppTheme();
    const { user } = useAppContext();

    const [records, setRecords] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTransactions = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await getSalesHistory();
            setRecords(data);
        } catch {
            // silently fail
        } finally {
            setLoading(false);
        }
    }, [user]);

    useFocusEffect(fetchTransactions);

    return (
        <Surface style={styles.screen} elevation={0}>
            <Appbar.Header>
                <Appbar.BackAction
                    onPress={router.back}
                    color={colors.primary}
                />
                <Appbar.Content title="Transaction History" />
            </Appbar.Header>

            <Divider />

            {loading ? (
                <ActivityIndicator
                    animating
                    size="large"
                    style={styles.loader}
                />
            ) : (
                <FlatList
                    data={records}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <TransactionCard record={item} />}
                    ListHeaderComponent={
                        <ThemedText
                            variant={TextVariants.title_lg}
                            style={styles.heading}
                        >
                            Transaction History
                        </ThemedText>
                    }
                    ListEmptyComponent={
                        <ThemedText
                            variant={TextVariants.body_md}
                            style={[
                                styles.empty,
                                { color: colors.onSurfaceVariant },
                            ]}
                        >
                            No transactions yet.
                        </ThemedText>
                    }
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </Surface>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    loader: { flex: 1 },
    list: { padding: 16, paddingBottom: 100 },
    heading: { marginBottom: 16 },
    empty: { textAlign: "center", marginTop: 40 },
    card: {
        marginBottom: 12,
        borderRadius: 0,
    },
    cardContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    info: {
        flex: 1,
        gap: 2,
    },
});
