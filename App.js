import React from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PhoneInputScreen from "./src/screens/LoginScreen.js";
import OtpVerificationScreen from "./src/screens/OtpVerificationScreen.js"; 
import HomeScreen from "./src/screens/Home.js";
import ImageUploadCard from "./src/screens/uploadProductList.js";
import CategoriesScreen from "./src/screens/CategoriesScreen.js";
import BagScreen from "./src/screens/bag.js";
import AddressScreen from "./src/screens/AddressScreen.js";
import ProfileScreen from "./src/screens/ProfileScreen.js";
import OrdersScreen from "./src/screens/OrderScreen.js";
import AllProductsScreen from "./src/screens/AllProducts.js";
import SearchScreen from "./src/screens/SearchScreen.js";
import OfferItemsScreen from "./src/screens/BannerOfferItemsScreen.js";
import ProductDescription from "./src/screens/ProductDescription.js";
import LandingScreen from "./src/landing/LandingScreen.js";
import CategoryProductsScreen from "./src/screens/CategoryProduct.js";
import OrderSuccessful from "./src/screens/OrderSuccessfullScreen.js";
import LocationScreen from "./src/screens/Location.js";
import OrderDetailsScreen from "./src/screens/orderDetailsView.js";
import './src/screens/i18n.js';
import { enableScreens } from 'react-native-screens';


const Stack = createNativeStackNavigator();

const App = () => {
  enableScreens();
  return (
  
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LandingScreen" screenOptions={{ headerShown: false }}>
       <Stack.Screen name="LandingScreen" component={LandingScreen} />
        <Stack.Screen name="PhoneInput" component={PhoneInputScreen} />
        <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Upload" component={ImageUploadCard} /> 
        <Stack.Screen name="Category" component={CategoriesScreen} /> 
        <Stack.Screen name="Bag" component={BagScreen} />
        <Stack.Screen name="Address" component={AddressScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="MyOrders" component={OrdersScreen} />
        <Stack.Screen name="AllProducts" component={AllProductsScreen} />
        <Stack.Screen name="SearchScreen" component={SearchScreen} />
        <Stack.Screen name="OfferItems" component={OfferItemsScreen} />
        <Stack.Screen name="ProductDescription" component={ProductDescription} />
        <Stack.Screen name="CategoryDetails" component={CategoryProductsScreen} />    
        <Stack.Screen name="OrderSuccessful" component={OrderSuccessful} />  
        <Stack.Screen name="Location" component={LocationScreen} />  
        <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />  
      </Stack.Navigator>
    </NavigationContainer>
   
  );
};

export default App;



