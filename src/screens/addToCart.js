import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Adds a product to the user's cart or increments its quantity if it already exists.
 * @param {Object} product - The product object.
 * @param {Function} setCart - Function to update the cart state.
 */
export const handleAddToCart = async (product, setCart) => {
    try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) {
            console.error("User ID not found");
            return;
        }
        const cartRef = doc(db, "carts", userId);
        const cartSnap = await getDoc(cartRef);

        let updatedItems = [];

        if (cartSnap.exists()) {
            const currentCartData = cartSnap.data();
            const existingItemIndex = currentCartData.items.findIndex(item => item.sku === product.sku);

            updatedItems = [...currentCartData.items];

            if (existingItemIndex !== -1) {
                // Increase quantity if item exists
                updatedItems[existingItemIndex].quantity += 1;
                updatedItems[existingItemIndex].updated_at = new Date().toISOString();
            } else {
                // Add new item to cart
                updatedItems.push({
                    name_en: product.name_en,
                    name_hi: product.name_hi,
                    sku: product.sku,
                    price: product.price,
                    category: product.category,
                    category_hi:product.category_hi,
                    subcategory: product.subcategory,
                    subcategory_hi: product.subcategory_hi,
                    image_url: product.image_url,
                    quantity: 1,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                });
            }

            // Calculate total price
            const totalPrice = updatedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

            // Update Firestore cart document
            await updateDoc(cartRef, {
                items: updatedItems,
                customer_id:userId,
                total_price: totalPrice,
                updated_at: new Date().toISOString(),
            });
        } else {
            // Create new cart if it doesn't exist
            updatedItems.push({
                name_en: product.name_en,
                name_hi: product.name_hi,
                sku: product.sku,
                price: product.price,
                category: product.category,
                category_hi:product.category_hi,
                subcategory: product.subcategory,
                subcategory_hi: product.subcategory_hi,
                image_url: product.image_url,
                quantity: 1,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });

            await setDoc(cartRef, {
                customer_id: userId,
                items: updatedItems,
                remainder_sent: false,
                status: "pending",
                total_price: product.price,
                updated_at: new Date().toISOString(),
            });
        }

        // Update local cart state
        setCart(prevCart => ({
            ...prevCart,
            [product.sku]: (prevCart[product.sku] || 0) + 1,
        }));
    } catch (error) {
        console.error("Error adding to cart:", error);
    }
};

/**
 * Increments the quantity of a product in the user's cart.
 * @param {string} productSku - The product SKU.
 * @param {Function} setCart - Function to update the cart state.
 */
export const handleIncrement = async (productSku, setCart) => {
    try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) {
            console.error("User ID not found");
            return;
        }

        const cartRef = doc(db, "carts", userId);
        const cartSnap = await getDoc(cartRef);

        if (cartSnap.exists()) {
            const currentCartData = cartSnap.data();
            const existingItemIndex = currentCartData.items.findIndex(item => item.sku === productSku);

            if (existingItemIndex !== -1) {
                currentCartData.items[existingItemIndex].quantity += 1;
                currentCartData.items[existingItemIndex].updated_at = new Date().toISOString();

                const totalPrice = currentCartData.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

                await updateDoc(cartRef, {
                    items: currentCartData.items,
                    total_price: totalPrice,
                    updated_at: new Date().toISOString(),
                });

                setCart(prevCart => ({
                    ...prevCart,
                    [productSku]: prevCart[productSku] + 1,
                }));
            }
        }
    } catch (error) {
        console.error("Error increasing quantity:", error);
    }
};

/**
 * Decrements the quantity of a product in the user's cart, removing it if quantity reaches 0.
 * @param {string} productSku - The product SKU.
 * @param {Function} setCart - Function to update the cart state.
 */
export const handleDecrement = async (productSku, setCart) => {
    try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) {
            console.error("User ID not found");
            return;
        }

        const cartRef = doc(db, "carts", userId);
        const cartSnap = await getDoc(cartRef);

        if (cartSnap.exists()) {
            const currentCartData = cartSnap.data();
            const existingItemIndex = currentCartData.items.findIndex(item => item.sku === productSku);

            if (existingItemIndex !== -1) {
                currentCartData.items[existingItemIndex].quantity -= 1;
                currentCartData.items[existingItemIndex].updated_at = new Date().toISOString();

                if (currentCartData.items[existingItemIndex].quantity === 0) {
                    // Remove item if quantity reaches 0
                    currentCartData.items.splice(existingItemIndex, 1);
                }

                const totalPrice = currentCartData.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

                await updateDoc(cartRef, {
                    items: currentCartData.items,
                    total_price: totalPrice,
                    updated_at: new Date().toISOString(),
                });

                setCart(prevCart => {
                    const newCart = { ...prevCart };
                    if (newCart[productSku] > 1) {
                        newCart[productSku] -= 1;
                    } else {
                        delete newCart[productSku];
                    }
                    return newCart;
                });
            }
        }
    } catch (error) {
        console.error("Error decreasing quantity:", error);
    }
};
