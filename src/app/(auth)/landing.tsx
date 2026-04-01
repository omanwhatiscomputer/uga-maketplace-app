import { googleSignIn } from "@/api/endpoints/auth";
import { ThemedText } from "@/components/themed-text";
import { globalStyles } from "@/constants/global-styles";
import { TextVariants } from "@/constants/typography";
import { useAppContext } from "@/context/app-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { statusCodes, useGoogleAuth } from "@/hooks/use-google-auth";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Button,
    Icon,
    Snackbar,
    Surface,
    Text,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LandingScreen() {
    const router = useRouter();
    const { setUser } = useAppContext();
    const { signIn, signInForSignUp, signOut } = useGoogleAuth();
    const { colors } = useAppTheme();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isUGAEmail = (email: string) => email.endsWith("@uga.edu");

    const signInPressed = async () => {
        setLoading(true);
        setError(null);
        try {
            const { idToken, email } = await signIn();
            if (!isUGAEmail(email)) {
                await signOut();
                setError(
                    "Access restricted to UGA email addresses (@uga.edu).",
                );
                return;
            }
            const user = await googleSignIn(idToken);
            setUser(user);
            router.replace("/(protected)/(tabs)");
        } catch (err: any) {
            if (err?.code === statusCodes.SIGN_IN_CANCELLED) {
                // user cancelled, do nothing
            } else {
                const message =
                    err instanceof Error
                        ? err.message
                        : "Authentication failed";
                setError(message);
            }
        } finally {
            setLoading(false);
        }
    };

    const signUpPressed = async () => {
        setLoading(true);
        setError(null);
        try {
            const { firstName, lastName, email } = await signInForSignUp();
            if (!isUGAEmail(email)) {
                await signOut();
                setError(
                    "Access restricted to UGA email addresses (@uga.edu).",
                );
                return;
            }
            router.push({
                pathname: "/(auth)/sign-up",
                params: { firstName, lastName, email },
            });
        } catch (err: any) {
            if (err?.code !== statusCodes.SIGN_IN_CANCELLED) {
                const message =
                    err instanceof Error
                        ? err.message
                        : "Authentication failed";
                setError(message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Surface
            style={[
                globalStyles.container,
                { justifyContent: "space-between" },
            ]}
            elevation={0}
        >
            <SafeAreaView style={globalStyles.safeAreaExtra}>
                <Icon source="storefront" size={128} />
                <ThemedText
                    variant={TextVariants.heading_md}
                    style={{ paddingBottom: 32 }}
                >
                    Marketplace
                </ThemedText>

                {loading ? (
                    <ActivityIndicator animating size="large" />
                ) : (
                    <>
                        <Button
                            style={globalStyles.landingPageButtons}
                            icon="login"
                            mode="contained"
                            onPress={signInPressed}
                        >
                            Sign In
                        </Button>
                        <Button
                            style={globalStyles.landingPageButtons}
                            icon="coffee"
                            mode="contained"
                            onPress={signUpPressed}
                        >
                            Sign Up
                        </Button>
                    </>
                )}

                <ThemedText variant={TextVariants.label_sm}>
                    Using UGA email of course...
                </ThemedText>
            </SafeAreaView>

            <Snackbar
                visible={!!error}
                onDismiss={() => setError(null)}
                style={{
                    // position: "absolute",
                    // bottom: 0,
                    // left: 0,
                    // right: 0,
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
