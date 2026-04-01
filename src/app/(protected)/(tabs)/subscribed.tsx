import { ThemedText } from "@/components/themed-text";
import { globalStyles } from "@/constants/global-styles";
import { TextVariants } from "@/constants/typography";
import { Surface } from "react-native-paper";

export default function SubscribedScreen() {
    return (
        <Surface
            style={[globalStyles.container, { flexDirection: "column" }]}
            elevation={0}
        >
            <ThemedText variant={TextVariants.heading_md}>
                This is the Subscribed screen
            </ThemedText>
        </Surface>
    );
}
