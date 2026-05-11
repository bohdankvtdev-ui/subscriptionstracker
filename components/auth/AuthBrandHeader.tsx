import { Text, View } from "react-native";
import { branding } from "@/constants/branding";

type AuthBrandHeaderProps = {
  title: string;
  subtitle: string;
};

export function AuthBrandHeader({ title, subtitle }: AuthBrandHeaderProps) {
  return (
    <View className="auth-brand-block">
      <View className="auth-logo-wrap">
        <View className="auth-logo-mark">
          <Text className="auth-logo-mark-text">{branding.markLetter}</Text>
        </View>
        <View>
          <Text className="auth-wordmark">{branding.appName}</Text>
          <Text className="auth-wordmark-sub">{branding.tagline}</Text>
        </View>
      </View>
      <Text className="auth-title">{title}</Text>
      <Text className="auth-subtitle">{subtitle}</Text>
    </View>
  );
}
