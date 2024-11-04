import React, { useState } from "react";
import { useProducts } from "./ProductsContext";

import { Link } from "react-router-dom";
import NewProductForm from "./NewProductForm";
import Modal from "./Modal";
export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrls: [""];
  price: string;
  onHand: number;
  originalPrice?: string;
}

const ProductList: React.FC = () => {
  const { products } = useProducts();
  const [showForm, setShowForm] = useState(false);
  const toggleForm = () => setShowForm(!showForm);

  if (!products.length) {
    return <p>Loading...</p>;
  }

  return (
    <div className="font-[sans-serif] py-4 mx-auto lg:max-w-6xl max-w-lg md:max-w-full">
      <button
        onClick={toggleForm}
        className="bg-green-500 flex gap-3 items-center my-3 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full shadow-lg transition-colors duration-300 ease-in-out"
      >
        Add New Product
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={30}
          height={30}
          viewBox="0 0 48 48"
        >
          <g
            fill="none"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth={4}
          >
            <rect
              width={36}
              height={36}
              x={6}
              y={6}
              rx={3}
            ></rect>
            <path
              strokeLinecap="round"
              d="M24 16v16m-8-8h16"
            ></path>
          </g>
        </svg>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Modal
          isOpen={showForm}
          onClose={toggleForm}
        >
          <NewProductForm onClose={() => setShowForm(false)} />
        </Modal>
        {products.map((product) => (
          <div
            key={product.id}
            className="relative bg-pink-200 rounded-2xl shadow-lg"
          >
            <Link
              to={`/product/${product.id}`}
              className="bg-gray-200 rounded-xl cursor-pointer hover:scale-[1.03] transition-all relative overflow-hidden"
            >
              <div className="p-6">
                <div className="w-2/3 h-[220px] overflow-hidden mx-auto aspect-w-16 aspect-h-8">
                  <img
                    src={product.imageUrls[0]}
                    alt={product.name}
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>
              <div className="text-center p-6">
                <h3 className="text-lg font-bold text-gray-800">
                  {product.name}
                </h3>
                <h4 className="text-lg text-gray-800 font-bold mt-6">
                  ${product.price} ${product.originalPrice}
                </h4>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
