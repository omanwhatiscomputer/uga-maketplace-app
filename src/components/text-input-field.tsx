import { TextInput, TextInputProps } from "react-native-paper";

export type InputFieldProps = TextInputProps & {text:string; setText: (text: string) => void; isPassword?: boolean; showPassword?: boolean; setShowPassword?: (show: boolean) => void; showEyeIcon?: boolean};


export function TextInputField({
    label,
    style,
    text,
    setText,
    isPassword,
    showPassword,
    setShowPassword,
    showEyeIcon,
    autoCapitalize,
}: InputFieldProps) {
    let additionalProps = {};
    if (isPassword) {
        if (showEyeIcon) {
            additionalProps = {
                secureTextEntry: !showPassword,
                right: (
                    <TextInput.Icon
                        icon={!showPassword ? "eye-off" : "eye"}
                        onPress={() => renderHidePass()}
                    />
                ),
            };
        } else {
            additionalProps = {
                secureTextEntry: !showPassword,
            };
        }

        const renderHidePass = () => {
            setShowPassword && setShowPassword(!showPassword);
        };
    }

    return (
        <TextInput
            autoCapitalize={autoCapitalize ? autoCapitalize : "none"}
            mode="flat"
            label={label}
            value={text}
            onChangeText={(text) => setText(text)}
            style={[
                {
                    marginHorizontal: 5,
                    marginVertical: 5,
                    width: "100%",
                },
                style,
            ]}
            contentStyle={{
                paddingLeft: 15,
            }}
            {...additionalProps}
        />
    );
};
