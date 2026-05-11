import "@/global.css";
import { FloatingTabBar } from "@/components/FloatingTabBar";
import { FullScreenLoader } from "@/components/ui/FullScreenLoader";
import {
  SubscriptionsProvider,
  useSubscriptionsCtx,
} from "@/state/SubscriptionsContext";
import { useAuth } from "@clerk/expo";
import { Redirect, Tabs } from "expo-router";
import { tabs } from "@/config/tabs";
import { colors } from "@/constants/theme";

const TabLayout = () => {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <FullScreenLoader />;
  }

  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <SubscriptionsProvider>
      <TabsShell />
    </SubscriptionsProvider>
  );
};

const TabsShell = () => {
  const { openCreate } = useSubscriptionsCtx();

  return (
    <Tabs
      tabBar={(props) => (
        <FloatingTabBar {...props} onPressCreate={openCreate} />
      )}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        sceneStyle: { backgroundColor: colors.background },
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 0,
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
          }}
        />
      ))}
    </Tabs>
  );
};

export default TabLayout;
