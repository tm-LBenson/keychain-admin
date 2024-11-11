import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { db } from "./firestore";
import { collection, getDocs } from "firebase/firestore";

export interface UnitAmount {
  currencyCode: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrls: string[];
  unitAmount: UnitAmount;
  onHand: number;
  originalPrice?: string;
  options?: string[];
  showOnStore: false;
}

interface ProductsContextType {
  products: Product[];
  isImageUrlInUse: (url: string) => boolean;
  getProductsUsingImage: (url: string) => string[];
  isImageInCarousel: (url: string) => Promise<boolean>;
}

const ProductsContext = createContext<ProductsContextType | undefined>(
  undefined,
);
interface ProductsProviderProps {
  children: ReactNode;
}

export const ProductsProvider: React.FC<ProductsProviderProps> = ({
  children,
}) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productsArray: Product[] = querySnapshot.docs.map((doc) => ({
        ...(doc.data() as Product),
        id: doc.id,
      }));
      setProducts(productsArray);
    };

    fetchProducts();
  }, []);

  const isImageUrlInUse = (url: string) => {
    console.log(url);
    return products.some((product) => product.imageUrls.includes(url));
  };

  const getProductsUsingImage = (url: string): string[] => {
    return products
      .filter((product) => product.imageUrls.includes(url))
      .map((product) => product.name);
  };

  const isImageInCarousel = async (url: string): Promise<boolean> => {
    try {
      const querySnapshot = await getDocs(collection(db, "carousel"));
      let isInCarousel = false;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data && Array.isArray(data.urls) && data.urls.includes(url)) {
          isInCarousel = true;
        }
      });
      return isInCarousel;
    } catch (error) {
      console.error("Error checking if image is in carousel: ", error);
      return false;
    }
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        isImageUrlInUse,
        getProductsUsingImage,
        isImageInCarousel,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductsProvider");
  }
  return context;
};
