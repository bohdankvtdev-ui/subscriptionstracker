import { View, Text, TouchableOpacity } from "react-native";
import React from "react";

export default function ListHeading({ title }: { title: string }) {
  return (
    <View className="list-head">
      <Text className="list-title">{title}</Text>
      <TouchableOpacity className="list-action">
        <Text className="list-action-text">View All</Text>
      </TouchableOpacity>
    </View>
  );
}
