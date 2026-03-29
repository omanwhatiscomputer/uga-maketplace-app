import { ThemedText } from "@/components/themed-text";
import { globalStyles } from "@/constants/global-styles";
import { TextVariants } from "@/constants/typography";
import { useAppContext } from "@/context/app-context";
import { useRouter } from "expo-router";
import { Button, Surface } from "react-native-paper";

export default function HomeScreen() {
    const { user, setUser } = useAppContext();
    const router = useRouter();

    const signOut = () => {
        setUser(null);
        router.replace("/(auth)/landing");
    };

    return (
        <Surface
            style={[globalStyles.container, { flexDirection: "column" }]}
            elevation={0}
        >
            <ThemedText variant={TextVariants.subtitle_md}>
                Welcome, {user?.fullName}
            </ThemedText>
            <ThemedText variant={TextVariants.label_sm}>
                {user?.email}
            </ThemedText>
            <Button mode="outlined" onPress={signOut} icon="logout">
                Sign Out
            </Button>
        </Surface>
    );
}
