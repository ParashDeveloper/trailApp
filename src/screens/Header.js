import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Pressable } from 'react-native';
import tw from 'twrnc';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Voice from '@react-native-voice/voice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LanguageModal } from './languageModal';
import { useTranslation } from 'react-i18next';
import languageEvent from './LanguageEvents';

export const Header = () => {
    const navigation = useNavigation();
    const [isListening, setIsListening] = useState(false);
    const [address, setAddress] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState('en');
    const { t,i18n } = useTranslation();


    useEffect(() => {
        const fetchLanguage = async () => {
            try {
                const storedLanguage = await AsyncStorage.getItem('language');
                if (storedLanguage) {
                    setCurrentLanguage(storedLanguage);
                }
            } catch (error) {
                console.error("Error fetching language preference:", error);
            }
        };
        fetchLanguage();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            const fetchAddress = async () => {
                try {
                    const storedAddress = await AsyncStorage.getItem('address');

                    if (storedAddress) {
                        try {
                            const parsedAddress = JSON.parse(storedAddress);
                            setAddress(parsedAddress);
                            console.log("Retrieved Address on Focus:", parsedAddress);
                        } catch (error) {
                            console.error("Error parsing address from storage:", error);
                        }
                    } else {
                        setAddress("123, Street Name, City"); // Ensure state resets when no address exists
                    }
                } catch (error) {
                    console.error("Error fetching address from storage:", error);
                }
            };

            fetchAddress();

            return () => {
                setAddress("123, Street Name, City"); // Reset the state when unmounting
            };
        }, [])
    );
    const handleLanguageChange = async (language) => {
        try {
            await AsyncStorage.setItem('language', language);
            await i18n.changeLanguage(language);
            languageEvent.emit('languageChanged'); 
            setCurrentLanguage(language);
        } catch (error) {
            console.error("Error saving language preference:", error);
            Alert.alert("Error", "Failed to save language preference");
        }
    };

    useEffect(() => {
        Voice.onSpeechResults = (event) => {
            const text = event.value[0]; // First recognized text
            navigation.navigate('SearchScreen', { voiceSearch: text }); // Navigate with text
        };

        Voice.onSpeechError = (error) => {
            console.error(error);
            Alert.alert("Error", "Could not process voice input.");
        };

        return () => {
            Voice.destroy().then(Voice.removeAllListeners);
        };
    }, []);

    const startVoiceSearch = async () => {
        try {
            setIsListening(true);
            await Voice.start('en-US');
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Voice recognition failed.");
            setIsListening(false);
        }
    };

    return (

        // <LinearGradient
        //     colors={['#4CA01F', '#52A924', '#52A924']} 
        //     start={{ x: 0, y: 0 }} 
        //     end={{ x: 1, y: 0 }}
        //     style={tw`rounded-bl-3xl rounded-br-3xl p-4 pt-3`}
        // >

        <View style={[tw`p-4 pt-3 rounded-bl-3xl rounded-br-3xl`, { backgroundColor: '#52A924' }]}>
            {/* Row: Location | Language | Call Icon */}
            <View style={tw`flex-row items-center justify-between mb-2`}>
                {/* Location (Column) */}
                <View style={tw`flex-row items-center`}>
                    <MaterialIcons name="my-location" size={24} color="white" />
                    <View style={tw`ml-2`}>
                        <Text style={tw`text-white text-lg font-semibold`}>{t('yourLocation')}</Text>
                        <View style={tw`flex-row items-center`}>
                            <Text style={tw`text-white text-sm`} numberOfLines={1} ellipsizeMode="tail">
                                {address.name} {address.house}, {address.street}
                            </Text>
                            {/* <Text>{address}</Text> */}
                            <MaterialIcons name="keyboard-arrow-down" size={24} color="white" />
                        </View>
                    </View>
                </View>

                {/* Language & Call Button */}

                <View style={tw`flex-row items-center relative gap-x-3`}>
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <View style={tw`p-2 rounded items-center w-10 h-10 justify-center`}>
                        <View
                            style={[
                                tw`absolute w-0.5 h-10 bg-white`,
                                { transform: [{ rotate: '239deg' }], top: 0, bottom: 15 }
                            ]}
                        />
                        <View style={tw`items-center`}>
                            <Text style={tw`text-white font-semibold text-sm mb-1`}>
                                {currentLanguage === 'hi' ? 'आ' : 'Aa'}
                            </Text>
                            <Text style={tw`text-white font-semibold text-sm mt-1`}>
                                {currentLanguage === 'hi' ? 'Aa' : 'आ'}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Call Icon */}
                <TouchableOpacity onPress={() => navigation.navigate('ContactScreen')}>
                    <MaterialIcons name="phone" size={24} color="white" />
                </TouchableOpacity>
            </View>
            <LanguageModal 
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                currentLanguage={currentLanguage}
                onLanguageChange={handleLanguageChange}
            />
            </View>

            {/* Search Bar */}
            <View style={tw`bg-white rounded-lg flex-row items-center px-3 py-2`}>
                <TouchableOpacity onPress={() => navigation.navigate('SearchScreen')} style={tw`flex-row flex-1`}>
                    <MaterialIcons name="search" size={20} color="gray" />
                    <Text style={tw`ml-2 flex-1 text-gray-500`}>{t('searchItems')}</Text>
                </TouchableOpacity>

                {/* Mic button (separate from search navigation) */}
                <TouchableOpacity onPress={startVoiceSearch}>
                    <MaterialIcons name={isListening ? "mic-off" : "mic"} size={20} color="gray" />
                </TouchableOpacity>
            </View>
        </View>



        // </LinearGradient>

    );
};

export const BottomNavigation = ({ navigation, activeScreen }) => {
    const [language, setLanguage] = useState('en');

    const navItems = [
        { name: 'Home',name_hi: 'होम', icon: 'home' },
        { name: 'Category',name_hi: ' श्रेणी', icon: 'category' },
        { name: 'Upload', name_hi: 'अपलोड', icon: 'file-upload' },
        { name: 'Bag', name_hi: 'बैग',icon: 'shopping-basket' },
        { name: 'Profile',name_hi: 'प्रोफ़ाइल', icon: 'person' }
    ];
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

    return (
        <View style={tw`flex-row justify-around items-center py-2 bg-white border rounded-lg border-gray-200 mb-4`}>
            {navItems.map((item) => {
                if (!item) { item.name = 'Home', item.icon = 'home' }
                const isActive = activeScreen === item.name;
                return (
                    <TouchableOpacity
                        key={item.name}
                        style={tw`items-center`}
                        onPress={() => navigation.navigate(item.name)}
                    >
                        <MaterialIcons
                            name={item.icon}
                            size={24}
                            color={isActive ? '#52A924' : 'gray'}
                        />
                        <Text style={tw`text-xs ${isActive ? 'text-[#52A924]' : 'text-gray-600'}`}>
                            { language==='en' ? item.name : item.name_hi }
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};
