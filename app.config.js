import "dotenv/config";

export default {
    expo: {
        name: "uga-marketplace",
        slug: "uga-marketplace",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/images/icon.png",
        scheme: "uga-marketplace",
        userInterfaceStyle: "automatic",
        ios: {
            icon: "./assets/images/icon.png",
            bundleIdentifier: "com.uga-marketplace.app",
            config: {
                googleMapsApiKey:
                    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS,
            },
        },
        android: {
            package: "com.uga_marketplace.app",
            adaptiveIcon: {
                backgroundColor: "#E6F4FE",
                foregroundImage: "./assets/images/android-icon-foreground.png",
                backgroundImage: "./assets/images/android-icon-background.png",
                monochromeImage: "./assets/images/android-icon-monochrome.png",
            },
            predictiveBackGestureEnabled: false,
            config: {
                googleMaps: {
                    apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID,
                },
            },
        },
        web: {
            output: "static",
            favicon: "./assets/images/favicon.png",
        },
        plugins: [
            "expo-router",
            [
                "expo-splash-screen",
                {
                    backgroundColor: "#BA0C2F",
                    image: "./assets/images/splash-icon.png",
                    imageWidth: 160,
                    android: {
                        image: "./assets/images/splash-icon.png",
                        imageWidth: 160,
                    },
                    ios: {
                        image: "./assets/images/splash-icon.png",
                        imageWidth: 160,
                    },
                },
            ],
            [
                "@react-native-google-signin/google-signin",
                {
                    iosUrlScheme:
                        "com.googleusercontent.apps.249897655210-sag9kcv24299mjrj73e3ok70omr72u5n",
                },
            ],
            "expo-secure-store",
            [
                "react-native-maps",
                {
                    googleMapsApiKey:
                        process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS,
                    androidGoogleMapsApiKey:
                        process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID,
                },
            ],
        ],
        experiments: {
            typedRoutes: true,
            reactCompiler: true,
        },
    },
};
