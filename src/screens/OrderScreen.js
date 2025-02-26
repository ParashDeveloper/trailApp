import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import tw from 'twrnc';
import { BottomNavigation } from './Header';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, doc, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useTranslation } from 'react-i18next';
import languageEvent from './LanguageEvents';

const OrdersScreen = () => {
    const [order, setOrder] = useState([]);
    const [loading, setLoading] = useState(true); // Add loading state
    const navigation = useNavigation();
    const [language, setLanguage] = useState('');
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

        fetchLanguage();
        languageEvent.on('languageChanged', fetchLanguage);
        return () => {
            languageEvent.off('languageChanged', fetchLanguage);
        };
    }, []);

    useFocusEffect(
        useCallback(() => {
            const fetchUserData = async () => {
                try {
                    setLoading(true); // Start loading
                    console.log("Fetching orders...");

                    const userId = await AsyncStorage.getItem('userId');
                    if (!userId) {
                        console.log("User ID not found in AsyncStorage.");
                        setLoading(false);
                        return;
                    }

                    const q = query(collection(db, "orders"), where("customer_id", "==", userId));
                    const querySnapshot = await getDocs(q);

                    if (querySnapshot.empty) {
                        console.log("No orders found for this user.");
                        setLoading(false);
                        return;
                    }

                    console.log("Started fetching orders...");
                    const orderData = [];

                    const batch = writeBatch(db);
                    querySnapshot.docs.forEach(docSnap => {
                        const data = docSnap.data();

                        if (!data.order_generated_id) {
                            const orderDocRef = doc(db, "orders", docSnap.id);
                            batch.update(orderDocRef, { order_generated_id: docSnap.id });
                            data.order_generated_id = docSnap.id;
                            console.log("Updating missing order ID...");
                        }

                        orderData.push({ order_generated_id: docSnap.id, ...data });
                    });

                    if (!querySnapshot.empty) {
                        await batch.commit();
                        console.log("Batch update complete.");
                    }

                    orderData.sort((a, b) => new Date(b.date) - new Date(a.date));

                    setOrder(orderData);
                    console.log('Fetched Orders:', orderData);
                } catch (error) {
                    console.error("Error fetching user orders:", error);
                } finally {
                    setLoading(false); // Stop loading after fetching
                }
            };

            fetchUserData();
        }, [])
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'Processing':
                return 'text-orange-500';
            case 'delivered':
                return 'text-green-500';
            case 'Cancelled':
                return 'text-red-500';
            default:
                return 'text-black';
        }
    };

    return (
        <View style={tw`flex-1 bg-white`}>
            {/* Header */}
            <View style={tw`flex-row items-center p-4 border-b rounded-b-xl border-gray-500`}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialIcons name="west" size={24} color="black" />
                </TouchableOpacity>
                <Text style={tw`text-lg font-bold text-center flex-1`}>{t('myOrders')}</Text>
            </View>

            {/* Loading Indicator */}
            {loading ? (
                <View style={tw`flex-1 justify-center items-center`}>
                    <ActivityIndicator size="large" color="#52A924" />
                    <Text>{t('loading')}</Text>
                </View>
            ) : (
                <FlatList
                    data={order}
                    keyExtractor={(item) => item.order_generated_id}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => navigation.navigate('OrderDetails', { orderItems: item.order_items })}>
                            <View style={tw`flex-row items-center p-4 border-b border-gray-200`}>
                                <View style={tw`bg-white border border-gray-200 rounded-lg shadow-xl`}>
                                    <Image source={{ uri: item.image }} style={tw`w-20 h-20 rounded-lg`} />
                                </View>

                                <View style={tw`flex-1 ml-5`}>
                                    <Text style={[tw`text-base font-bold`, tw`${getStatusColor(item.status)}`]}>
                                        {language === 'en' ? item.status : item.status_hindi}
                                    </Text>
                                    <Text style={tw`text-gray-500 text-xs`} numberOfLines={1} ellipsizeMode="tail">
                                        {t('orderId')}: {item.order_generated_id}
                                    </Text>
                                </View>

                                <View style={tw`items-end`}>
                                    <Text style={tw`text-gray-500 text-xs`}>
                                        {language === 'en' ? new Date(item.date).toLocaleString('en-IN', {
                                            weekday: 'long',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }) : new Date(item.date).toLocaleString('hi-IN', {
                                            weekday: 'long',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </Text>
                                    <Text style={tw`text-gray-500 text-xs`}>
                                        {language === 'en' ? new Date(item.date).toLocaleString('en-IN', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        }) : new Date(item.date).toLocaleString('hi-IN', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </Text>
                                    <Text style={tw`text-[#52A924] font-bold text-sm`}>₹{item.total_price}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}

            {/* Bottom Navigation */}
            <BottomNavigation navigation={navigation} activeScreen="MyOrders" />
        </View>
    );
};

export default OrdersScreen;
