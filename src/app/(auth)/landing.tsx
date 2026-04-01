import { setAuthToken } from "@/api/client";
import { signInWithGoogle, verifyGoogleSignUp } from "@/api/endpoints/auth";
import { ThemedText } from "@/components/themed-text";
import { globalStyles } from "@/constants/global-styles";
import { TextVariants } from "@/constants/typography";
import { useAppContext } from "@/context/app-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { statusCodes, useGoogleAuth } from "@/hooks/use-google-auth";
import { saveAuthData } from "@/utils/auth-storage";
import { setPendingIdToken } from "@/utils/temp-auth-store";
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
    const { signIn, signOut } = useGoogleAuth();
    const { colors } = useAppTheme();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isUGAEmail = (email: string) => email.endsWith("@uga.edu");

    const signInPressed = async () => {
        setLoading(true);
        setError(null);
        try {
            const profile = await signIn();

            if (!isUGAEmail(profile.email)) {
                await signOut();
                setError("Access restricted to UGA email addresses (@uga.edu).");
                return;
            }

            try {
                const user = await signInWithGoogle(profile.idToken);
                setAuthToken(user.token);
                await saveAuthData(user.token, user.id);
                setUser(user);
                router.replace("/(protected)/(tabs)");
            } catch (apiErr: any) {
                // 404 = no account yet → auto-redirect to sign-up
                if (apiErr?.response?.status === 404) {
                    setPendingIdToken(profile.idToken);
                    router.push({
                        pathname: "/(auth)/sign-up",
                        params: {
                            firstName: profile.firstName,
                            lastName: profile.lastName,
                            email: profile.email,
                        },
                    });
                } else {
                    throw apiErr;
                }
            }
        } catch (err: any) {
            if (err?.code === statusCodes.SIGN_IN_CANCELLED) {
                // user cancelled, do nothing
            } else {
                setError(
                    err instanceof Error ? err.message : "Authentication failed",
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const signUpPressed = async () => {
        setLoading(true);
        setError(null);
        try {
            const profile = await signIn();

            if (!isUGAEmail(profile.email)) {
                await signOut();
                setError("Access restricted to UGA email addresses (@uga.edu).");
                return;
            }

            try {
                await verifyGoogleSignUp(profile.idToken);
                // 200 = account doesn't exist yet, proceed to sign-up form
                setPendingIdToken(profile.idToken);
                router.push({
                    pathname: "/(auth)/sign-up",
                    params: {
                        firstName: profile.firstName,
                        lastName: profile.lastName,
                        email: profile.email,
                    },
                });
            } catch (apiErr: any) {
                // 409 = account already exists → auto sign-in
                if (apiErr?.response?.status === 409) {
                    const user = await signInWithGoogle(profile.idToken);
                    setAuthToken(user.token);
                    await saveAuthData(user.token, user.id);
                    setUser(user);
                    router.replace("/(protected)/(tabs)");
                } else {
                    throw apiErr;
                }
            }
        } catch (err: any) {
            if (err?.code === statusCodes.SIGN_IN_CANCELLED) {
                // user cancelled, do nothing
            } else {
                setError(
                    err instanceof Error ? err.message : "Authentication failed",
                );
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
