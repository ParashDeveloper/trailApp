import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import tw from 'twrnc';
import { BottomNavigation } from './Header';
import { db } from '../config/firebaseConfig'; // Firestore instance
import { doc, getDoc } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import languageEvent from './LanguageEvents';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { handleAddToCart, handleDecrement, handleIncrement } from './addToCart';

const OfferItemsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { item } = route.params || {}; // Extract item first
  const { discount, offer, offer_hi, items = [] } = item || {}; // Extract data from item
  const { t } = useTranslation();
  const [language, setLanguage] = useState('en');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart,setCart] = useState({});

  useEffect(() => {

    const fetchProducts = async () => {
      if (!items || items.length === 0) {
        console.warn("No items found. Skipping fetch.");
        setLoading(false);
        return;
      }

      try {
        const productPromises = items.map(async (itemId) => {
          try {
            const productRef = doc(db, "products", itemId);
            const productSnap = await getDoc(productRef);

            if (productSnap.exists()) {
              return { id: productSnap.id, ...productSnap.data() };
            } else {
              return null;
            }
          } catch (error) {
            console.error("Error fetching product:", error);
            return null;
          }
        });

        const productData = await Promise.all(productPromises);
        setProducts(productData.filter((product) => product !== null));
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [items]);

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

    fetchLanguage();

    languageEvent.on('languageChanged', fetchLanguage);

    return () => {
      languageEvent.off('languageChanged', fetchLanguage);
    };
  }, []);

  return (
    <View style={tw`flex-1 bg-white p-4`}>
      <Text style={tw`text-2xl font-bold mb-4 px-2 py-4 bg-orange-200 shadow-md rounded-lg text-center`}>
        {t('discount')} {discount}% - { language === 'en' ? offer : offer_hi }
      </Text>

      {loading ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <ActivityIndicator size="large" color="#52A924" />
          <Text style={tw`text-gray-500 mt-2`}>{t('loadingProducts')}</Text>
        </View>
      ) : products.length === 0 ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <Text style={tw`text-gray-500`}>No products available for this offer</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={3}
          columnWrapperStyle={tw`justify-center gap-x-8 p-5`}
          renderItem={({ item }) => (
            <View style={tw`w-[41%] bg-gray-100 rounded-lg p-1 items-center shadow-md mb-3`}>
              {/* Product Image with Background */}
              <View style={tw`w-full h-16 bg-[#CBE5BD] rounded-lg items-center justify-center`}>
                <Image source={{ uri: item.image_url }} style={tw`w-20 h-full rounded-lg`} resizeMode="cover" />
              </View>

              {/* Product Name */}
              <Text style={tw`mt-1 text-sm font-medium`} numberOfLines={1} ellipsizeMode="tail">
                {language==='en' ? item.name_en: item.name_hi}
              </Text>

              {/* Price Section */}
              <View style={tw`flex-row gap-x-2`}>
                <Text style={tw`text-gray-600 text-xs`}>₹{item.price}</Text>
                {item.mrp && (
                  <Text style={[tw`text-gray-400 text-xs`, { textDecorationLine: 'line-through' }]}>
                    ₹{item.mrp}
                  </Text>
                )}
              </View>

              {cart[item.sku] ? (
                  <View style={tw`flex-row items-center justify-between mt-2 bg-[#52A924] rounded px-1`}>
                    <TouchableOpacity onPress={() => handleDecrement(item.sku, setCart)}
                    >
                      <MaterialIcons name="remove" size={20} color="white" />
                    </TouchableOpacity>

                    <Text style={tw`text-white font-bold px-2 text-lg`}>{cart[item.sku]}</Text>

                    <TouchableOpacity onPress={() => handleIncrement(item.sku, setCart)}
                    >
                      <MaterialIcons name="add" size={20} color="white" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={tw`rounded mt-2 px-4 py-1 bg-[#52A924]`} onPress={() => handleAddToCart(item, setCart)}
                  >
                    <Text style={tw`text-white text-center`}>{t('add')}</Text>
                  </TouchableOpacity>
                )}
            </View>

          )}
        />
      )}

      <BottomNavigation navigation={navigation} activeScreen="OfferItems" />
    </View>
  );
};

export default OfferItemsScreen;
