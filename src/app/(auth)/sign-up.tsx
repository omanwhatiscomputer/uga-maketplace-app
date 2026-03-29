import { ThemedText } from "@/components/themed-text";
import { globalStyles } from "@/constants/global-styles";
import { TextVariants } from "@/constants/typography";
import { Surface } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";




export default function SignUpScreen() {
  return (
    <Surface style={[globalStyles.container,]} elevation={0}>
      <SafeAreaView style={globalStyles.safeAreaExtra}>
        <ThemedText variant={TextVariants.heading_lg}>
          Welcome to Sign up Page!
        </ThemedText>
      </SafeAreaView>
    </Surface>
  );
}