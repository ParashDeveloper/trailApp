import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
  SafeAreaView,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import { BottomNavigation } from './Header';
import { collection, addDoc } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { db } from '../config/firebaseConfig';
import { MyUploadCardSvg } from '../svg/uploadCard';

const ImageUploadScreen = () => {
  const navigation = useNavigation();
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [userId, setUserId] = useState(null);
   const { t }=useTranslation();
  useEffect(() => {
    const getUserId = async () => {
      try {
        const id = await AsyncStorage.getItem('userId');
        if (id) {
          setUserId(id);
        } else {
          Alert.alert('Error', 'User ID not found');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to retrieve user ID');
      }
    };
    getUserId();
  }, []);

  const checkPermissions = async () => {
    if (Platform.OS === 'ios') return true;

    if (Platform.Version >= 33) {
      const photoPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
      );

      if (!photoPermission) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          {
            title: 'Photo Library Access',
            message: 'We need access to your photos to upload images.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    } else {
      return true;
    }
  };

  const handleImageSelection = async () => {
    try {
      const hasPermission = await checkPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Please grant photo access permission in your device settings to upload images.',
          [{ text: 'OK' }]
        );
        return;
      }

      const options = {
        mediaType: 'photo',
        includeBase64: true,
        maxHeight: 2000,
        maxWidth: 2000,
        quality: 0.8,
      };

      const result = await launchImageLibrary(options);

      if (result.didCancel) {
        Alert.alert('Image Selection', 'You did not select any image.');
        return;
      }

      if (result.assets && result.assets[0]) {
        setSelectedImage(result.assets[0]);
        setModalVisible(true); // Show confirmation modal
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image: ' + error.message);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage || !userId) {
      Alert.alert('Error', 'User ID or Image not found.');
      return;
    }

    setUploading(true);
    setModalVisible(false); // Hide modal

    try {
      const imageData = {
        customer_id: userId,
        imageBase64: `data:image/jpeg;base64,${selectedImage.base64}`,
        uploadedAt: new Date(),
      };

      // Use addDoc to store the image in Firestore
      await addDoc(collection(db, 'uploaded_images'), imageData);

      Alert.alert('Success', 'Image uploaded successfully!');
      setSelectedImage(null); // Reset after upload
    } catch (error) {
      Alert.alert('Upload Failed', error.message);
      console.error('Upload error:', error);
    }
    setUploading(false);
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100`}>
      <Text style={tw`text-xl font-bold text-center mb-5 border-2 rounded-b-xl border-white shadow-md p-4 bg-white`}>
       {t('uploadImage')}
      </Text>

      <View style={tw`flex-1 p-4`}>
        {!selectedImage ? (
          <View style={tw`h-full w-full`}>
            <TouchableOpacity
              onPress={handleImageSelection}
              style={tw`absolute top-50 left-4 right-4 justify-center items-center p-4 border-2 border-dashed border-gray-300 rounded-lg bg-white -translate-x-1/2 -translate-y-1/2`}
            >
              <View style={tw`w-16 h-16 mb-4 justify-center items-center bg-green-100 rounded-full`}>
                <Text style={tw`text-3xl`}>📷</Text>
              </View>
              <Text style={tw`text-lg text-gray-600 text-center`}>{t('uploadImage')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={tw`flex-1`}>
            <Image
              source={{ uri: selectedImage.uri }}
              style={tw`flex-1 rounded-lg`}
              resizeMode="contain"
            />
            {uploading && <ActivityIndicator size="large" color="#52A924" style={tw`mt-4`} />}
            {!uploading && (
              <TouchableOpacity onPress={handleImageSelection} style={tw`mt-2 bg-[#52A924] p-4 rounded-lg`}>
                <Text style={tw`text-white text-center font-semibold`}>{t('selectNewImage')}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <View style={tw`px-2`}>
        <BottomNavigation navigation={navigation} activeScreen="Upload" />
      </View>

      {/* Confirmation Modal */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={tw`flex-1 justify-center items-center bg-black/50`}>
          <View style={tw`w-80 bg-white p-4 items-center rounded-lg shadow-lg`}>
            <Text style={tw`text-lg font-semibold mb-2`}>{t("thanksForUploading")}</Text>
            <Text style={tw`text-md text-center text-gray-600 mb-4`}>
            {t("reviewMessage")}      </Text>
            <View style={tw``}>
            <MyUploadCardSvg/>
            </View>

            <View style={tw`w-full`}>
              <TouchableOpacity
                onPress={handleUpload}
                style={tw`w-full py-3 border-t border-gray-300 rounded-b-lg`}
              >
                <Text style={tw`text-[#52A924] text-center text-lg`}>{t('confirmOrder')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
               onPress={() => {
                // setSelectedImage(null); 
                setModalVisible(false);
              }}
                style={tw`w-full pt-3 border-t border-gray-300 rounded-b-lg`}
              >
                <Text style={tw`text-gray-700 text-center text-lg` }>{t('reuploadImage')}</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

export default ImageUploadScreen;
