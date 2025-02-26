import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import tw from 'twrnc'; 
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { BottomNavigation } from './Header.js';
import { useTranslation } from 'react-i18next';
import languageEvent from './LanguageEvents.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OrderDetailsScreen = ({ route, navigation }) => {
   const [language,setLanguage]=useState('');

   const {t} = useTranslation();

   useEffect(() => {
    const fetchLanguage = async () => {
      try {
        const storedLanguage = await AsyncStorage.getItem('language');
        if (storedLanguage) {
          setLanguage(storedLanguage);
        }
      } catch (error) {
        console.error("Error fetching language preference:", error);
      }
    };

    fetchLanguage(); // ✅ Initial fetch

    // ✅ Listen for event when language changes
    languageEvent.on('languageChanged', fetchLanguage);

    return () => {
      languageEvent.off('languageChanged', fetchLanguage); // ✅ Cleanup listener
    };
  }, []);
  // Safely access route params with default empty array
  const { orderItems = [] } = route?.params || {};
 
  // Calculate totals
  const totalItems = orderItems.length;
  const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const mrp = totalAmount + 50; // Adding the discount back to get MRP

  // Handle back navigation
  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={tw`flex-1 bg-white`}>
      <ScrollView>
        {/* Header */}
        <View style={tw`flex-row items-center p-4 border-b border-gray-200`}>
          <TouchableOpacity style={tw`mr-4`} onPress={handleBack}>
            <MaterialIcons name="west" size={24}/>
          </TouchableOpacity>
          <Text style={tw`text-lg font-bold`}>{t('myOrders')}</Text>
        </View>

        {/* Cart Info */}
        <View style={tw`flex-row justify-between p-4 border-b border-gray-200`}>
          <Text style={tw`text-base`}>{t('itemsInThisCart')} ({totalItems})</Text>
          <View style={tw`flex-row`}>
            <Text style={tw`text-base`}>{t('total')}</Text>
            <Text style={tw`text-base text-[#52A924]`}> ₹ {totalAmount}</Text>
          </View>
        </View>

        {/* Order Items */}
        {orderItems.length > 0 ? (
          orderItems.map(item => (
            <View key={item.id || Math.random()} style={tw`flex-row p-4 border-b border-gray-200`}>
              <Image 
                source={{uri:item.image_url}} 
                style={tw`w-15 h-15 rounded-lg`}
              />
              <View style={tw`flex-1 ml-3`}>
                <Text style={tw`text-base mb-2`}>{(language==='en'? item.name_en : item.name_hi )|| 'Untitled Item'}</Text>
                <View style={tw`flex-row gap-x-3 items-center`}>
                  <View style={tw`w-6 h-6 rounded-full bg-[#52A924] items-center justify-center`}>
                    <Text style={tw`text-white text-sm`}>✓</Text>
                  </View>
                  <Text style={tw`text-green-600`}>{ (language==='en' ? item.status : item.status_hindi)|| 'Processing' }  </Text>
                </View>
              </View>
              <View style={tw`items-end`}>
                <Text style={tw`mb-1`}>{t('qty')} - {item.quantity || 1}</Text>
                <Text style={tw`font-bold text-[#52A924]`}>₹{item.price || 0}</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={tw`p-4 items-center justify-center`}>
            <Text style={tw`text-gray-500`}>{t("noItemsInCart")}</Text>
          </View>
        )}

        {/* Order Summary */}
        <View style={tw`p-4 bg-gray-50`}>
          <Text style={tw`text-lg text-[#52A924] font-bold mb-4`}>{t('orderSummary')}</Text>
          
          {/* MRP */}
          <View style={tw`flex-row justify-between mb-3`}>
            <Text style={tw`text-gray-600`}>{t('mrp')}</Text>
            <Text>₹{mrp}</Text>
          </View>
          
          {/* Product Discount */}
          <View style={tw`flex-row justify-between mb-3`}>
            <Text style={tw`text-gray-600`}>{t("productDiscount")}</Text>
            <Text style={tw`text-green-600`}>50</Text>
          </View>
          
          {/* Delivery Fee */}
          <View style={tw`flex-row justify-between mb-3`}>
            <Text style={tw`text-gray-600`}>{t('deliveryCharge')}</Text>
            <Text style={tw`text-green-600`}>{t('free')}</Text>
          </View>
          
          {/* Total Amount */}
          <View style={tw`flex-row justify-between pt-4 mt-4 border-t border-gray-200`}>
            <Text style={tw`text-base text-[#52A924] font-bold`}>{t("totalAmountToPay")}</Text>
            <Text style={tw`text-base text-[#52A924] font-bold`}>₹{totalAmount}</Text>
          </View>
        </View>

        {/* Order Details */}
        <Text style={tw`text-lg text-[#52A924] font-bold p-4`}>{t('orderDetails')}</Text>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation navigation={navigation}     
      />
    </View>
  );
};

export default OrderDetailsScreen;