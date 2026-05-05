import { updateUser } from "@/api/endpoints/users";
import { useAppContext } from "@/context/app-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet } from "react-native";
import {
    Appbar,
    Button,
    Snackbar,
    Surface,
    Text,
    TextInput,
} from "react-native-paper";

export default function UpdateAccountScreen() {
    const { colors } = useAppTheme();
    const { user, setUser } = useAppContext();

    const formatRaw = (digits: string) => {
        if (digits.length > 6)
            return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
        if (digits.length > 3)
            return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
        if (digits.length > 0) return `(${digits}`;
        return "";
    };

    const [rawPhone, setRawPhone] = useState(user?.mobileNumber ?? "");
    const [phone, setPhone] = useState(formatRaw(user?.mobileNumber ?? ""));
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const formatPhone = (text: string) => {
        const digits = text.replace(/\D/g, "").slice(0, 10);
        setRawPhone(digits);
        setPhone(formatRaw(digits));
    };

    const unchanged = rawPhone === user?.mobileNumber;
    const disabled = loading || rawPhone.length !== 10 || unchanged;

    const handleSave = async () => {
        setLoading(true);
        setError(null);
        try {
            await updateUser(rawPhone);
            setUser({ ...user!, mobileNumber: rawPhone });
            setSuccess(true);
        } catch {
            setError("Failed to update phone number.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Surface style={{ flex: 1 }} elevation={0}>
            <Appbar.Header>
                <Appbar.BackAction
                    onPress={router.back}
                    color={colors.primary}
                />
                <Appbar.Content title="Update Account" />
            </Appbar.Header>

            <Surface style={styles.form} elevation={0}>
                <Surface style={styles.readOnlyGroup} elevation={0}>
                    <Surface style={styles.field} elevation={0}>
                        <Text
                            variant="labelMedium"
                            style={{ color: colors.onSurfaceVariant }}
                        >
                            Name
                        </Text>
                        <Text
                            variant="bodyLarge"
                            style={{ color: colors.onSurface }}
                        >
                            {user?.firstName} {user?.lastName}
                        </Text>
                    </Surface>

                    <Surface style={styles.field} elevation={0}>
                        <Text
                            variant="labelMedium"
                            style={{ color: colors.onSurfaceVariant }}
                        >
                            Email
                        </Text>
                        <Text
                            variant="bodyLarge"
                            style={{ color: colors.onSurface }}
                        >
                            {user?.email}
                        </Text>
                    </Surface>

                    <Surface style={styles.field} elevation={0}>
                        <Text
                            variant="labelMedium"
                            style={{ color: colors.onSurfaceVariant }}
                        >
                            Member since
                        </Text>
                        <Text
                            variant="bodyLarge"
                            style={{ color: colors.onSurface }}
                        >
                            {user?.dateJoined
                                ? new Date(user.dateJoined).toLocaleDateString()
                                : "-"}
                        </Text>
                    </Surface>
                </Surface>

                <TextInput
                    label="Phone Number"
                    value={phone}
                    onChangeText={formatPhone}
                    placeholder="(XXX) XXX-XXXX"
                    keyboardType="phone-pad"
                    maxLength={14}
                    mode="outlined"
                    style={styles.input}
                />

                <Button
                    mode="contained"
                    onPress={handleSave}
                    disabled={disabled}
                    loading={loading}
                    style={styles.button}
                >
                    Save Changes
                </Button>
            </Surface>

            <Snackbar
                visible={success}
                onDismiss={() => setSuccess(false)}
                duration={3000}
                style={{
                    borderRadius: 36,
                    backgroundColor: colors.primaryContainer,
                    width: "90%",
                    alignSelf: "center",
                }}
                theme={{
                    colors: { inverseSurface: colors.onPrimaryContainer },
                }}
                action={{
                    label: "✕",
                    onPress: () => setSuccess(false),
                    textColor: colors.onPrimaryContainer,
                }}
            >
                <Text style={{ color: colors.onPrimaryContainer }}>
                    Phone number updated.
                </Text>
            </Snackbar>

            <Snackbar
                visible={!!error}
                onDismiss={() => setError(null)}
                style={{
                    borderRadius: 36,
                    backgroundColor: colors.errorContainer,
                    width: "90%",
                    alignSelf: "center",
                }}
                theme={{ colors: { inverseSurface: colors.onErrorContainer } }}
                action={{
                    label: "✕",
                    onPress: () => setError(null),
                    textColor: colors.onErrorContainer,
                }}
            >
                <Text style={{ color: colors.onErrorContainer }}>{error}</Text>
            </Snackbar>
        </Surface>
    );
}

const styles = StyleSheet.create({
    form: {
        flex: 1,
        padding: 24,
        gap: 16,
    },
    readOnlyGroup: {
        gap: 16,
        marginBottom: 8,
    },
    field: {
        gap: 2,
    },
    input: {
        backgroundColor: "transparent",
    },
    button: {
        marginTop: 8,
        borderRadius: 8,
    },
});
