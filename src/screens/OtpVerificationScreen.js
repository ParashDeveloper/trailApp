import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, SafeAreaView, Image, TouchableOpacity, TextInput, Alert } from 'react-native';
import tw from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

// import auth from '@react-native-firebase/auth';  // Firebase import commented out for now

const OtpVerificationScreen = ({ route }) => {
    const formattedPhoneNumber = route?.params?.formattedPhoneNumber || '';
    const [timer, setTimer] = useState(16); // Initialize timer at 16
    const [otp, setOtp] = useState(['', '', '', '']);
    const inputRefs = useRef([]);
    const navigation = useNavigation();
    const [otpRequested, setOtpRequested] = useState(false);  // Track OTP request status
    const { t, i18n } = useTranslation();

    useEffect(() => {
        if (formattedPhoneNumber && !otpRequested) {
            setOtpRequested(true);
            Alert.alert('OTP Sent', 'Check your phone for the OTP.');
        }
    }, [formattedPhoneNumber, otpRequested]);

    useEffect(() => {
        if (otpRequested) {
            const interval = setInterval(() => {
                setTimer((prevTime) => {
                    if (prevTime === 1) {
                        clearInterval(interval); 
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [otpRequested]);  
    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleResendCode = () => {
        setTimer(16); 
        setOtpRequested(false);
    };

    const handleOtpChange = (index, value) => {
        if (value.length > 1) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < otp.length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // Commented out Firebase OTP request logic
    // const requestOtp = async () => {
    //     try {
    //         const confirmation = await auth().signInWithPhoneNumber(formattedPhoneNumber);
    //         setConfirm(confirmation);
    //         setOtpRequested(true);  // Mark OTP as requested
    //         Alert.alert('OTP Sent', 'Check your phone for the OTP.');
    //     } catch (error) {
    //         Alert.alert('Error', error.message);
    //     }
    // };

    const verifyOtp = async () => {
        const code = otp.join('');
    
        // Simulate OTP verification (replace with actual verification logic)
        if (code === '1234') { 
            Alert.alert('Success', 'Phone number verified!');
            await AsyncStorage.setItem('phoneNumber', formattedPhoneNumber); 
            await AsyncStorage.setItem('userId', '103'); 
     
            navigation.replace('Home');  // Ensure the screen name is correct
        } else {
            Alert.alert('Error', 'Invalid OTP. Try again.');
        }
    };
    
    const handleKeyPress = (index, e) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    return (
        <SafeAreaView style={tw`flex-1 bg-[#52A924]`}>
            <View style={tw`flex-1 bg-[#52A924] relative items-center`}>
                <Image
                    source={require('../assets/EnterOtp.png')}
                    style={tw`absolute top-6 left-0 h-2/3.9`}
                    resizeMode="cover"
                />
                <Text style={tw`text-white text-center text-3xl font-bold mt-5`}>{t('enterOtp')}</Text>
                <View style={tw`bg-white rounded-t-3xl w-full px-6 pt-6 mt-auto pb-8 items-center`}>
                    <Text style={tw`text-gray-600 text-center mb-2`}>
                    {t('sentOtpTo')}
                    </Text>
                    <Text style={tw`text-black text-xl font-bold text-center mb-6`}>
                        {formattedPhoneNumber}
                    </Text>

                    <View style={tw`flex-row justify-between w-72 mb-6`}>
                        {otp.map((digit, index) => (
                            <View key={index} style={tw`items-center`}>
                                <TextInput
                                    ref={ref => inputRefs.current[index] = ref}
                                    style={tw`w-11 h-14 text-2xl text-center border-b-2 border-[#52A924] font-bold`}
                                    value={digit}
                                    onChangeText={(value) => handleOtpChange(index, value)}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    onKeyPress={(e) => handleKeyPress(index, e)}
                                    selectionColor="#22C55E"
                                />
                            </View>
                        ))}
                    </View>

                    <View style={tw`flex-row justify-center items-center mb-4`}>
                        <Text style={tw`text-gray-600`}>{t('didntReceiveOtp')} </Text>
                        <TouchableOpacity onPress={handleResendCode} disabled={timer > 0}>
                            <Text style={tw`${timer > 0 ? 'text-gray-400' : 'text-red-500'} font-semibold`}>
                            {t('resendCode')}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={tw`text-gray-600 text-center mb-6`}>{t('waitFor')}: {formatTime(timer)}</Text>

                    <TouchableOpacity
                        style={[tw`rounded-lg py-4 px-6 w-full`,{ backgroundColor: '#52A924' }]}
                        onPress={verifyOtp}
                    >
                        <Text style={tw`text-white text-center text-lg font-semibold`}>{t('verify')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default OtpVerificationScreen;
