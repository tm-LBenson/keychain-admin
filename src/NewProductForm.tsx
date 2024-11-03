import React, { useState } from "react";
import { db } from "./firestore";
import { collection, addDoc } from "firebase/firestore";
interface ModalProps {
  onClose: () => void;
}
const NewProductForm: React.FC<ModalProps> = ({ onClose }) => {
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    imageUrls: [""],
    price: "",
    onHand: 0,
  });

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUrlChange = (index: number, url: string) => {
    const newImageUrls = [...newProduct.imageUrls];
    newImageUrls[index] = url;
    setNewProduct((prev) => ({ ...prev, imageUrls: newImageUrls }));
  };

  const handleAddImageUrl = () => {
    setNewProduct((prev) => ({
      ...prev,
      imageUrls: [...prev.imageUrls, ""],
    }));
  };

  const handleRemoveImageUrl = (index: number) => {
    const newImageUrls = [...newProduct.imageUrls];
    newImageUrls.splice(index, 1);
    setNewProduct((prev) => ({ ...prev, imageUrls: newImageUrls }));
  };

  const handleSubmit = async () => {
    try {
      await addDoc(collection(db, "products"), newProduct);
      console.log("Product added!");
      onClose(); // Close the modal after saving
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return (
    <div className="p-4">
      <label className="block mb-1 font-bold">Product Name:</label>
      <input
        type="text"
        name="name"
        value={newProduct.name}
        onChange={handleInputChange}
        placeholder="Product Name"
        className="block w-full mb-4 p-2 border rounded"
      />

      <label className="block mb-1 font-bold">Description:</label>
      <textarea
        name="description"
        value={newProduct.description}
        onChange={handleInputChange}
        placeholder="Description"
        className="block w-full mb-4 p-2 border rounded"
      />

      <label className="block mb-1 font-bold">Image URLs:</label>
      {newProduct.imageUrls.map((url, index) => (
        <div
          key={index}
          className="flex items-center mb-2"
        >
          <input
            type="text"
            value={url}
            onChange={(e) => handleImageUrlChange(index, e.target.value)}
            placeholder="Image URL"
            className="block w-full p-2 border rounded"
          />
          <button
            onClick={() => handleRemoveImageUrl(index)}
            className="ml-2 p-2 rounded bg-red-500 text-white"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        onClick={handleAddImageUrl}
        className="mb-4 p-2 rounded bg-green-500 text-white"
      >
        Add Image URL
      </button>

      <label className="block mb-1 font-bold">Price:</label>
      <input
        type="text"
        name="price"
        value={newProduct.price}
        onChange={handleInputChange}
        placeholder="Price"
        className="block w-full mb-4 p-2 border rounded"
      />

      <label className="block mb-1 font-bold">Stock On Hand:</label>
      <input
        type="number"
        name="onHand"
        value={newProduct.onHand.toString()}
        onChange={handleInputChange}
        placeholder="Stock On Hand"
        className="block w-full mb-4 p-2 border rounded"
      />

      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white p-2 rounded"
      >
        Add Product
      </button>
    </div>
  );
};

export default NewProductForm;
