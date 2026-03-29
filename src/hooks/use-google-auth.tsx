import {
    GoogleSignin,
    statusCodes,
} from "@react-native-google-signin/google-signin";
import { useEffect } from "react";

const WEB_CLIENT_ID =
    "249897655210-6242ghh083u25loq9lgdc625g7ovucre.apps.googleusercontent.com";
const IOS_CLIENT_ID =
    "249897655210-sag9kcv24299mjrj73e3ok70omr72u5n.apps.googleusercontent.com";

export function useGoogleAuth() {
    useEffect(() => {
        GoogleSignin.configure({
            webClientId: WEB_CLIENT_ID,
            iosClientId: IOS_CLIENT_ID,
            scopes: ["email", "profile"],
        });
    }, []);

    const signIn = async (): Promise<string> => {
        await GoogleSignin.hasPlayServices();
        await GoogleSignin.signIn();
        const tokens = await GoogleSignin.getTokens();
        if (!tokens.idToken) {
            throw new Error("No ID token received");
        }
        return tokens.idToken;
    };

    const signOut = async (): Promise<void> => {
        await GoogleSignin.signOut();
    };

    return { signIn, signOut };
}

export { statusCodes };
