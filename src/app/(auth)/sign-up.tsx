import { setAuthToken } from "@/api/client";
import { createAccount, signInWithGoogle } from "@/api/endpoints/auth";
import { TextInputField } from "@/components/text-input-field";
import { ThemedText } from "@/components/themed-text";
import { globalStyles } from "@/constants/global-styles";
import { TextVariants } from "@/constants/typography";
import { useAppContext } from "@/context/app-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useGoogleAuth } from "@/hooks/use-google-auth";
import { saveAuthData } from "@/utils/auth-storage";
import {
    clearPendingIdToken,
    getPendingIdToken,
} from "@/utils/temp-auth-store";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Button,
    IconButton,
    Snackbar,
    Surface,
    Text,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignUpScreen() {
    const {
        colors: { primary, errorContainer, onErrorContainer },
    } = useAppTheme();
    const { signOut } = useGoogleAuth();
    const { setUser } = useAppContext();

    const {
        firstName,
        lastName,
        email: emailParam,
    } = useLocalSearchParams<{
        firstName: string;
        lastName: string;
        email: string;
    }>();

    const [fName, setFName] = useState(firstName ?? "");
    const [lName, setLName] = useState(lastName ?? "");
    const [email, setEmail] = useState(emailParam ?? "");

    useEffect(() => {
        if (firstName) setFName(firstName);
        if (lastName) setLName(lastName);
        if (emailParam) setEmail(emailParam);
    }, [firstName, lastName, emailParam]);

    const [phone, setPhone] = useState("");
    const [rawPhone, setRawPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const formatPhone = (text: string) => {
        const digits = text.replace(/\D/g, "").slice(0, 10);
        let formatted = "";
        if (digits.length > 6) {
            formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
        } else if (digits.length > 3) {
            formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
        } else if (digits.length > 0) {
            formatted = `(${digits}`;
        }
        setPhone(formatted);
        setRawPhone(digits);
    };

    const handleCreateAccount = async () => {
        setLoading(true);
        setError(null);
        try {
            const user = await createAccount({
                email,
                firstName: fName,
                lastName: lName,
                mobileNumber: rawPhone,
            });
            setAuthToken(user.token);
            await saveAuthData(user.token, user.id);
            clearPendingIdToken();
            setUser(user);
            router.replace("/(protected)/(tabs)");
        } catch (err: any) {
            // 409 = account already exists → auto sign-in with stored idToken
            if (err?.response?.status === 409) {
                const idToken = getPendingIdToken();
                if (idToken) {
                    try {
                        const user = await signInWithGoogle(idToken);
                        setAuthToken(user.token);
                        await saveAuthData(user.token, user.id);
                        clearPendingIdToken();
                        setUser(user);
                        router.replace("/(protected)/(tabs)");
                    } catch {
                        setError("Sign-in failed. Please try again.");
                    }
                } else {
                    setError("Account already exists. Please sign in.");
                }
            } else {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Account creation failed.",
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Surface style={[globalStyles.container]} elevation={0}>
            <SafeAreaView style={globalStyles.safeAreaExtra}>
                <Surface
                    style={{
                        width: "100%",
                        flexDirection: "row",
                        alignItems: "center",
                    }}
                    elevation={0}
                >
                    <IconButton
                        icon="chevron-left"
                        iconColor={primary}
                        size={50}
                        onPress={async () => {
                            clearPendingIdToken();
                            await signOut();
                            router.back();
                        }}
                    />
                    <ThemedText variant={TextVariants.subtitle_lg}>
                        Join the community!
                    </ThemedText>
                </Surface>
                <TextInputField
                    label="Email"
                    placeholder="Enter your email"
                    text={email}
                    setText={setEmail}
                    disabled={true}
                />
                <TextInputField
                    label="First Name"
                    placeholder="Enter your first name"
                    text={fName}
                    setText={setFName}
                    disabled={true}
                />
                <TextInputField
                    label="Last Name"
                    placeholder="Enter your last name"
                    text={lName}
                    setText={setLName}
                    disabled={true}
                />
                <TextInputField
                    label="Phone"
                    placeholder="(XXX) XXX-XXXX"
                    text={phone}
                    setText={setPhone}
                    onChangeText={formatPhone}
                    keyboardType="phone-pad"
                    maxLength={14}
                />
                {loading ? (
                    <ActivityIndicator animating size="large" />
                ) : (
                    <Button
                        style={globalStyles.landingPageButtons}
                        mode="contained"
                        onPress={handleCreateAccount}
                        disabled={
                            !(email && fName && lName && rawPhone.length === 10)
                        }
                    >
                        Create Account
                    </Button>
                )}
            </SafeAreaView>

            <Snackbar
                visible={!!error}
                onDismiss={() => setError(null)}
                style={{
                    borderRadius: 36,
                    backgroundColor: errorContainer,
                    width: "90%",
                    alignSelf: "center",
                }}
                theme={{ colors: { inverseSurface: onErrorContainer } }}
                action={{
                    label: "✕",
                    onPress: () => setError(null),
                    textColor: onErrorContainer,
                }}
            >
                <Text style={{ color: onErrorContainer }}>{error}</Text>
            </Snackbar>
        </Surface>
    );
}
