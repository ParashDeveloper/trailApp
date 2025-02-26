import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import tw from 'twrnc';
import { BottomNavigation } from './Header';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { fetchCart, fetchCartRules } from './fetchProduct';
import { doc, updateDoc, deleteDoc, addDoc, setDoc, collection } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';  // Import useFocusEffect
import { useTranslation } from 'react-i18next';
import languageEvent from './LanguageEvents';

const BagScreen = ({ navigation }) => {
    const [savedAddress, setSavedAddress] = useState(null); 
    const [loading, setLoading] = useState(true); 
    const [cart, setCart] = useState([]);
    const [cartItems, setcartItems] = useState([]);
    const [cartRules, setCartRules] = useState();
    const [language, setLanguage] = useState('en');
    const { t } = useTranslation();

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

    useFocusEffect(
        React.useCallback(() => {
            const fetchAddress = async () => {
                try {
                    const storedAddress = await AsyncStorage.getItem('address');

                    if (storedAddress) {
                        try {
                            const parsedAddress = JSON.parse(storedAddress);
                            setSavedAddress(parsedAddress);
                            console.log("Retrieved Address on Focus:", parsedAddress);
                        } catch (error) {
                            console.error("Error parsing address from storage:", error);
                        }
                    } else {
                        setSavedAddress(null); 
                    }
                } catch (error) {
                    console.error("Error fetching address from storage:", error);
                }
            };

            fetchAddress();

            return () => {
                setSavedAddress(null); 
            };
        }, [])
    );


    useFocusEffect(
        React.useCallback(() => {
            const getCartrules = async () => {
                setLoading(true);
                try {
                    const data = await fetchCartRules() || [];
                    setCartRules(data);
                } catch (error) {
                    console.error("Failed to fetch products:", error);
                } finally {
                    setLoading(false);
                }
            };
            getCartrules();
            console.log(cartRules);
        }, [])
    );



    useFocusEffect(
        React.useCallback(() => {
            const getCart = async () => {
                setLoading(true);
                try {
                    const data = await fetchCart() || [];
                    setCart(data);
                    console.log("cartdata", data);
                } catch (error) {
                    console.error("Failed to fetch products:", error);
                } finally {
                    setLoading(false);
                }
            };
            getCart();
        }, [])
    );

    useEffect(() => {
        setcartItems(cart[0]?.items || []);
    }, [cart]);



    const calculateTotalPrice = (items) => {
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    };
    const totalPrice = calculateTotalPrice(cartItems);
    console.log("items", cartItems);

    const updateCart = async (customerId, updatedItems) => {
        try {
            const cartDocRef = doc(db, "carts", customerId);

            if (!updatedItems || updatedItems.length === 0) {
                await deleteDoc(cartDocRef);
                setCart([]);
                setcartItems([]);
            } else {
                const newTotalPrice = calculateTotalPrice(updatedItems);
                const updateData = {
                    items: updatedItems,
                    total_price: newTotalPrice,
                    updated_at: new Date().toISOString()
                };

                await updateDoc(cartDocRef, updateData);

                setCart(prevCart => [{
                    ...prevCart[0],
                    items: updatedItems,
                    total_price: newTotalPrice,
                    updated_at: new Date().toISOString()
                }]);
                setcartItems(updatedItems);
            }
        } catch (error) {
            console.error("Error updating cart:", error);
        }
    };

    const increaseQuantity = async (sku) => {
        if (!cart[0] || !cartItems) return;

        const updatedItems = cartItems.map(item =>
            item.sku === sku ? { ...item, quantity: item.quantity + 1 } : item
        );

        setcartItems(updatedItems); // Update UI immediately
        await updateCart(cart[0].customer_id, updatedItems);
    };

    const decreaseQuantity = async (sku) => {
        if (!cart[0] || !cartItems) return;

        const updatedItems = cartItems
            .map(item =>
                item.sku === sku
                    ? { ...item, quantity: Math.max(0, item.quantity - 1) }
                    : item
            )
            .filter(item => item.quantity > 0);

        setcartItems(updatedItems);
        await updateCart(cart[0].customer_id, updatedItems);
    };

    const removeFromCart = async (sku) => {
        if (!cart[0] || !cartItems) return;

        try {
            const updatedItems = cartItems.filter(item => item.sku !== sku);
            await updateCart(cart[0].customer_id, updatedItems);
        } catch (error) {
            console.error("Error removing item from cart:", error);
        }
    };

    const handleConfirmOrder = async () => {
        try {
            console.log("Processing order...");

            const customer_id = await AsyncStorage.getItem("userId");
            const customer_name = await AsyncStorage.getItem("customer_name") || "Radha";

            if (!customer_id || !customer_name) {
                Alert.alert("Error", "Customer details not found.");
                return;
            }

            let totalPrice = cart[0].total_price;
            console.log("78-", totalPrice);

            if (totalPrice < 3000) {
                totalPrice += cartRules[0].delivery_charge;
            }

            // Order Data
            const orderData = {
                status: "Processing",
                status_hindi:"प्रोसेसिंग",
                customer_id,
                customer_name,
                date: new Date().toISOString(),
                total_price: totalPrice,
                image: cart[0].items[0].image_url,
                delivery_charge: totalPrice < 3000 ? cartRules[0].delivery_charge : 0,
                order_items: cart[0].items.map(item => ({
                    name_en: item.name_en,
                    name_hi: item.name_hi || "",
                    sku: item.sku,
                    price: item.price,
                    image_url: item.image_url,
                    quantity: item.quantity,
                    category: item.category,
                    subcategory: item.subcategory,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })),
                address: savedAddress
            };

            // Save order to Firestore
            const docRef = await addDoc(collection(db, "orders"), orderData);
            console.log("✅ Order placed successfully!", docRef.id);

            // Delete the customer's cart document from Firestore
            const cartDocRef = doc(db, "carts", cart[0].customer_id);
            await deleteDoc(cartDocRef);
            console.log("🗑️ Cart deleted successfully for customer:", customer_id);

            // Navigate to order success screen
            navigation.navigate("OrderSuccessful",{cartItems:orderData.order_items});

        } catch (error) {
            console.error("❌ Error confirming order:", error);
            Alert.alert("Error", "Failed to process order. Please try again.");
        }
    };



    return (
        <View style={tw`flex-1 bg-white`}>
            {/* Header */}
            <Text style={tw`text-2xl font-bold text-center py-4 border-b rounded-b-xl shadow-md border-gray-200`}>{t('bag')}</Text>

            {/* Cart is Empty Check */}
            {loading ? (
                <View style={tw`flex-1 items-center justify-center`}>
                    <ActivityIndicator size="large" color="#52A924" />
                    <Text style={tw`text-lg font-bold text-[#52A924] mb-2`}>{t('loadingCart')}</Text>
                </View>
            ) : (!cart[0] || !cartItems || cartItems.length === 0) ? (
                <View style={tw`flex-1 items-center justify-center`}>
                    <Image source={require('../assets/bag.png')} style={tw`w-40 h-40 mb-5`} />
                    <Text style={tw`text-lg font-bold text-[#52A924] mb-2`}>{t('noItemsInYourBag')}</Text>
                    <Text style={tw`text-sm text-gray-700 mb-5 text-center`}>{t('buyWithFriendsAndSaveMoreMoney')}</Text>
                    <TouchableOpacity
                        style={tw`flex-row items-center bg-[#52A924] py-3 px-5 rounded-lg`}
                        onPress={() => navigation.navigate('Home')}
                    >
                        <Text style={tw`text-white text-base font-bold`}>{t('continueShopping')}</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView style={tw`flex-1`}>
                    {/* Items Count and Total */}
                    <View style={tw`flex-row justify-between border bg-white border-gray-200 rounded-md shadow-md items-center px-3 py-4`}>
                        <Text style={tw`text-base`}>{t('itemsInBag')} ({cartItems?.length || 0})</Text>
                        <View style={tw`flex-row items-center`}>
                            <Text style={tw`text-base`}>{t('total')} </Text>
                            <Text style={tw`text-base text-[#52A924]`}>₹{totalPrice}</Text>
                        </View>
                    </View>

                    {/* Cart Items */}
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
                                    <Text style={tw`text-base font-medium flex-1`} numberOfLines={1}>{language==='en' ? item.name_en: item.name_hi}</Text>
                                    <Text style={tw`text-[#52A924] text-base font-medium`}>₹{item.price}</Text>
                                </View>

                                {/* Second Row: Remove & Counter */}
                                <View style={tw`flex-row justify-between items-center mt-1`}>
                                    <TouchableOpacity style={tw`border border-gray-200 rounded-md ml-7 px-4 py-2`}
                                        onPress={() => removeFromCart(item.sku)}
                                    >
                                        <Text style={tw`text-gray-400 text-xs`}>{t('remove')}</Text>
                                    </TouchableOpacity>

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
                    <View>
                    <View style={tw`p-4 bg-white border-t border-gray-200`}>
                        <Text style={tw`text-lg text-[#52A924] font-bold mb-2`}>{t('orderSummary')}</Text>

                        <View style={tw`flex-row justify-between mb-2`}>
                            <Text style={tw`text-gray-700`}>{t('mrp')}</Text>
                            <Text style={tw`text-gray-700`}>₹{totalPrice.toFixed(2)}</Text>
                        </View>
                        <View style={tw`flex-row justify-between mb-2`}>
                            <Text style={tw`text-gray-700`}>{t('productDiscount')}</Text>
                            <Text style={tw`text-gray-700`}>
                                {totalPrice < 3000 ? `₹0` : t('free')}
                            </Text>
                        </View>

                        <View style={tw`flex-row justify-between mb-2`}>
                            <Text style={tw`text-gray-700`}>{t('deliveryCharge')}</Text>
                            <Text style={tw`text-gray-700`}>
                                {totalPrice < 3000 ? `₹${cartRules?.[0]?.delivery_charge || 0}` : t('free')}
                            </Text>
                        </View>
                        <View style={tw`flex-row justify-between mt-2 border-t pt-2 border-gray-300`}>
                            <Text style={tw`text-lg text-[#52A924] font-bold`}>{t('totalAmountToPay')}</Text>
                            <Text style={tw`text-lg font-bold text-[#52A924]`}>
                                ₹{(totalPrice + (totalPrice < 3000 ? cartRules?.[0]?.delivery_charge || 0 : 0)).toFixed(2)}
                            </Text>
                        </View>

                    </View>
                    </View>
                </ScrollView>
               
            )}

            {/* Add Address Button */}
            { !cart[0] && savedAddress && !cartItems  ? (
                <View style={tw`bg-white border border-gray-200 rounded-lg shadow-md p-4 mx-2 mb-1`}>
                     <View style={tw`p-4 bg-white border-t border-gray-200`}>
                     </View>
                    <View style={tw`flex-row items-center gap-x-3`}>
                        {/* Delivery Icon (left side, vertically centered) */}
                        <MaterialIcons name="local-shipping" size={24} color="#52A924" />

                        {/* Right Side: Column with Delivery Info */}
                        <View style={tw`flex-1 flex-col`}>
                            {/* Heading: 'Delivering to' */}
                            <Text style={tw`text-black text-lg font-bold `}>{t('deliveringTo')}:</Text>

                            {/* Address & Change Address Button Row */}
                            <View style={tw`flex-row items-center justify-between`}>
                                {/* Address Text */}
                                <Text style={tw`text-gray-600 text-sm flex-1 pr-3`} numberOfLines={1} ellipsizeMode="tail">
                                    {savedAddress.name} {savedAddress.house}, {savedAddress.street}
                                </Text>
                            </View>
                        </View>
                        {/* Change Address Button */}
                        <TouchableOpacity
                            style={tw`border border-gray-300  p-2 rounded-lg`}
                            onPress={() => navigation.navigate('Address')}
                        >
                            <Text style={tw`text-gray-500 text-xs`}>{t('changeAddress')}</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={tw`flex-row bg-[#52A924] rounded-lg mt-3  py-2 items-center justify-center`}
                        onPress={handleConfirmOrder}
                    >
                        <MaterialIcons name="payments" size={24} color="white" />
                        <Text style={tw`text-white text-lg font-medium`}>{t('confirmPayOnDelivery')} </Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View>
                    <TouchableOpacity
                        style={tw`mx-4 mb-2 bg-[#52A924] rounded-lg py-2 flex-row items-center justify-center`}
                        onPress={() => navigation.navigate('Address', { setSavedAddress })}
                    >
                        <Text style={tw`text-white text-lg font-medium`}>{t('addFullAddress')}</Text>
                    </TouchableOpacity>
                </View>
            )}




            {/* Bottom Navigation */}
            <View style={tw`px-2`}>
                <BottomNavigation navigation={navigation} activeScreen="Bag" />
            </View>
        </View>
    );
};

export default BagScreen;
