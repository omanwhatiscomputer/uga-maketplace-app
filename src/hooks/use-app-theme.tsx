import { LightTheme } from "@/constants/theme";
import { useTheme } from "react-native-paper";

type AppTheme = typeof LightTheme;

export const useAppTheme = () => useTheme<AppTheme>();
