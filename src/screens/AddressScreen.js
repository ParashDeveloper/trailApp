import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableWithoutFeedback, TouchableOpacity, Modal, FlatList, Alert } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import tw from 'twrnc';
import { db } from '../config/firebaseConfig';
import { collection,addDoc, getDocs, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';

const AddressScreen = ({ navigation }) => {

    const [customerId, setCustomerId] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [address, setAddress] = useState({ id: '', customer_id: '', name: '', house: '', street: '', landmark: '' });
    const [modalVisible, setModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);  // Track if editing an address
    const {t} = useTranslation();
    useEffect(() => {
        const fetchUserData = async () => {
            const id = await AsyncStorage.getItem('userId');
            if (id) {
                setCustomerId(id);
                setAddress(prev => ({ ...prev, customer_id: id }));

                // Fetch existing addresses
                const q = query(collection(db, "addresses"), where("customer_id", "==", id));
                const querySnapshot = await getDocs(q);
                const fetchedAddresses = [];
                
                for (const docSnap of querySnapshot.docs) {
                    const addressData = docSnap.data();
                
                    // If the document does not have an 'id' field, update it in Firestore
                    if (!addressData.id) {
                        const addressRef = doc(db, "addresses", docSnap.id);
                        await updateDoc(addressRef, { id: docSnap.id });
                        addressData.id = docSnap.id; // Add the id locally as well
                    }
                
                    fetchedAddresses.push({ id: docSnap.id, ...addressData });
                }
                
                console.log('Updated addresses:', fetchedAddresses);
                setAddresses(fetchedAddresses);
                
            }
        };
        fetchUserData();
    }, []);

    const handleSelectAddress = async (item) => {
        setSelectedAddress(item);
        setAddress(item);
        setModalVisible(false);
    
        if (item) {
            await AsyncStorage.setItem('address', JSON.stringify(item));
            await AsyncStorage.setItem('customer_name',item.name);

             // Store as JSON string
            console.log("Stored Address:", item);
        }
    
        navigation.goBack(); // Navigate back to the previous screen
    };

    const handleSaveAddress = async () => {
        if (!address.name.trim() || !address.house.trim() || !address.street.trim()) {
            Alert.alert("Error", "All required fields must be filled.");
            return;
        }
    
        try {
            if (isEditing) {
                // Update existing address
                const addressRef = doc(db, "addresses", address.id);
                await updateDoc(addressRef, address);
                setAddresses(prev => prev.map(item => (item.id === address.id ? address : item)));
            } else {
                // Create address object without the empty id field
                const addressData = {
                    customer_id: customerId,
                    name: address.name,
                    house: address.house,
                    street: address.street,
                    landmark: address.landmark
                };
    
                // Add new address to Firestore and let Firestore generate a unique document ID
                const addressCollectionRef = collection(db, "addresses");
                const docRef = await addDoc(addressCollectionRef, addressData);  // ✅ Generates unique ID
    
                // Retrieve the generated document ID and update local state
                const newAddress = { id: docRef.id, ...addressData };
    
                setAddresses(prev => [...prev, newAddress]);
                setSelectedAddress(newAddress);
                await AsyncStorage.setItem('address', JSON.stringify(newAddress));
                await AsyncStorage.setItem('customer_name',address.name);
            }
    
            setModalVisible(false);
            setIsEditing(false);
            setAddress({ customer_id: customerId, name: '', house: '', street: '', landmark: '' });
    
            navigation.goBack();
        } catch (error) {
            console.error("Error saving address:", error);
            Alert.alert("Error", "Failed to save address. Please try again.");
        }
    };
    
    

    const handleDeleteAddress = async (id) => {
        Alert.alert(
            "Delete Address",
            "Are you sure you want to delete this address?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete", 
                    onPress: async () => {
                        try {
                            // Delete the address from Firestore
                            await deleteDoc(doc(db, "addresses", id));
                            setAddresses(prev => prev.filter(item => item.id !== id));
    
                            // Check if the deleted address exists in AsyncStorage
                            const storedAddress = await AsyncStorage.getItem('address');
                            if (storedAddress) {
                                const parsedAddress = JSON.parse(storedAddress);
                                  console.log("ids",parsedAddress.id,id)
                                if (parsedAddress.id === id) {
                                    // If the deleted address is the one stored in AsyncStorage, remove it
                                    console.log("entered")
                                    await AsyncStorage.removeItem('address');
                                    const value = await AsyncStorage.getItem('address');
                                    console.log("ad",value);
                                }
                            }
    
                            // If the selected address is deleted, clear it
                            if (selectedAddress?.id === id) {
                                setSelectedAddress(null);
                            }
                        } catch (error) {
                            console.error("Error deleting address:", error);
                        }
                    }, 
                    style: "destructive"
                }
            ]
        );
    };
    

    return (
        <View style={tw`flex-1 bg-white p-4`}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={tw`flex-row items-center mb-5`}>
                <MaterialIcons name="west" size={24} style={tw`text-gray-800`} />
                <Text style={tw`ml-2 text-lg font-bold text-gray-800`}>{t('confirmDeliveryLocation')}</Text>
            </TouchableOpacity>

            <Text style={tw`text-lg font-bold mb-3`}>{t('selectOrAddDeliveryAddress')}</Text>

            {/* Custom Dropdown */}
            <TouchableOpacity onPress={() => setModalVisible(true)} style={tw`border border-gray-300 p-3 rounded-lg mb-3`}>
                <Text style={tw`text-gray-600`}>
                    {selectedAddress ? `${selectedAddress.name}, ${selectedAddress.street}` : t('selectOrAddAddress')}
                </Text>
            </TouchableOpacity>

            {/* Modal for Address Selection */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={tw`flex-1 bg-black bg-opacity-50 justify-center items-center`}>
                        <TouchableWithoutFeedback>
                            <View style={tw`bg-white w-11/12 p-5 rounded-lg`}>
                                <Text style={tw`text-lg font-bold mb-3`}>{t('chooseAddress')}</Text>
                                <FlatList
                                    data={addresses}
                                    keyExtractor={item => item.id || Math.random().toString()}
                                    renderItem={({ item }) => (
                                        <View style={tw`flex-row justify-between items-center p-3 border-b border-gray-200`}>
                                            <TouchableOpacity onPress={() => handleSelectAddress(item)} style={tw`flex-1`}>
                                                <Text>{item.name}, {item.street}</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => { setAddress(item); setIsEditing(true); setModalVisible(false); }} style={tw`mr-3`}>
                                                <MaterialIcons name="edit" size={20} color="blue" />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => handleDeleteAddress(item.id)}>
                                                <MaterialIcons name="delete" size={20} color="red" />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                />
                                <TouchableOpacity onPress={() => { setAddress({ customer_id: customerId, name: '', house: '', street: '', landmark: '' }); setIsEditing(false); setModalVisible(false); }} style={tw`p-3 mt-3 bg-gray-200 rounded-lg`}>
                                    <Text style={tw`text-center text-gray-700`}>+ {t('addNewAddress')}</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* Address Form */}
            <TextInput placeholder={t('name')} placeholderTextColor="gray" value={address.name} onChangeText={(text) => setAddress({ ...address, name: text })} style={tw`border border-gray-300 p-3 rounded-lg mb-3`} />
            <TextInput placeholder={t('houseFlat')} placeholderTextColor="gray" value={address.house} onChangeText={(text) => setAddress({ ...address, house: text })} style={tw`border border-gray-300 p-3 rounded-lg mb-3`} />
            <TextInput placeholder={t('streetName')} placeholderTextColor="gray" value={address.street} onChangeText={(text) => setAddress({ ...address, street: text })} style={tw`border border-gray-300 p-3 rounded-lg mb-3`} />
            <TextInput placeholder={t('landmarkOptional')} placeholderTextColor="gray" value={address.landmark} onChangeText={(text) => setAddress({ ...address, landmark: text })} style={tw`border border-gray-300 p-3 rounded-lg mb-5`} />

            <TouchableOpacity onPress={handleSaveAddress} style={tw`absolute bottom-4 right-2 left-2 bg-[#52A924] py-3 rounded-lg items-center`}>
                <Text style={tw`text-white text-lg font-bold`}>{isEditing ? t('updateAddress') :t('saveAddress')}</Text>
            </TouchableOpacity>
        </View>
    );
};

export default AddressScreen;
