import { Text, TextInput, View, type TextInputProps } from "react-native";
import { colors, neo } from "@/constants/theme";

type InputProps = TextInputProps & {
  label?: string;
  error?: string | null;
};

export function Input({ label, error, style, ...props }: InputProps) {
  return (
    <View style={{ gap: 8 }}>
      {label ? (
        <Text
          style={{
            color: colors.foreground,
            fontFamily: "Montserrat_700Bold",
            fontSize: 13,
            letterSpacing: 0.4,
            textTransform: "uppercase",
          }}
        >
          {label}
        </Text>
      ) : null}
      <TextInput
        placeholderTextColor="#9b9690"
        style={[
          {
            borderWidth: neo.border,
            borderColor: error ? colors.destructive : colors.border,
            borderRadius: neo.radius,
            backgroundColor: colors.card,
            color: colors.foreground,
            fontFamily: "Montserrat_600SemiBold",
            fontSize: 16,
            paddingHorizontal: 14,
            paddingVertical: 12,
          },
          style,
        ]}
        {...props}
      />
      {error ? (
        <Text
          style={{
            color: colors.destructive,
            fontFamily: "Montserrat_600SemiBold",
            fontSize: 12,
          }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export default Input;
