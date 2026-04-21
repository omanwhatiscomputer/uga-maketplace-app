import {
    getSalesHistory,
    getPurchaseHistory,
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
    Chip,
    Divider,
    Surface,
    Text,
} from "react-native-paper";

type TransactionEntry = Transaction & { kind: "sale" | "purchase" };

function TransactionCard({ record }: { record: TransactionEntry }) {
    const { colors } = useAppTheme();
    const { kind } = record;
    const isSale = kind === "sale";
    const counterpart = isSale ? record.buyer : record.seller;
    const borderColor = isSale ? colors.outline : colors.error;

    return (
        <Card style={[styles.card, { borderColor, borderWidth: 1.5 }]}>
            <Card.Content style={styles.cardContent}>
                <Avatar.Text
                    size={44}
                    label={`${counterpart.firstName[0]}${counterpart.lastName[0]}`}
                    style={{
                        backgroundColor: isSale ? colors.primary : colors.errorContainer,
                    }}
                    color={isSale ? colors.onPrimary : colors.onErrorContainer}
                />
                <Surface elevation={0} style={styles.info}>
                    <Surface elevation={0} style={styles.row}>
                        <Text variant="titleSmall" style={{ color: colors.onSurface, flex: 1 }}>
                            {counterpart.firstName} {counterpart.lastName}
                        </Text>
                        <Chip
                            compact
                            style={{
                                backgroundColor: isSale
                                    ? colors.primaryContainer
                                    : colors.errorContainer,
                            }}
                            textStyle={{
                                fontSize: 10,
                                color: isSale ? colors.onPrimaryContainer : colors.onErrorContainer,
                            }}
                        >
                            {isSale ? "Sold" : "Purchased"}
                        </Chip>
                    </Surface>
                    {counterpart.mobileNumber ? (
                        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                            {counterpart.mobileNumber}
                        </Text>
                    ) : null}
                    <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                        {record.productName}
                    </Text>
                    <Surface elevation={0} style={styles.row}>
                        <Text variant="titleSmall" style={{ color: colors.primary }}>
                            ${record.price.toFixed(2)}
                        </Text>
                        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                            {new Date(record.date).toLocaleDateString()}
                        </Text>
                    </Surface>
                </Surface>
            </Card.Content>
        </Card>
    );
}

export default function TransactionHistoryScreen() {
    const { colors } = useAppTheme();
    const { user } = useAppContext();

    const [records, setRecords] = useState<TransactionEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTransactions = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [sales, purchases] = await Promise.all([
                getSalesHistory(),
                getPurchaseHistory(),
            ]);
            const combined: TransactionEntry[] = [
                ...sales.map((t) => ({ ...t, kind: "sale" as const })),
                ...purchases.map((t) => ({ ...t, kind: "purchase" as const })),
            ].sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
            );
            setRecords(combined);
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
                <Appbar.BackAction onPress={router.back} color={colors.primary} />
                <Appbar.Content title="Transaction History" />
            </Appbar.Header>

            <Divider />

            {loading ? (
                <ActivityIndicator animating size="large" style={styles.loader} />
            ) : (
                <FlatList
                    data={records}
                    keyExtractor={(item) => `${item.kind}-${item.id}`}
                    renderItem={({ item }) => <TransactionCard record={item} />}
                    style={{ flex: 1 }}
                    ListHeaderComponent={
                        <ThemedText variant={TextVariants.title_lg} style={styles.heading}>
                            Transaction History
                        </ThemedText>
                    }
                    ListEmptyComponent={
                        <ThemedText
                            variant={TextVariants.body_md}
                            style={[styles.empty, { color: colors.onSurfaceVariant }]}
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
        borderRadius: 8,
    },
    cardContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    info: {
        flex: 1,
        gap: 4,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
    },
});
