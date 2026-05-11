import "react-native-url-polyfill/auto";
import { SplashScreen, Stack } from "expo-router";
import "@/global.css";
import {
    Montserrat_300Light,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
    useFonts as useMontserratFonts,
} from "@expo-google-fonts/montserrat";
import { useEffect } from "react";
import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import * as NavigationBar from "expo-navigation-bar";
import * as SystemUI from "expo-system-ui";
import { FullScreenLoader } from "@/components/ui/FullScreenLoader";
import { colors } from "@/constants/theme";
import { Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error(
    "Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Add it to your .env file.",
  );
}

const clerkPublishableKey = publishableKey;

export default function RootLayout() {
  const [fontsLoaded, fontError] = useMontserratFonts({
    Montserrat_300Light,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
  });

  const fontsReady = fontsLoaded || fontError != null;

  useEffect(() => {
    if (fontsReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsReady]);

  useEffect(() => {
    if (fontError) {
      console.warn("[fonts] Custom fonts failed to load; using system fallbacks.", fontError);
    }
  }, [fontError]);

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(colors.background);
    if (Platform.OS === "android") {
      NavigationBar.setStyle("light");
    }
  }, []);

  const shellStyle = {
    flex: 1,
    width: "100%" as const,
    backgroundColor: colors.background,
    ...(Platform.OS === "web"
      ? { minHeight: "100vh" as unknown as number }
      : {}),
  };

  if (!fontsReady) {
    return (
      <GestureHandlerRootView style={shellStyle}>
        <View style={shellStyle}>
          <FullScreenLoader />
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={shellStyle}>
      <View style={shellStyle}>
        <ClerkProvider
          publishableKey={clerkPublishableKey}
          tokenCache={tokenCache}
          telemetry={false}
        >
          <View
            style={{ flex: 1, width: "100%", backgroundColor: colors.background }}
          >
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
              }}
            />
          </View>
        </ClerkProvider>
      </View>
    </GestureHandlerRootView>
  );
}
