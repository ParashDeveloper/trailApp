import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as RNLocalize from 'react-native-localize';

const languageDetector = {
    type: 'languageDetector',
    async: true,
    detect: async (callback) => {
        const storedLang = await AsyncStorage.getItem('language');
        if (storedLang) {
            callback(storedLang);
        } else {
            const bestLang = RNLocalize.findBestAvailableLanguage(['en', 'hi']);
            callback(bestLang?.languageTag || 'en');
        }
    },
    init: () => { },
    cacheUserLanguage: async (lng) => {
        await AsyncStorage.setItem('language', lng);
    },
};

i18n
    .use(languageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                translation: {
                    loading:"loading....",
                    appName: "Raju Marwadi",
                    enterPhone: "Enter Your phone number",
                    chooseLanguage: "Choose Language",
                    submit: "Submit",
                    enterOtp: "Enter OTP",
                    sentOtpTo: "We have sent you an OTP to",
                    didntReceiveOtp: "Didn't receive the OTP?",
                    resendCode: "RESEND CODE",
                    waitFor: "Wait for:",
                    verify: "Verify",
                    loadingOffers: "Loading offers...",
                    noOffersAvailable: "No offers available",
                    discount: "Discount",
                    seeDetails: "See Details",
                    sabseSastaRashan: "Sabse Sasta Rashan",
                    viewAll: "View All",
                    add: "Add",
                    yourLocation: "Your Location",
                    searchItems: "Search for items...",
                    loadingProducts: "Loading Products....",
                    noProducts: "No Products Available",
                    uploadImage: "Upload Image",
                    thanksForUploading: "Thanks For Uploading List",
                    reviewMessage: "Our team will review it and get in touch with you shortly to provide updates.",
                    confirmOrder: "Confirm Order",
                    reuploadImage: "Re-upload the Image",
                    selectNewImage: "Select New Image",
                    itemsInBag: "Items in Bag",
                    total: "Total",
                    orderSummary: "Order Summary",
                    mrp: "MRP",
                    productDiscount: "Product Discount",
                    deliveryCharge: "Delivery Charge",
                    totalAmountToPay: "Total Amount to Pay",
                    bag: "Bag",
                    deliveringTo: "Delivering to",
                    changeAddress: "Change Address",
                    confirmPayOnDelivery: "Confirm Pay On Delivery",
                    addFullAddress: "Add Full Address",
                    remove: "Remove",
                    shareApp: "Share App",
                    myOrders: "My Orders",
                    changeLanguage: "Change Language",
                    rateUs: "Rate Us",
                    termsAndConditions: "Terms & Conditions",
                    logout: "Logout",
                    customerHelpline: "Customer Helpline",
                    orderId: "Order ID",
                    qty: "Qty",
                    free: "FREE",
                    orderDetails: "Order Details",
                    itemsInThisCart: "Items in this Cart",
                    noItemsInCart: "No items in cart",
                    noProductsAvailableForThisOffer: "No products available for this offer",
                    confirmDeliveryLocation: "Confirm Delivery Location",
                    selectOrAddDeliveryAddress: "Select or Add Delivery Address",
                    chooseAddress: "Choose Address",
                    addNewAddress: "Add New Address",
                    loadingCart: "Loading Cart...",
                    noItemsInYourBag: "No Items in your bag",
                    buyWithFriendsAndSaveMoreMoney: "Buy with friends and save more money",
                    continueShopping: "Continue Shopping",
                    overview: "Overview",
                    keyFeatures: "Key Features",
                    premiumQualityProduct: "Premium quality product",
                    addToBag: "Add to Bag",
                    updateAddress: "Update Address",
                    saveAddress: "Save Address",
                    selectOrAddAddress: "Select an Address or Add New",
                    name: "Name",
                    houseFlat: "House No./ Flat",
                    streetName: "Street Name",
                    landmarkOptional: "Landmark (Optional)",
                    selectLanguage:"Select Language",
                    close:"Close"





                },
            },
            hi: {
                translation: {
                    loading:" लोड हो रहे हैं....",
                    appName: " राजू मारवाड़ी",
                    enterPhone: "फ़ोन नंबर दर्ज करें",
                    chooseLanguage: "भाषा चुनें",
                    submit: "जमा करें",
                    enterOtp: "ओटीपी दर्ज करें",
                    sentOtpTo: "हमने आपको एक ओटीपी भेजा है",
                    didntReceiveOtp: "ओटीपी नहीं मिला?",
                    resendCode: "कोड पुनः भेजें",
                    waitFor: "प्रतीक्षा करें:",
                    verify: "सत्यापित करें",
                    loadingOffers: "ऑफर लोड हो रहे हैं...",
                    noOffersAvailable: "कोई ऑफर उपलब्ध नहीं है",
                    discount: "छूट",
                    seeDetails: "विवरण देखें",
                    sabseSastaRashan: "सबसे सस्ता राशन",
                    viewAll: "सभी देखें",
                    add: "जोड़ें",
                    yourLocation: "आपका स्थान",
                    searchItems: "आइटम खोजें...",
                    loadingProducts: "उत्पाद लोड हो रहे हैं....",
                    noProducts: 'कोई प्रोडक्ट्स नहीं हैं',
                    uploadImage: "छवि अपलोड करें",
                    thanksForUploading: "सूची अपलोड करने के लिए धन्यवाद",
                    reviewMessage: "हमारी टीम इसकी समीक्षा करेगी और आपको जल्द ही अपडेट प्रदान करने के लिए संपर्क करेगी।",
                    confirmOrder: "आदेश की पुष्टि करें",
                    reuploadImage: "छवि को फिर से अपलोड करें",
                    selectNewImage: "नई छवि चुनें",
                    itemsInBag: "बैग में आइटम",
                    total: "कुल",
                    orderSummary: "ऑर्डर सारांश",
                    mrp: "एमआरपी",
                    productDiscount: "उत्पाद छूट",
                    deliveryCharge: "डिलीवरी शुल्क",
                    totalAmountToPay: "भुगतान करने योग्य कुल राशि",
                    bag: "बैग",
                    deliveringTo: "इस पते पर डिलीवरी",
                    changeAddress: "पता बदलें",
                    confirmPayOnDelivery: "कैश ऑन डिलीवरी की पुष्टि करें",
                    addFullAddress: "पूरा पता जोड़ें",
                    remove: "हटाएं",
                    shareApp: "ऐप साझा करें",
                    myOrders: "मेरे ऑर्डर",
                    changeLanguage: "भाषा बदलें",
                    rateUs: "हमें रेट करें",
                    termsAndConditions: "नियम और शर्तें",
                    logout: "लॉगआउट",
                    customerHelpline: "ग्राहक हेल्पलाइन",
                    orderId: "ऑर्डर आईडी",
                    qty: "मात्रा",
                    free: "मुफ़्त",
                    orderDetails: "ऑर्डर विवरण",
                    itemsInThisCart: "इस कार्ट में आइटम",
                    noItemsInCart: "कार्ट में कोई आइटम नहीं",
                    noProductsAvailableForThisOffer: "इस ऑफ़र के लिए कोई उत्पाद उपलब्ध नहीं",
                    confirmDeliveryLocation: "डिलीवरी स्थान की पुष्टि करें",
                    selectOrAddDeliveryAddress: "डिलीवरी पता चुनें या जोड़ें",
                    chooseAddress: "पता चुनें",
                    addNewAddress: "नया पता जोड़ें",
                    loadingCart: "कार्ट लोड हो रही है...",
                    noItemsInYourBag: "आपके बैग में कोई आइटम नहीं",
                    buyWithFriendsAndSaveMoreMoney: "दोस्तों के साथ खरीदें और अधिक पैसे बचाएं",
                    continueShopping: "खरीदारी जारी रखें",
                    overview: "अवलोकन",
                    keyFeatures: "मुख्य विशेषताएँ",
                    premiumQualityProduct: "प्रीमियम गुणवत्ता वाला उत्पाद",
                    addToBag: "बैग में जोड़ें",
                    updateAddress: "पता अपडेट करें",
                    saveAddress: "पता सहेजें",
                    selectOrAddAddress: "पता चुनें या नया जोड़ें",
                    name: "नाम",
                    houseFlat: "मकान नंबर/ फ्लैट",
                    streetName: "सड़क का नाम",
                    landmarkOptional: "लैंडमार्क (वैकल्पिक)",
                    selectLanguage:"भाषा चुनें",
                    close:"बंद करें"


                },
            },
        },
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
