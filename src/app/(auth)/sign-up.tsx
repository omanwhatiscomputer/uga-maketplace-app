import { TextInputField } from "@/components/text-input-field";
import { ThemedText } from "@/components/themed-text";
import { globalStyles } from "@/constants/global-styles";
import { TextVariants } from "@/constants/typography";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Button, Surface } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignUpScreen() {
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
                <ThemedText variant={TextVariants.subtitle_md}>
                    Welcome to Sign up Page!
                </ThemedText>
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
