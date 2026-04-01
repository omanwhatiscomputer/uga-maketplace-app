import {
    GoogleSignin,
    isSuccessResponse,
    statusCodes,
} from "@react-native-google-signin/google-signin";
import { useEffect } from "react";

const WEB_CLIENT_ID =
    "249897655210-6242ghh083u25loq9lgdc625g7ovucre.apps.googleusercontent.com";
const IOS_CLIENT_ID =
    "249897655210-sag9kcv24299mjrj73e3ok70omr72u5n.apps.googleusercontent.com";

export type GoogleProfile = {
    idToken: string;
    firstName: string;
    lastName: string;
    email: string;
};

export function useGoogleAuth() {
    useEffect(() => {
        GoogleSignin.configure({
            webClientId: WEB_CLIENT_ID,
            iosClientId: IOS_CLIENT_ID,
            scopes: ["email", "profile"],
        });
    }, []);

    const signIn = async (): Promise<GoogleProfile> => {
        await GoogleSignin.hasPlayServices();
        const response = await GoogleSignin.signIn();
        if (!isSuccessResponse(response)) {
            throw new Error("Sign in was cancelled");
        }
        const { idToken, user } = response.data;
        if (!idToken) {
            throw new Error("No ID token received");
        }
        return {
            idToken,
            firstName: user.givenName ?? "",
            lastName: user.familyName ?? "",
            email: user.email,
        };
    };

    const signOut = async (): Promise<void> => {
        await GoogleSignin.signOut();
    };

    return { signIn, signOut };
}

export { statusCodes };
