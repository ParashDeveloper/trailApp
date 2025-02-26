import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView , Image} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { MyOrderSvg } from '../svg/orderbag';
import languageEvent from './LanguageEvents';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

const OrderSuccessful = ({ navigation ,route}) => {
    console.log("data",route.params);
    const {cartItems}= route.params;
    const { t }= useTranslation();
    const [language,setLanguage]=useState();

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

    return (
        <SafeAreaView style={tw`flex-1 bg-white`}>
            {/* Upper Half for Image */}
            <View style={tw`h-1/1.99 justify-center items-center`}>
                <MyOrderSvg />
            </View>

            {/* Lower Half - Moved Slightly Up */}
            <View style={tw`h-[55%] bg-white rounded-t-3xl  -mt-18`}>
                <ScrollView
                    style={tw`flex-1`}
                    contentContainerStyle={tw`p-3`}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={tw`flex-row items-center bg-[#F5D9BD] p-2 bg-rounded-lg `}>
                        <MaterialIcons name="moving" size={40} color="black" />
                        <Text style={tw`text-lg font-bold text-gray-800 text-center ml-2`}>
                            Arriving Tomorrow
                        </Text>
                    </View>

                  
                   {cartItems?.map((item, index) => (
                        <View key={index} style={tw`flex-row px-4 py-2 border-b border-gray-100`}>
                            {/* Left Half: Product Image */}
                            <View style={tw`p-2 bg-white border border-gray-100 rounded-md shadow-sm`}>
                                <Image
                                    source={{ uri: item.image_url }}
                                    style={tw`w-16 h-16 rounded-md`}
                                    resizeMode="contain"
                                />
                            </View>

                            {/* Right Half: Product Info */}
                            <View style={tw`flex-1 ml-3`}>
                                {/* First Row: Name & Price */}
                                <View style={tw`flex-row justify-between items-center mb-2`}>
                                    <Text style={tw`text-base font-medium flex-1`} numberOfLines={1}>{ language==='en'? item.name_en : item.name_hi }</Text>
                                    <Text style={tw`text-[#52A924] text-base font-medium`}>₹{item.price}</Text>
                                </View>

                                {/* Second Row: Remove & Counter */}
                                <View style={tw`flex-row justify-end items-center mt-1`}>
                                   

                                    <View style={tw`flex-row items-center border border-gray-200 rounded-md py-1 px-1`}>
                                        <TouchableOpacity
                                            onPress={() => decreaseQuantity(item.sku)}
                                            style={tw`w-5.5 h-5.5 bg-[#52A924] rounded-md items-center justify-center border border-[#52A924]`}
                                        >
                                            <Text style={tw`text-white text-sm`}>-</Text>
                                        </TouchableOpacity>

                                        <Text style={tw`mx-3 text-base`}>{item.quantity}</Text>

                                        <TouchableOpacity
                                            onPress={() => increaseQuantity(item.sku)}
                                            style={tw`w-5.5 h-5.5 bg-[#52A924] rounded-md items-center justify-center border border-[#52A924]`}
                                        >
                                            <Text style={tw`text-white text-sm`}>+</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    ))}
                   
                </ScrollView>



            </View>
            <View style={tw`absolute bottom-2 left-2 right-2  `}>
                {/* Continue Shopping Button */}
                <TouchableOpacity
                    style={tw`bg-[#52A924] px-6 py-3 justify-center items-center rounded-lg `}
                    onPress={() => navigation.navigate('Home')}
                >
                    <Text style={tw`text-white text-lg font-semibold text-center`}>
                        {t('continueShopping')}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default OrderSuccessful;
