import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNavigation, Header } from './Header';
import tw from 'twrnc';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { handleAddToCart, handleIncrement, handleDecrement } from "./addToCart";
import AsyncStorage from '@react-native-async-storage/async-storage';
import languageEvent from './LanguageEvents'; 
import { useTranslation } from 'react-i18next';

const CategoryProductsScreen = ({ route, navigation }) => {
  const { category, products } = route.params;
  const [cart, setCart] = useState([]);
  const [language,setLanguage]=useState('en');
  const { t } =useTranslation();

  const productData = products.filter(product =>
    product.category.includes(category?.name)
  );

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
      <Header />
      <ScrollView>
        <View style={tw`p-4`}>
          <Text style={tw`text-xl font-bold mb-3 text-gray-800`}>{language==='en'? category.name:category.category_name_hi ?? 'Unknown Category'}</Text>

          {productData.length === 0 ? (
            <View style={tw`flex-1 justify-center items-center mt-10`}>
              <Text style={tw`text-gray-500 text-lg`}>{t('noProducts')}.</Text>
            </View>
          ) : (
            <View style={tw`flex-row flex-wrap justify-between`}>
              {productData.map(item => (

                <View
                  key={item.id}
                  style={tw`w-[47%] h-[30%] bg-white rounded-xl shadow-lg pb-3 py-1 mb-3 items-center border border-gray-200`}
                >
                  <TouchableOpacity onPress={() => { navigation.navigate('ProductDescription', { product: item }) }} style={tw`items-center`}>

                    {/* Product Image */}
                
                    <View style={tw`w-full h-19 rounded-lg overflow-hidden bg-border-[#CBE5BD] border bg-[#CBE5BD] rounded-lg  flex items-center justify-center px-8 `}>
                      <Image source={{ uri: item.image_url }} style={tw`w-20 h-20`} resizeMode="contain" />
                    </View>

                    {/* Product Name */}
                    <Text style={tw`text-sm font-semibold text-center text-gray-800`} numberOfLines={2} ellipsizeMode="tail">
                      {language==='en'? item.name_en : item.name_hi}
                    </Text>

                    {/* Price Section */}
                    <View style={tw`flex-row items-center gap-x-2 `}>
                      <Text style={tw`text-green-600 font-bold`}>₹{item.price}</Text>
                      {item.mrp && (
                        <Text style={tw`text-gray-400 text-xs line-through`}>₹{item.mrp}</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                  {/* Add to Cart / Quantity Controls */}
                  {cart[item.sku] ? (
                    <View style={tw`flex-row items-center justify-between gap-x-4 bg-[#52A924] rounded-lg px-3 py-1`}>
                      <TouchableOpacity onPress={() => handleDecrement(item.sku, setCart)}>
                        <MaterialIcons name="remove" size={20} color="white" />
                      </TouchableOpacity>

                      <Text style={tw`text-white font-bold text-lg`}>{cart[item.sku]}</Text>

                      <TouchableOpacity onPress={() => handleIncrement(item.sku, setCart)}>
                        <MaterialIcons name="add" size={20} color="white" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity style={tw`rounded-lg py-2 px-10 bg-[#52A924] mb-2`} onPress={() => handleAddToCart(item, setCart)}>
                      <Text style={tw`text-white text-center font-semibold`}>{t('add')}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={tw`px-2`}>
        <BottomNavigation navigation={navigation} activeScreen="CategoryProducts" />
      </View>
    </SafeAreaView>
  );
};

export default CategoryProductsScreen;
