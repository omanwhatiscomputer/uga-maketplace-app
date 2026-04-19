import { getUserById } from "@/api/endpoints/users";
import { ThemedText } from "@/components/themed-text";
import { TextVariants } from "@/constants/typography";
import type { User } from "@/context/app-context";
import { useAppContext } from "@/context/app-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import {
    ActivityIndicator,
    Appbar,
    Divider,
    Surface,
} from "react-native-paper";

type FieldRowProps = {
    label: string;
    value: string;
};

function FieldRow({ label, value }: FieldRowProps) {
    const { colors } = useAppTheme();
    return (
        <Surface elevation={0} style={styles.fieldBlock}>
            <ThemedText
                variant={TextVariants.label_lg}
                style={{ color: colors.onSurfaceVariant }}
            >
                {label}
            </ThemedText>
            <ThemedText variant={TextVariants.body_md}>{value}</ThemedText>
        </Surface>
    );
}

export default function UserInfoScreen() {
    const { colors } = useAppTheme();
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { user } = useAppContext();

    const [seller, setSeller] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;
        getUserById(id, user.token)
            .then((data) => setSeller(data))
            .catch((err) => setError(err?.message ?? "Failed to load seller."))
            .finally(() => setLoading(false));
    }, [id, user]);

    const formattedDate = seller?.dateJoined
        ? new Date(seller.dateJoined).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
          })
        : null;

    return (
        <Surface style={styles.screen} elevation={0}>
            <Appbar.Header>
                <Appbar.Content
                    title="Seller Info"
                    titleStyle={{ fontWeight: "bold" }}
                />
                <Appbar.Action icon="close" onPress={() => router.back()} />
            </Appbar.Header>

            <Divider />

            {loading ? (
                <ActivityIndicator
                    animating
                    size="large"
                    style={styles.loader}
                />
            ) : error ? (
                <Surface elevation={0} style={styles.loader}>
                    <ThemedText
                        variant={TextVariants.body_md}
                        style={{ color: colors.error }}
                    >
                        {error}
                    </ThemedText>
                </Surface>
            ) : seller ? (
                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    <FieldRow label="First Name" value={seller.firstName} />
                    <Divider />
                    <FieldRow label="Last Name" value={seller.lastName} />
                    <Divider />
                    <FieldRow label="Email" value={seller.email} />
                    <Divider />
                    <FieldRow label="Phone" value={seller.mobileNumber} />
                    {formattedDate && (
                        <>
                            <Divider />
                            <FieldRow
                                label="Member Since"
                                value={formattedDate}
                            />
                        </>
                    )}
                </ScrollView>
            ) : null}
        </Surface>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        padding: 16,
        gap: 12,
    },
    fieldBlock: {
        gap: 4,
    },
});
