import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import tw from 'twrnc';
import { BottomNavigation } from './Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { LanguageModal } from './languageModal';

const ProfileScreen = () => {
    const navigation = useNavigation();
    const { t, i18n } = useTranslation();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');


    // State for Language Modal
    const [modalVisible, setModalVisible] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

    // Function to Change Language
    const handleLanguageChange = (language) => {
        i18n.changeLanguage(language);
        setCurrentLanguage(language);
        setModalVisible(false);
    };

    useFocusEffect(
        React.useCallback(() => {
            console.log("Fetching Name and Phone...");
            const getName_Phone = async () => {
                try {
                    const storedName = await AsyncStorage.getItem('customer_name');
                    setName(storedName || "No Name Found");

                    const storedPhone = await AsyncStorage.getItem('phoneNumber');
                    if (storedPhone) {
                        // Format the phone number to "+91 1234567890"
                        const formattedPhone = storedPhone.replace(/^(\+\d{2})(\d{10})$/, "$1 $2");
                        setPhone(formattedPhone);
                    } else {
                        setPhone("No Phone Found");
                    }
                } catch (error) {
                    console.error("Failed to fetch data:", error);
                }
            };


            getName_Phone();
        }, [])

    );



    return (
        <View style={tw`flex-1 bg-white`}>
            <ScrollView>
                {/* Profile Section */}
                <View style={tw`flex-row items-center p-5 bg-gray-100 rounded-lg  m-4 shadow-lg`}>
                    <Image
                        source={require('../assets/profile.jpeg')}
                        style={tw`w-16 h-16 rounded-full mr-4`}
                    />
                    <View>
                        <Text style={tw`text-lg font-bold`}>{name}</Text>
                        <View style={tw`flex-row items-center`}>
                            <MaterialIcons name="phone" size={16} color="gray" />
                            <Text style={tw`text-gray-600 ml-1`}> {phone}</Text>
                        </View>
                    </View>
                </View>

                {/* Menu Options */}
                <View style={tw`bg-white mx-4 rounded-lg shadow-lg`}>
                    <TouchableOpacity style={tw`flex-row items-center py-4 px-2 border-b border-gray-200 mx-3`} onPress={() => { }}>
                        <MaterialIcons name="share" size={18} color="gray" />
                        <Text style={tw`ml-3 text-base text-gray-800 flex-1`}>{t('shareApp')}</Text>
                        <MaterialIcons name="chevron-right" size={22} color="gray" />
                    </TouchableOpacity>

                    <TouchableOpacity style={tw`flex-row items-center py-4 px-2 border-b border-gray-200 mx-3`} onPress={() => navigation.navigate('MyOrders')}>
                        <MaterialIcons name="shopping-bag" size={18} color="gray" />
                        <Text style={tw`ml-3 text-base text-gray-800 flex-1`}>{t('myOrders')}</Text>
                        <MaterialIcons name="chevron-right" size={22} color="gray" />
                    </TouchableOpacity>

                    {/* Open Language Modal */}
                    <TouchableOpacity
                        style={tw`flex-row items-center py-4 px-2 border-b border-gray-200 mx-3`}
                        onPress={() => setModalVisible(true)}
                    >
                        <MaterialIcons name="language" size={18} color="gray" />
                        <Text style={tw`ml-3 text-base text-gray-800 flex-1`}>{t('changeLanguage')}</Text>
                        <MaterialIcons name="chevron-right" size={22} color="gray" />
                    </TouchableOpacity>

                    <TouchableOpacity style={tw`flex-row items-center py-4 px-2 border-b border-gray-200 mx-3`} onPress={() => { }}>
                        <MaterialIcons name="star-rate" size={18} color="gray" />
                        <Text style={tw`ml-3 text-base text-gray-800 flex-1`}>{t('rateUs')}</Text>
                        <MaterialIcons name="chevron-right" size={22} color="gray" />
                    </TouchableOpacity>

                    <TouchableOpacity style={tw`flex-row items-center py-4 px-2 border-b border-gray-200 mx-3`} onPress={() => { }}>
                        <MaterialIcons name="policy" size={18} color="gray" />
                        <Text style={tw`ml-3 text-base text-gray-800 flex-1`}>{t('termsAndConditions')}</Text>
                        <MaterialIcons name="chevron-right" size={22} color="gray" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={tw`flex-row items-center py-4 px-2 border-b border-gray-200 mx-3`}
                        onPress={() => {
                            Alert.alert(
                                "Logout",
                                "Are you sure you want to logout?",
                                [
                                    { text: "Cancel", style: "cancel" },
                                    {
                                        text: "Logout",
                                        onPress: async () => {
                                            await AsyncStorage.removeItem('phoneNumber');
                                            navigation.replace('PhoneInput');
                                        }
                                    }
                                ]
                            );
                        }}
                    >
                        <MaterialIcons name="logout" size={18} color="gray" />
                        <Text style={tw`ml-3 text-base text-gray-800 flex-1`}>{t('logout')}</Text>
                        <MaterialIcons name="chevron-right" size={22} color="gray" />
                    </TouchableOpacity>
                </View>

                {/* Customer Helpline */}
                <TouchableOpacity style={tw`flex-row bg-[#52A924] mx-4 mt-5 p-3 gap-x-5 rounded-lg items-center`}>
                    <MaterialIcons name="phone" size={24} color="white" />
                    <Text style={tw`text-white text-base font-bold`}>{t('customerHelpline')}</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Language Modal */}
            <LanguageModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                currentLanguage={currentLanguage}
                onLanguageChange={handleLanguageChange}
            />

            {/* Bottom Navigation */}
            <View style={tw`px-2`}>
                <BottomNavigation navigation={navigation} activeScreen="Profile" />
            </View>
        </View>
    );
};

export default ProfileScreen;
