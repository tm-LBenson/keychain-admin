import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { db } from "./firestore";
import { doc, getDoc } from "firebase/firestore";
import { Product } from "./Products";
import { useCart } from "./CartContext";
import AddedToCart from "./AddedToCart";

const ProductDetail: React.FC = () => {
  const [product, setProduct] = useState<Product>({
    id: "",
    name: "",
    description: "",
    imageUrls: [""],
    price: "",
    onHand: 0,
  });
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [showAddedToCart, setShowAddedToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      const docRef = doc(db, "products", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProduct(docSnap.data() as Product);
      } else {
        console.log("No such document!");
      }
    };

    fetchProduct();
  }, [id]);
  const addToCart = () => {
    addItem({ ...product, quantity });
    setShowAddedToCart(true);
    setTimeout(() => {
      setShowAddedToCart(false);
    }, 1400);
  };
  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decreaseQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleInputChange = (e: { target: { value: string } }) => {
    const value = parseInt(e.target.value, 10);
    setQuantity(value >= 1 ? value : 1);
  };

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div className="font-sans">
      <div className="p-4 lg:max-w-5xl max-w-lg mx-auto">
        <Link
          to="/#products"
          className="inline-flex items-center justify-center bg-pink-600 text-white font-bold py-2 px-4 rounded-full shadow-lg hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 transition duration-300 ease-in-out mt-4 mb-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-2 -ml-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11 17l-5-5m0 0l5-5m-5 5h12"
            />
          </svg>
          Back
        </Link>
        <div className="grid items-start grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          <div className="w-full lg:sticky top-0 sm:flex gap-2">
            <img
              src={product.imageUrls[0]}
              alt={product.name}
              className="w-full rounded-md object-cover"
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{product.name}</h2>
            <div className="flex flex-wrap gap-4 mt-4">
              <p className="text-gray-800 text-xl font-bold">
                ${product.price}
              </p>
              {product.originalPrice && (
                <p className="text-gray-400 text-xl">
                  <span className="text-sm ml-1.5">Tax included</span>
                </p>
              )}
            </div>
            <div className="flex items-center text-black space-x-2">
              <button
                onClick={decreaseQuantity}
                className="px-3 py-1 text-xl font-semibold border border-gray-400 rounded"
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={handleInputChange}
                className="w-16 text-center text-xl border rounded"
                min="1"
                style={{
                  MozAppearance: "textfield",
                  WebkitAppearance: "none",
                  appearance: "none",
                }}
              />
              <button
                onClick={increaseQuantity}
                className="px-3 py-1 text-xl border-gray-400 font-semibold border rounded"
              >
                +
              </button>
            </div>
            <button
              onClick={addToCart}
              type="button"
              className="w-full mt-8 px-6 py-3 relative bg-pink-600 hover:bg-pink-700 text-white text-sm font-semibold rounded-md"
            >
              <div className="absolute right-0 bottom-11">
                <AddedToCart
                  message="Added to cart."
                  isVisible={showAddedToCart}
                />
              </div>
              Add to cart
            </button>
            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-800">
                About the item
              </h3>
              <p className="mt-4 text-sm text-gray-800">
                {product.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
