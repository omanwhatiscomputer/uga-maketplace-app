import { useAppTheme } from "@/hooks/use-app-theme";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Platform,
    StyleSheet,
    View,
} from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import MapView, {
    Marker,
    PROVIDER_GOOGLE,
    type Region,
} from "react-native-maps";
import {
    Button,
    IconButton,
    Surface,
    Text,
    TouchableRipple,
} from "react-native-paper";

const MODAL_HEIGHT = Dimensions.get("window").height * 0.88;

const DEFAULT_REGION: Region = {
    latitude: 33.948,
    longitude: -83.3774,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
};

const MAPS_API_KEY =
    Platform.OS === "ios"
        ? process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS!
        : process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID!;

const PLACES_API_KEY = process.env.EXPO_PUBLIC_PLACES_API_KEY!;

type LatLng = { latitude: number; longitude: number };

type MeetupLocationModalProps = {
    visible: boolean;
    initialLocation?: LatLng | null;
    onClose: () => void;
    onConfirm: (location: LatLng) => void;
};

export function MeetupLocationModal({
    visible,
    initialLocation,
    onClose,
    onConfirm,
}: MeetupLocationModalProps) {
    const { colors } = useAppTheme();
    const mapRef = useRef<MapView>(null);
    const translateY = useRef(new Animated.Value(MODAL_HEIGHT)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const [marker, setMarker] = useState<LatLng | null>(null);

    useEffect(() => {
        if (visible) {
            setMarker(initialLocation ?? null);
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(backdropOpacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: MODAL_HEIGHT,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(backdropOpacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleConfirm = () => {
        if (!marker) return;
        onConfirm(marker);
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            <Animated.View
                pointerEvents={visible ? "auto" : "none"}
                style={[
                    StyleSheet.absoluteFill,
                    {
                        backgroundColor: "rgba(0,0,0,0.5)",
                        opacity: backdropOpacity,
                    },
                ]}
            >
                <TouchableRipple
                    style={StyleSheet.absoluteFill}
                    onPress={onClose}
                    borderless
                >
                    <Surface style={StyleSheet.absoluteFill} elevation={0} />
                </TouchableRipple>
            </Animated.View>

            {/* Modal panel */}
            <Animated.View
                pointerEvents={visible ? "auto" : "none"}
                style={[
                    styles.panel,
                    { transform: [{ translateY }] },
                ]}
            >
                <Surface style={styles.surface} elevation={4}>
                    {/* Header */}
                    <Surface elevation={0} style={styles.header}>
                        <Text
                            variant="titleMedium"
                            style={{ flex: 1, color: colors.onSurface }}
                        >
                            Set Meetup Location
                        </Text>
                        <IconButton icon="close" onPress={onClose} />
                    </Surface>

                    {/* Map with floating search bar */}
                    <View style={styles.mapContainer}>
                        <MapView
                            ref={mapRef}
                            provider={PROVIDER_GOOGLE}
                            style={StyleSheet.absoluteFill}
                            initialRegion={
                                initialLocation
                                    ? {
                                          ...initialLocation,
                                          latitudeDelta: 0.01,
                                          longitudeDelta: 0.01,
                                      }
                                    : DEFAULT_REGION
                            }
                            onPress={(e) =>
                                setMarker(e.nativeEvent.coordinate)
                            }
                        >
                            {marker && (
                                <Marker
                                    coordinate={marker}
                                    draggable
                                    onDragEnd={(e) =>
                                        setMarker(e.nativeEvent.coordinate)
                                    }
                                />
                            )}
                        </MapView>

                        {/* Search bar floats above map */}
                        <View style={styles.searchContainer}>
                            <GooglePlacesAutocomplete
                                placeholder="Search for a place..."
                                fetchDetails
                                onPress={(_, details) => {
                                    if (!details) return;
                                    const { lat, lng } =
                                        details.geometry.location;
                                    const region: Region = {
                                        latitude: lat,
                                        longitude: lng,
                                        latitudeDelta: 0.01,
                                        longitudeDelta: 0.01,
                                    };
                                    mapRef.current?.animateToRegion(
                                        region,
                                        500,
                                    );
                                    setMarker({
                                        latitude: lat,
                                        longitude: lng,
                                    });
                                }}
                                query={{ key: PLACES_API_KEY, language: "en" }}
                                enablePoweredByContainer={false}
                                keyboardShouldPersistTaps="handled"
                                styles={{
                                    container: { flex: 0 },
                                    textInputContainer: {
                                        backgroundColor: colors.surface,
                                        borderRadius: 8,
                                    },
                                    textInput: {
                                        backgroundColor: colors.surface,
                                        color: colors.onSurface,
                                        height: 44,
                                        borderRadius: 8,
                                    },
                                    listView: {
                                        backgroundColor: colors.surface,
                                        borderRadius: 8,
                                        marginTop: 4,
                                    },
                                    row: {
                                        backgroundColor: colors.surface,
                                    },
                                    description: {
                                        color: colors.onSurface,
                                    },
                                }}
                            />
                        </View>
                    </View>

                    {/* Confirm button */}
                    <Surface elevation={0} style={styles.footer}>
                        <Button
                            mode="contained"
                            icon="map-marker-check"
                            onPress={handleConfirm}
                            disabled={!marker}
                            style={styles.confirmBtn}
                        >
                            Confirm Location
                        </Button>
                    </Surface>
                </Surface>
            </Animated.View>
        </>
    );
}

const styles = StyleSheet.create({
    panel: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: MODAL_HEIGHT,
    },
    surface: {
        flex: 1,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: "hidden",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    mapContainer: {
        flex: 1,
    },
    searchContainer: {
        position: "absolute",
        top: 12,
        left: 12,
        right: 12,
        zIndex: 5,
        elevation: 5,
    },
    footer: {
        padding: 16,
        paddingBottom: 24,
    },
    confirmBtn: {
        borderRadius: 0,
    },
});
