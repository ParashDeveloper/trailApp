import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button } from "react-native-paper";
import tw from "twrnc";
import { PermissionsAndroid } from "react-native";



const LocationScreen = () => {
    const [address, setAddress] = useState({
        id: '',
        customer_id: '',
        name: '',
        house: '',
        street: '',
        landmark: ''
    });

    useEffect(() => {
        loadStoredAddress();
    }, []);

    const loadStoredAddress = async () => {
        try {
            const savedAddress = await AsyncStorage.getItem("address");
            if (savedAddress) {
                setAddress(JSON.parse(savedAddress));
            }
        } catch (error) {
            console.error("Error loading address:", error);
        }
    };

    const saveAddress = async () => {
        try {
            await AsyncStorage.setItem("address", JSON.stringify(address));
            Alert.alert("Success", "Address saved successfully!");
        } catch (error) {
            console.error("Error saving address:", error);
            Alert.alert("Error", "Failed to save address.");
        }
    };
    async function requestPermissions() {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
            console.warn(err);
            return false;
        }
    }
    const reverseGeocode = async (latitude, longitude) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
                {
                    headers: { "User-Agent": "YourAppName/1.0 (your-email@example.com)" }
                }
            );
            const data = await response.json();
            setAddress({
                ...address,
                name: data.display_name || "Unknown Location",
            });
        } catch (error) {
            console.error("Reverse Geocoding Error:", error);
        }
    };

    return (
        <View style={tw`flex-1 p-5 bg-gray-100`}>
            <Text style={tw`text-lg font-bold text-gray-700`}>Enter Address:</Text>

            <TextInput
                style={tw`border border-gray-400 p-3 rounded-lg mt-2 bg-white`}
                placeholder="Name"
                placeholderTextColor='gray'
                value={address.name}
                onChangeText={(text) => setAddress({ ...address, name: text })}
            />
            
            <TextInput
                style={tw`border border-gray-400 p-3 rounded-lg mt-2 bg-white`}
                placeholder="House No"
                placeholderTextColor='gray'
                value={address.house}
                onChangeText={(text) => setAddress({ ...address, house: text })}
            />

            <TextInput
                style={tw`border border-gray-400 p-3 rounded-lg mt-2 bg-white`}
                placeholder="Street"
                placeholderTextColor='gray'
                value={address.street}
                onChangeText={(text) => setAddress({ ...address, street: text })}
            />

            <TextInput
                style={tw`border border-gray-400 p-3 rounded-lg mt-2 bg-white`}
                placeholder="Landmark"
                placeholderTextColor='gray'
                value={address.landmark}
                onChangeText={(text) => setAddress({ ...address, landmark: text })}
            />

            <Button mode="contained" onPress={saveAddress} style={tw`mt-5 bg-blue-600`} labelStyle={tw`text-white`}>
                Save Address
            </Button>
        </View>
    );
};

export default LocationScreen;
