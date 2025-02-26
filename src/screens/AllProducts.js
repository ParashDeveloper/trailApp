import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import tw from 'twrnc';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { BottomNavigation, Header } from './Header';
import fetchProducts from './fetchProduct';
import { handleAddToCart, handleIncrement, handleDecrement } from "./addToCart";
import { useTranslation } from 'react-i18next';
import languageEvent from './LanguageEvents';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AllProductsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [products, setProducts] = useState([]); 
  const [loading, setLoading] = useState(true); // ✅ Loading state added
  const { category } = route.params || {}; 
  const [cart,setCart]=useState([]);
  const {t} = useTranslation();
  const [language,setLanguage]=useState('');

  useEffect(() => {
    const getProducts = async () => {
      setLoading(true); // ✅ Start loading
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false); // ✅ Stop loading after fetching
      }
    };

    getProducts();
  }, []);

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
      languageEvent.off('languageChanged', fetchLanguage);
    };
  }, []);




  // Filter products where sabseSastaRashan is true
  const filteredProducts = products.filter(product => product.sabseSastaRashan === "TRUE");
  return (
    <View style={tw`flex-1 bg-white`}>
      <Header />
      <ScrollView contentContainerStyle={tw`p-4`}>
        <Text style={tw`text-xl font-bold mb-4`}>{ t('sabseSastaRashan')|| "All Products"}</Text>

        {loading ? (
          <View style={tw`flex-1 justify-center items-center`}>
            <ActivityIndicator size="large" color="#52A924" /> 
            <Text style={tw`text-gray-500 mt-2`}>{t("loadingProducts")}</Text>
          </View>
        ) : (
          <View style={tw`flex-row flex-wrap justify-between`}>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((item) => (
                <View key={item.id} style={tw`w-[31%]  mb-4 bg-gray-50 rounded-lg p-2 shadow-md `}>
                  <TouchableOpacity onPress={() => navigation.navigate('ProductDescription', { product: item })}>
                    <Image
                      source={{ uri: item.image_url }} 
                      style={tw`w-full h-18 rounded-lg`}
                      resizeMode="cover"
                    />
                    <Text style={tw` font-medium`} numberOfLines={1} ellipsizeMode="tail">
                    {language === 'en' ? item.name_en : item.name_hi}
                    </Text>
                    <View style={tw`flex-row gap-x-2`}>
                      <Text style={tw`text-gray-600`}>₹{item.price}</Text>
                      <Text style={[tw`text-gray-400`, { textDecorationLine: 'line-through' }]}>
                        ₹{item.mrp}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  
                {cart[item.sku] ? (
                  <View style={tw`flex-row items-center justify-between mt-2 bg-[#52A924] rounded px-1`}>
                    <TouchableOpacity onPress={() => handleDecrement(item.sku, setCart)}
                    >
                      <MaterialIcons name="remove" size={20} color="white" />
                    </TouchableOpacity>

                    <Text style={tw`text-white font-bold text-lg`}>{cart[item.sku]}</Text>

                    <TouchableOpacity onPress={() => handleIncrement(item.sku, setCart)}
                    >
                      <MaterialIcons name="add" size={20} color="white" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={tw`rounded mt-2 py-1 bg-[#52A924]`} onPress={() => handleAddToCart(item, setCart)}
>
                    <Text style={tw`text-white text-center`}>{t('add')}</Text>
                  </TouchableOpacity>
                )}

                </View>
              ))
            ) : (
              <Text style={tw`text-center text-gray-500 mt-10`}>{t("noProducts")}</Text>
            )}
          </View>
        )}
      </ScrollView>
      <View style={tw`px-2`}>
        <BottomNavigation navigation={navigation} activeScreen={"AllProducts"} />
      </View>
    </View>
  );
};

export default AllProductsScreen;
