import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNavigation, Header } from './Header';
import tw from 'twrnc';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import fetchProducts, { fetchCategories } from './fetchProduct';
import AsyncStorage from '@react-native-async-storage/async-storage';
import languageEvent from './LanguageEvents'; 
import { useTranslation } from 'react-i18next';

const CategoriesScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [language, setLanguage] = useState('');
  const { t }=useTranslation();
  useEffect(() => {
    const getProducts = async () => {
      setLoading(true);
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
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

    fetchLanguage();

    languageEvent.on('languageChanged', fetchLanguage);

    return () => {
      languageEvent.off('languageChanged', fetchLanguage);
    };
  }, []);

  useEffect(() => {
    const getCategories = async () => {
      setLoading(true);
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch Categories:", error);
      } finally {
        setLoading(false);
      }
    };

    getCategories();
  }, []);

  const getRandomPastelColor = () => {
    const colors = ['#FFD1DC', '#B5EAD7', '#FFDAC1', '#C7CEEA', '#FFB7B2', '#E2F0CB', '#A2D2FF'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <Header />
      <ScrollView>
        {categories.map(category => {
          const categoryProducts = products.filter(product =>
            product.category.includes(category?.name)
          ).slice(0, 4);

          return (
            <View key={category.id} style={tw`p-3`}>
              <View style={tw`flex-row justify-between items-center mb-3`}>
                <Text style={tw`text-lg font-bold`}>
                  {language === 'en' ? category?.name : category?.category_name_hi}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('CategoryDetails', { category, products })}>
                  <MaterialIcons name="east" size={24} />
                </TouchableOpacity>
              </View>

              {loading ? (
                <View style={tw`flex-1 justify-center items-center`}>
                  <ActivityIndicator size="large" color="#52A924" />
                  <Text style={tw`text-gray-500 mt-2`}>{t('loadingProducts')}</Text>
                </View>
              ) : (
                <View style={tw`flex-row flex-wrap justify-between`}>
                  {categoryProducts.map(item => (
                    <TouchableOpacity
                      key={item.id}
                      style={tw`w-[23%] bg-white shadow-md rounded-lg pt-2 mb-4 items-center justify-between h-28 border border-gray-200`}
                      onPress={() => navigation.navigate('ProductDescription', { product: item })}
                    >
                      <Text style={tw`text-xs text-center px-2 text-gray-700 font-semibold`} numberOfLines={2} ellipsizeMode="tail">
                        {language === 'en' ? item.name_en : item.name_hi}
                      </Text>
                      <View
                        style={[
                          tw`w-16 h-16 rounded-t-full items-center justify-center overflow-hidden mt-auto justify-end`,
                          { backgroundColor: getRandomPastelColor() }
                        ]}
                      >
                        <Image source={{ uri: item.image_url }} style={tw`w-12 h-12`} resizeMode="contain" />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
      <View style={tw`px-2`}>
        <BottomNavigation navigation={navigation} activeScreen="Category" />
      </View>
    </SafeAreaView>
  );
};

export default CategoriesScreen;
