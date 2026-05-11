import "@/global.css";
import { FullScreenLoader } from "@/components/ui/FullScreenLoader";
import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

const AUTH_SLOW_MS = 12_000;

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();
  const [showSlowHint, setShowSlowHint] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowSlowHint(true), AUTH_SLOW_MS);
    return () => clearTimeout(t);
  }, []);

  if (!isLoaded) {
    const slowHint =
      showSlowHint
        ? Platform.OS === "web"
          ? "Still connecting. Check your network, disable extensions that block requests to Clerk, then reload the page."
          : "Still connecting. Check your network and try again. If this persists, fully quit and reopen the app."
        : undefined;
    return <FullScreenLoader slowHint={slowHint} />;
  }

  return <Redirect href={isSignedIn ? "/(tabs)" : "/sign-in"} />;
}
