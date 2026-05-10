import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView as RNSafeAreaView} from "react-native-safe-area-context";
import { styled } from "nativewind";
const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  return (
    <SafeAreaView className="flex-1 p-5 bg-background">
      <Text>settings</Text>
    </SafeAreaView>
  )
}

export default Settings