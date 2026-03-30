import { TextInputField } from "@/components/text-input-field";
import { ThemedText } from "@/components/themed-text";
import { globalStyles } from "@/constants/global-styles";
import { TextVariants } from "@/constants/typography";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useGoogleAuth } from "@/hooks/use-google-auth";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Button, IconButton, Surface } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignUpScreen() {
    const {
        colors: { primary },
    } = useAppTheme();
    const { signOut } = useGoogleAuth();

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

    const formatPhone = (text: string) => {
        // Strip everything except digits
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
                <Button
                    style={globalStyles.landingPageButtons}
                    mode="contained"
                    onPress={() => console.log("Create Account Pressed")}
                    disabled={
                        email && fName && lName && rawPhone.length === 10
                            ? false
                            : true
                    }
                >
                    Create Account
                </Button>
            </SafeAreaView>
        </Surface>
    );
}
