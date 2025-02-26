import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import tw from 'twrnc';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';

// Language Selection Modal Component
export const LanguageModal = ({ visible, onClose, currentLanguage, onLanguageChange }) => {
    const { t }=useTranslation();

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={tw`flex-1 justify-center items-center bg-black/50`}>
                <View style={tw`bg-white rounded-xl w-80 p-4`}>
                    <Text style={tw`text-xl font-bold mb-4 text-center`}>{t('selectLanguage')}</Text>
                    
                    {/* English Option */}
                    <TouchableOpacity 
                        style={tw`flex-row items-center justify-between p-3 ${currentLanguage === 'en' ? 'bg-gray-100' : ''} rounded-lg mb-2`}
                        onPress={() => {
                            onLanguageChange('en');
                            onClose();
                        }}
                    >
                        <Text style={tw`text-lg`}>English</Text>
                        {currentLanguage === 'en' && (
                            <MaterialIcons name="check" size={24} color="#52A924" />
                        )}
                    </TouchableOpacity>
                    
                    {/* Hindi Option */}
                    <TouchableOpacity 
                        style={tw`flex-row items-center justify-between p-3 ${currentLanguage === 'hi' ? 'bg-gray-100' : ''} rounded-lg mb-4`}
                        onPress={() => {
                            onLanguageChange('hi');
                            onClose();
                        }}
                    >
                        <Text style={tw`text-lg`}>हिंदी</Text>
                        {currentLanguage === 'hi' && (
                            <MaterialIcons name="check" size={24} color="#52A924" />
                        )}
                    </TouchableOpacity>
                    
                    {/* Close Button */}
                    <TouchableOpacity 
                        style={tw`bg-gray-200 rounded-lg p-3`}
                        onPress={onClose}
                    >
                        <Text style={tw`text-center text-lg font-medium`}>{t('close')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};
