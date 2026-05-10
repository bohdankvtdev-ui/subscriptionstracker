import "@/global.css"
import { Link } from "expo-router";
import { FlatList, Image, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView} from "react-native-safe-area-context";
import { styled } from "nativewind";
import images from "@/constants/images";
import { HOME_BALANCE, HOME_SUBSCRIPTIONS, HOME_USER, UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import { formatCurrency } from "@/lib/utils";
import dayjs from "dayjs";
import ListHeading from "@/components/ListHeading";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import SubscriptionCard from "@/components/SubscriptionCard";
import { useState } from "react";
const SafeAreaView = styled(RNSafeAreaView);


export default function App() {

const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);
  
  return (
    <SafeAreaView className="flex-1 p-5 bg-background">
       <View className="home-header">
          <View className="home-user">
            <Image source={images.avatar} className="home-avatar"/> 
            <Text className="home-user-name">
              {HOME_USER.name}
            </Text>
          </View>

          <Image source={icons.add} className="home-add-icon"></Image>
        </View>

      
        <View className="home-balance-card">
          <Text className="home-balance-label">
            Balance
          </Text>
          <View className="home-balance-row">
            <Text className="home-balance-amount">
              {formatCurrency(HOME_BALANCE.amount)}
            </Text>
            <Text className="home-balance-date">
              {dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD")}
            </Text>
          </View>
        </View>
       
        <View>
          <ListHeading title="Upcoming" />

            <FlatList data={UPCOMING_SUBSCRIPTIONS} 
            renderItem={({item}) => (<UpcomingSubscriptionCard {...item} />)} 
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            ListEmptyComponent={<Text className="home-empty-state">No upcoming renewals yet</Text>}
            />
        </View>
        <View>
          <ListHeading title="All Subscriptions" />
           <SubscriptionCard 
           {...HOME_SUBSCRIPTIONS[0]} 
           expanded={expandedSubscriptionId === HOME_SUBSCRIPTIONS[0].id}
           onPress={() => setExpandedSubscriptionId((currentId) => 
            (currentId === HOME_SUBSCRIPTIONS[0].id ? null : HOME_SUBSCRIPTIONS[0].id))}
           />
        </View>
    </SafeAreaView>
  );
}