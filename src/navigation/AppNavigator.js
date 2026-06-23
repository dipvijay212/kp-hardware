import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import FirebaseTestScreen from '../screens/FirebaseTestScreen';
import { CartScreen } from '../screens/CartScreen';
import BuyerInformationScreen from '../screens/BuyerInformationScreen';
import OrderRequestScreen from '../screens/OrderRequestScreen';
import OrderSuccessScreen from '../screens/OrderSuccessScreen';
import OrderHistoryScreen from '../screens/OrderHistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
        <Stack.Screen name="FirebaseTest" component={FirebaseTestScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="BuyerInformation" component={BuyerInformationScreen} />
        <Stack.Screen name="OrderRequest" component={OrderRequestScreen} />
        <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
        <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
