import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, ImageBackground, ActivityIndicator, Dimensions } from 'react-native';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import { Header, BottomNavigation } from './Header';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import fetchProducts, { fetchBanners, fetchDailyOffers } from './fetchProduct';
import { handleAddToCart, handleIncrement, handleDecrement } from "./addToCart";
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import languageEvent from './LanguageEvents';

const { width } = Dimensions.get('window');

const GroceryApp = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef(null);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [loadingBanners, setLoadingBanners] = useState(true);

  const [products, setProducts] = useState();
  const [cart, setCart] = useState({});
  const [Banners, setBanners] = useState([]);
  const { t } = useTranslation();
  const [language, setLanguage] = useState('en');
  const [offers, setOffers] = useState([]);

useEffect(()=>{
  const getProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await fetchProducts();
      setProducts(response);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoadingProducts(false);
    }
  };
  
  const getOffers = async () => {
    setLoadingOffers(true);
    try {
      const response = await fetchDailyOffers();
      setOffers(response);
    } catch (error) {
      console.error("Failed to fetch offers:", error);
    } finally {
      setLoadingOffers(false);
    }
  };
  
  const getBanners = async () => {
    setLoadingBanners(true);
    try {
      const response = await fetchBanners();
      setBanners(response);
    } catch (error) {
      console.error("Failed to fetch banners:", error);
    } finally {
      setLoadingBanners(false);
    }
  };
  getProducts();
  getOffers();
  getBanners();
},[]);
  
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


  const filteredProducts = (products || [])
  .filter(product => product.sabseSastaRashan?.toString().toLowerCase() === "true")
  .slice(0, 3);


  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setActiveIndex(index);
  };

  return (
    <View style={tw`flex-1 bg-white`}>
      <Header />


      <ScrollView style={tw`flex-1 px-2 py-1`}>
        {/* Discount Banner */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={tw`py-4`}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {loadingBanners ? (
            <View style={tw`flex-1 justify-center items-center w-full`}>
              <ActivityIndicator size="large" color="#52A924" />
              <Text style={tw`text-gray-500 mt-2`}>{t('loadingOffers')}</Text>
            </View>
          ) : Banners.length === 0 ? (
            <View style={tw`flex-1 justify-center items-center w-full`}>
              <Text style={tw`text-gray-500 mt-2`}>{t('noOffersAvailable')}</Text>
            </View>
          ) : (
            Banners.map((item) => (
              <View
                key={item.id}
                style={[
                  tw`rounded-3xl overflow-hidden`,
                  { width: 280, marginHorizontal: 10 } // Adjust width for banners
                ]}
              >
                <ImageBackground
                  source={{ uri: item.image_url }}
                  style={tw`w-full justify-center items-center`}
                  imageStyle={tw`rounded-3xl`}
                  resizeMode="cover"
                >
                  <View style={tw`absolute left-4 top-4 flex-1 justify-between`}>
                    <View>
                      <Text style={tw`text-white text-2xl font-bold`}>{t('discount')}</Text>
                      <Text style={tw`text-white text-2xl font-bold`}>{item.discount}%</Text>
                      <Text style={tw`text-white text-sm`} numberOfLines={1} ellipsizeMode="tail">
                        {((language === 'en' ? item.offer : item.offer_hi) || 'inhindi').slice(0, 10) + (item.offer.length > 6 ? '...' : '')}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('OfferItems', { item })}
                      style={tw`mt-3 bg-white px-2 py-1 items-center rounded-lg`}
                    >
                      <View style={tw`flex-row items-center px-1`}>
                        <Text style={tw`text-black text-sm font-semibold`}>{t('seeDetails')}</Text>
                        <MaterialIcons name="east" size={16} color="black" style={tw`ml-1`} />
                      </View>
                    </TouchableOpacity>
                  </View>
                </ImageBackground>
              </View>
            ))
          )}

        </ScrollView>

        {/* Dotted Pagination */}
        <View style={tw`flex-row items-center mt-2`}>
          {Banners.map((item, index) => (
            <View
              key={index}
              style={[
                tw`mx-1 w-2 h-2 rounded-full bg-gray-400`,
                activeIndex === index && tw`bg-[#52A924] w-3 h-3`
              ]}
            />
          ))}
        </View>

        {/* Sabste sasta Rashan */}
        <View style={tw`px-4`}>
          {loadingProducts ? (
            <View style={tw`flex-1 justify-center items-center`}>
              <ActivityIndicator size="large" color="#52A924" />
              <Text style={tw`text-gray-500 mt-2`}>{t('loadingProducts')}</Text>
            </View>
          ) : (<View style={tw`flex-row justify-between items-center mb-4 px-1`}>
            {/* Heading */}
            <Text style={tw`text-lg font-bold`}>{t('sabseSastaRashan')}</Text>

            {/* View All Button */}
            <TouchableOpacity
              style={tw`flex-row items-center gap-x-1.5`}
              onPress={() => navigation.navigate('AllProducts', { category: 'Sabste Sasta Rashan' })}
            >
              <Text style={tw`text-base font-medium text-[#52A924]`}>{t('viewAll:')}</Text>
              <MaterialIcons name="east" size={22} color="#52A924" />
            </TouchableOpacity>
          </View>)}


          {/* Products Grid */}
          <View style={tw`flex-row flex-wrap justify-between`}>
            {filteredProducts.map((product) => (
              <View key={product.id} style={tw`w-[31%] mb-4  bg-gray-50 rounded-lg p-2 shadow-md`}>
                <TouchableOpacity onPress={() => navigation.navigate('ProductDescription', { product })}>
                  <Image source={{ uri: product.image_url }} style={tw`w-full h-15 rounded-lg`} resizeMode="cover" />
                </TouchableOpacity>
                <Text style={tw`mt-2 font-medium`} numberOfLines={1} ellipsizeMode="tail">
                  {language === 'en' ? product.name_en : product.name_hi}
                </Text>
                <View style={tw`flex-row gap-x-2`}>
                  <Text style={tw`text-gray-600`}>₹{product.price}</Text>
                  <Text style={[tw`text-gray-400`, { textDecorationLine: 'line-through' }]}>
                    ₹{product.mrp}
                  </Text>
                </View>

                {cart[product.sku] ? (
                  <View style={tw`flex-row items-center justify-between mt-2 bg-[#52A924] rounded px-1`}>
                    <TouchableOpacity onPress={() => handleDecrement(product.sku, setCart)}
                    >
                      <MaterialIcons name="remove" size={20} color="white" />
                    </TouchableOpacity>

                    <Text style={tw`text-white font-bold text-lg`}>{cart[product.sku]}</Text>

                    <TouchableOpacity onPress={() => handleIncrement(product.sku, setCart)}
                    >
                      <MaterialIcons name="add" size={20} color="white" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={tw`rounded mt-2 py-1 bg-[#52A924]`} onPress={() => handleAddToCart(product, setCart)}
                  >
                    <Text style={tw`text-white text-center`}>{t('add')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>



          {/* Free Items Banner */}
          <View style={tw` rounded-lg p-4 `}>
            <Text style={tw`font-bold mb-2`}><Text style={tw`font-bold mb-2`}>
              {language === 'en' ? offers[0]?.title || t('loading...') : offers[0]?.title_hi || t('loading...')}
            </Text>
            </Text>
            <Text style={tw`text-xl font-bold`}>₹{offers[0]?.amount || 0}</Text>
          </View>
        </View>


        <View style={tw`bg-white shadow-md rounded-lg mb-4 flex-row`}>
          {/* Left Side - Full Cover Image */}
          <Image
            source={{uri:offers[0]?.image_url}}
            style={tw`w-1/2 h-29 rounded-lg `}
            resizeMode="cover"
          />

          {/* Right Side - Text & Price */}
          <View style={tw`flex-1 px-4 py-2 justify-between`}>
            <Text style={tw`font-bold`} >
              {language === 'en' ? offers[0]?.data || t('loading...') : offers[0]?.data_hi || t('loading...')}
            </Text>
            <Text style={tw`text-gray-400`} numberOfLines={1} ellipsizeMode="tail">
              {language === 'en' ? offers[0]?.offer_text || t('loading...') : offers[0]?.offer_text_hi || t('loading...')}
            </Text>
            <View style={tw`flex-row items-center gap-x-2`}>
              <Text style={[tw`font-bold`, { color: '#52A924' }]}>₹{offers[0]?.amount || 0}</Text>
              <Text style={[tw`text-gray-400`, { textDecorationLine: 'line-through' }]}>₹{offers[0]?.mrp || '2250'}</Text>
              <TouchableOpacity style={[tw`rounded px-3 py-1`, { backgroundColor: '#52A924' }]}>
                <Text style={tw`text-white text-center text-sm`}>{t('add')}</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>

      </ScrollView>
      <View style={tw`px-2`}>
        <BottomNavigation navigation={navigation} activeScreen="Home" />
      </View>
    </View>
  );
};

export default GroceryApp;