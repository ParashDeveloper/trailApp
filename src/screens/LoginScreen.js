import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import tw from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

const PhoneInputScreen = ({ navigation }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [language, setLanguage] = useState('en');
        const { t, i18n } = useTranslation();


    useEffect(() => {
        checkLoginStatus();
        loadLanguagePreference();
    }, []);

    // Check if user is already logged in
    const checkLoginStatus = async () => {
        const storedPhone = await AsyncStorage.getItem('phoneNumber');
        if (storedPhone) {
            navigation.replace('Home'); 
        }
    };

    // Load language preference from AsyncStorage
    const loadLanguagePreference = async () => {
        const storedLanguage = await AsyncStorage.getItem('language');
        if (storedLanguage) {
            setLanguage(storedLanguage);
        }
    };

    // Save language selection in AsyncStorage
    const handleLanguageChange = async (selectedLanguage) => {
        setLanguage(selectedLanguage);
        await AsyncStorage.setItem('language', selectedLanguage);
        await i18n.changeLanguage(selectedLanguage);

    };

    const handleSubmit = () => {
        if (navigation && phoneNumber.length === 10) {
            const formattedPhoneNumber = `+91${phoneNumber}`;
            navigation.navigate('OtpVerification', { formattedPhoneNumber });
        }
    };

    return (
        <SafeAreaView style={tw`flex-1 bg-white`}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={tw`flex-1`}
            >
                <ScrollView
                    contentContainerStyle={tw`flex-grow`}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={tw`flex-1 px-4 pt-13`}>
                        {/* Header */}
                        <View style={tw`items-center mb-8`}>
                            <Text style={tw`text-2xl font-bold text-gray-800`}>
                            {t('appName')}
                            </Text>
                        </View>

                        {/* Phone Input Section */}
                        <View style={tw`mb-8`}>
                            <Text style={tw`text-gray-400 text-base mb-2`}>
                             {t('enterPhone')}
                            </Text>

                            <View style={tw`flex-row items-center border border-[#52A924] rounded-full px-4 h-[50px]`}>
                                <TextInput
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                    keyboardType="numeric"
                                    maxLength={10}
                                    style={tw`flex-1 text-lg`}
                                />
                                {phoneNumber.length >= 10 && (
                                    <View style={tw`w-6 h-6 rounded-full bg-[#52A924] items-center justify-center`}>
                                        <Text style={tw`text-white text-sm`}>✓</Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Language Selection */}
                        <View style={tw`mb-8`}>
                            <Text style={tw`text-base mb-2 text-gray-700`}>
                            {t('chooseLanguage')}
                            </Text>
                            <View style={tw`flex-row h-12`}>
                                <TouchableOpacity
                                    onPress={() => handleLanguageChange('en')}
                                    style={tw`flex-1 rounded-full justify-center items-center ${language === 'en' ? 'bg-[#52A924]' : 'bg-gray-100'}`}
                                >
                                    <Text style={tw`text-base ${language === 'en' ? 'font-bold text-white' : ''}`}>
                                        English
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => handleLanguageChange('hi')}
                                    style={tw`flex-1 rounded-full justify-center items-center ${language === 'hi' ? 'bg-[#52A924]' : 'bg-gray-100'}`}
                                >
                                    <Text style={tw`text-base ${language === 'hi' ? 'font-bold text-white' : ''}`}>
                                        हिंदी
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Image Section */}
                        <View style={tw`mb-8`}>
                            <Image
                                source={require('../assets/shop.png')}
                                style={tw`w-full h-64 rounded-lg`}
                            />
                        </View>

                    </View>
                </ScrollView>

                {/* Submit Button - Fixed at bottom */}
                <View style={tw`px-4 py-6 bg-white shadow-lg`}>
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={phoneNumber.length < 10}
                        style={tw`h-12 rounded-xl justify-center items-center ${phoneNumber.length >= 10 ? 'bg-[#52A924]' : 'bg-gray-200'}`}
                    >
                        <Text style={tw`text-white text-lg font-semibold`}>
                            {t('submit')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default PhoneInputScreen;
