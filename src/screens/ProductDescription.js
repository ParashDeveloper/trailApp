import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { BottomNavigation } from './Header';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { handleAddToCart } from './addToCart';
import languageEvent from './LanguageEvents';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

const ProductDescription = ({ route, navigation }) => {
  const { product } = route.params;
  const [activeTab, setActiveTab] = useState('Description');
  const [activeIndex, setActiveIndex] = useState(0);
  const [cart, setCart] = useState([]); // Local cart state
  const scrollViewRef = useRef(null);
  const [language, setLanguage] = useState('en');
  const { t } = useTranslation();

  const handleAddToBag = async () => {
    setCart((prevCart) => [...prevCart, product]); // Adds product to cart
    await handleAddToCart(product, setCart)
    navigation.navigate('Bag', { items: product });
  };

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

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / 300); // Adjust width as per design
    setActiveIndex(index);
  };
  const tabs = ['Description', 'Country of Origin', 'Manufacturing Info'];
  const tab_hi = ['विवरण', 'उत्पत्ति देश', 'निर्माण जानकारी'];


  return (
    <View style={tw`flex-1 bg-white`}>
      {/* Header */}
      <View style={tw`flex-row items-center justify-between p-4 border-b border-gray-200`}>
        <View style={tw`flex-row items-center`}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={tw`mr-4`}>
            <MaterialIcons name="west" size={24} color="black" />
          </TouchableOpacity>
          <Text style={tw`text-lg font-semibold`}>{language == 'en' ? product.name_en : product.name_hi}</Text>
        </View>
      </View>

      <ScrollView>
        {/* Product Image */}
        <View style={tw`p-4 items-center relative`}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {product.images &&
              product.images.map((img, index) => (
                <Image
                  key={index}
                  source={{ uri: img.trim() }} 
                  style={[tw`rounded-lg`, { width: 300, height: 250 }]}
                  resizeMode="contain"
                />
              ))}
          </ScrollView>


          {/* Pagination Dots */}
          <View style={tw`absolute bottom-3 flex-row`}>
            {product.images && product.images.map((_, index) => (
              <View
                key={index}
                style={[
                  tw`mx-1 w-2 h-2 rounded-full bg-gray-400`,
                  activeIndex === index && tw`bg-[#52A924] w-2.5 h-2.5`
                ]}
              />
            ))}
          </View>
          <TouchableOpacity
            style={tw`absolute bottom-6 right-6 bg-white rounded-full p-2 shadow-md`}
          >
            <View style={tw`flex-row items-center gap-x-2`}>
              <MaterialIcons name="share" size={18} color="#52A924" />
              <Text style={tw`text-[#52A924]`}>Share</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Product Title and Price */}
        <View style={tw`px-4 py-2`}>
          <Text style={tw`text-xl font-bold`}>{language === 'en' ? product.name_en : product.name_hi} : {product.unit}</Text>
          <View style={tw`flex-row items-center justify-between mt-2`}>
            <View style={tw` flex-row gap-x-3`}>
              <Text style={tw`text-xl font-bold`}>{t('mrp')}: ₹{product.price}</Text>
              <Text style={tw`text-lg text-gray-400 line-through `}>
                ₹{product.mrp}
              </Text>
            </View>
            <View style={tw`ml-2 bg-orange-100 rounded-lg px-2 py-1`}>
              <Text style={tw`text-orange-400`}>
                ₹{Number(product.mrp) - Number(product.price)} OFF
              </Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={tw`border-t border-gray-200 mt-2`}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={tw`border-b border-gray-200`}
          >
            <View style={tw`flex-row p-4`}>
              {(language === 'en' ? tabs : tab_hi).map((tab) => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={tw`mr-6`}
                >
                  <Text
                    style={tw`${activeTab === tab
                      ? 'text-[#52A924] font-semibold border-b-2 border-[#52A924]'
                      : 'text-gray-500'
                      } pb-2`}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Tab Content */}
          <View style={tw`p-4`}>
            {activeTab === 'Description' && (
              <View>
                <Text style={tw`font-semibold text-lg mb-2`}>{t('overview')}</Text>
                <Text style={tw`text-gray-600 mb-4`}>{language === 'en' ? product.description : product.description_hi}</Text>
                <Text style={tw`font-semibold text-lg mb-2`}>{t('keyFeatures')}</Text>
                <Text style={tw`text-gray-600`}>{t('premiumQualityProduct')}</Text>
              </View>
            )}
            {activeTab === 'Country of Origin' && (
              <Text style={tw`text-gray-600`}>{language === 'en' ? product.countryOfOrigin : product.countryOfOrigin_hi}</Text>
            )}
            {activeTab === 'Manufacturing Info' && (
              <Text style={tw`text-gray-600`}>{language === 'en' ? product.manufacturingInfo : product.manufacturinginfo_hi}</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={tw`px-4 mb-2 border-t border-gray-200`}>
        <TouchableOpacity onPress={handleAddToBag} style={tw`bg-[#52A924] rounded-lg py-2 items-center`}>
          <Text style={tw`text-white font-semibold text-lg`}>{t('addToBag')}</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View style={tw`px-2`}>
        <BottomNavigation navigation={navigation} />
      </View>
    </View>
  );
};

export default ProductDescription;