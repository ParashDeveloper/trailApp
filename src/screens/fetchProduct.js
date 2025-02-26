import { db } from "../config/firebaseConfig"; // Import Firestore instance
import { collection, getDocs } from "firebase/firestore";

const fetchProducts = async () => {
  try {
    const productsCollection = collection(db, "products");
    const productSnapshot = await getDocs(productsCollection);
    const productList = productSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log(productList);
    return productList; // Return the fetched products
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error; // Throw error to handle it in the calling file
  }
};

export const fetchCategories = async () => {
    try {
      const productsCollection = collection(db, "category");
      const productSnapshot = await getDocs(productsCollection);
      const categoriesList = productSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log(categoriesList);
      return categoriesList; // Return the fetched products
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error; // Throw error to handle it in the calling file
    }
  };
export const fetchBanners = async () => {
    try {
      const productsCollection = collection(db, "banners");
      const productSnapshot = await getDocs(productsCollection);
      const bannersList = productSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log( "banners" ,bannersList);
      return bannersList; // Return the fetched products
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error; // Throw error to handle it in the calling file
    }
  };

  export const fetchCartRules = async () => {
    try {
      const productsCollection = collection(db, "cart_rules");
      const productSnapshot = await getDocs(productsCollection);
      const cartrules = productSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log( "cart_rules" ,cartrules);
      return cartrules; // Return the fetched products
    } catch (error) {
      console.error("Error fetching cartrules:", error);
      throw error; // Throw error to handle it in the calling file
    }
  };


export const fetchCart = async () => {
    try {
      const productsCollection = collection(db, "carts");
      const productSnapshot = await getDocs(productsCollection);
      const cart = productSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log(cart);
      return cart; 
    } catch (error) {
      console.error("Error fetching cart:", error);
      throw error; 
    }
  };

  export const fetchDailyOffers = async () => {
    try {
      const productsCollection = collection(db, "daily_offers");
      const productSnapshot = await getDocs(productsCollection);
      const daily_offers = productSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return daily_offers; 
    } catch (error) {
      console.error("Error fetching cart:", error);
      throw error; 
    }
  };




export default fetchProducts;
