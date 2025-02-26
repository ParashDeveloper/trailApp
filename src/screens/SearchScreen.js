import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, ActivityIndicator, Dimensions } from 'react-native';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import { BottomNavigation } from './Header';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import fetchProducts from './fetchProduct';
import { handleAddToCart, handleIncrement, handleDecrement } from "./addToCart";
import AsyncStorage from '@react-native-async-storage/async-storage';
import languageEvent from './LanguageEvents';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

const SearchScreen = () => {
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [language,setLanguage]=useState('en');
    const {t}= useTranslation();
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
          languageEvent.off('languageChanged', fetchLanguage); // ✅ Cleanup listener
        };
      }, []);
      
      const filteredProducts = products.filter((product) =>
        (language === 'en' ? product.name_en : product.name_hi)
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
    

    return (
        <View style={tw`flex-1  bg-white`}>
            {/* Search Bar */}
            <View style={[tw`p-3 flex-row items-center`, { backgroundColor: '#59B827' }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialIcons name="west" size={24} color="white" />
                </TouchableOpacity>
                <TextInput
                    placeholder="Search for items..."
                    style={tw`bg-white flex-1 rounded-lg px-3 py-2 ml-2`}
                    placeholderTextColor="#666"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoFocus
                />
                <TouchableOpacity>
                    <MaterialIcons name="mic" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {/* Loading Indicator */}
            {loading ? (
                <View style={tw`flex-1 justify-center items-center`}>
                    <ActivityIndicator size="large" color="#52A924" />
                    <Text style={tw`text-gray-500 mt-2`}>Loading products...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredProducts}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    columnWrapperStyle={tw`justify-between mt-5 px-5`}
                    renderItem={({ item }) => (

                        <View style={[tw`bg-white rounded-xl shadow-md  px-2 py-2 h-100% `, { width: width * 0.42 }]}>
                            <TouchableOpacity onPress={() => { navigation.navigate('ProductDescription', { product: item }) }}>

                                {/* Product Image */}
                                <View style={tw`items-center bg-border-[#CBE5BD] border bg-[#CBE5BD] rounded-lg `}>
                                    <Image source={{ uri: item.image_url }} style={[tw`rounded-lg`, { width: width * 0.2, height: width * 0.21 }]} resizeMode="cover" />
                                </View>

                                {/* Product Name */}
                                <Text style={tw`text-sm font-semibold mt-1 text-center`} numberOfLines={1} ellipsizeMode="tail">
                                    {language==='en'?item.name_en:item.name_hi}
                                </Text>

                                {/* Price Section */}
                                <View style={tw`flex-row justify-center gap-x-2 items-center `}>
                                    <Text style={tw`text-[#52A924] font-bold text-sm`}>₹{item.price}</Text>
                                    {item.mrp && (
                                        <Text style={[tw`text-gray-400  text-xs`, { textDecorationLine: 'line-through' }]}>
                                            ₹{item.mrp}
                                        </Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                            <View style={tw`px-4`}>

                                {/* Add to Cart */}
                                {cart[item.sku] ? (
                                    <View style={tw`flex-row items-center justify-between  bg-[#52A924] rounded-lg px-3 `}>
                                        <TouchableOpacity onPress={() => handleDecrement(item.sku, setCart)}>
                                            <MaterialIcons name="remove" size={20} color="white" />
                                        </TouchableOpacity>

                                        <Text style={tw`text-white font-bold text-lg`}>{cart[item.sku]}</Text>

                                        <TouchableOpacity onPress={() => handleIncrement(item.sku, setCart)}>
                                            <MaterialIcons name="add" size={20} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <TouchableOpacity style={tw`rounded-lg py-1  bg-[#52A924]`} onPress={() => handleAddToCart(item, setCart)}>
                                        <Text style={tw`text-white text-center font-semibold`}>{t('add')}</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                        </View>

                    )}
                    ListEmptyComponent={() => <Text style={tw`text-center text-gray-500 mt-10`}>No products found</Text>}
                />

            )}

            {/* Bottom Navigation */}
            <View style={tw`px-2`}>
                <BottomNavigation navigation={navigation} activeScreen="SearchScreen" />
            </View>
        </View>
    );
};

export default SearchScreen;
