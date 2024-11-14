// NewProductForm.tsx
import React, { useState } from "react";
import ImageUploadModal from "./ImageUploadModal"; // Ensure correct path
import { addDoc, collection } from "firebase/firestore";
import { db } from "./firestore";
import { UnitAmount } from "./ProductsContext";
import useS3Images, { Image } from "./useS3Images"; // Import the custom hook

interface NewProduct {
  name: string;
  description: string;
  imageUrls: string[];
  unitAmount: UnitAmount;
  onHand: number;
}

interface ModalProps {
  onClose: () => void;
}

const NewProductForm: React.FC<ModalProps> = ({ onClose }) => {
  const [newProduct, setNewProduct] = useState<NewProduct>({
    name: "",
    description: "",
    imageUrls: [""],
    unitAmount: { value: "", currencyCode: "USD" },
    onHand: 0,
  });
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(-1); // To track which image URL to update
  const [refreshFlag, setRefreshFlag] = useState(false); // To trigger image refresh

  // Fetch images using the custom hook
  const images = useS3Images(refreshFlag);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: name === "onHand" ? parseInt(value) : value,
    }));
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

  const handleImageUrlAddition = (url: string) => {
    if (activeImageIndex >= 0) {
      handleImageUrlChange(activeImageIndex, url);
    } else {
      handleAddImageUrl();
      setNewProduct((prev) => ({
        ...prev,
        imageUrls: [...prev.imageUrls, url],
      }));
    }
    setIsUploadModalOpen(false);
    setRefreshFlag((prev) => !prev); // Refresh images after upload
  };

  const openUploadModal = (index: number) => {
    setActiveImageIndex(index);
    setIsUploadModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      await addDoc(collection(db, "products"), newProduct);
      console.log("Product added!");
      onClose();
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <input
        type="text"
        name="name"
        value={newProduct.name}
        onChange={handleInputChange}
        placeholder="Product Name"
        className="block w-full mb-2 p-2 border rounded"
      />
      <textarea
        name="description"
        value={newProduct.description}
        onChange={handleInputChange}
        placeholder="Description"
        className="block w-full mb-2 p-2 border rounded"
        rows={3}
      />
      {newProduct.imageUrls.map((url, index) => (
        <div
          key={index}
          className="flex items-center space-x-2 mb-2"
        >
          <input
            type="text"
            value={url}
            onChange={(e) => handleImageUrlChange(index, e.target.value)}
            placeholder="Image URL"
            className="flex-1 p-2 border rounded"
          />
          {/* Dropdown to select existing images */}
          <select
            className="p-2 border rounded"
            value={url}
            onChange={(e) => handleImageUrlChange(index, e.target.value)}
          >
            <option value="">Select Image</option>
            {images.map((img: Image) => (
              <option
                key={img.url}
                value={img.url}
              >
                {img.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => openUploadModal(index)}
            className="p-2 rounded bg-blue-500 text-white"
          >
            Upload Image
          </button>
          <button
            onClick={() => handleRemoveImageUrl(index)}
            className="p-2 rounded bg-red-500 text-white"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        onClick={handleAddImageUrl}
        className="p-2 rounded bg-green-500 text-white"
      >
        Add Image URL
      </button>
      <input
        type="text"
        name="price"
        value={newProduct.unitAmount.value}
        onChange={handleInputChange}
        placeholder="Price"
        className="block w-full mb-2 p-2 border rounded"
      />
      <input
        type="number"
        name="onHand"
        value={newProduct.onHand.toString()}
        onChange={handleInputChange}
        placeholder="Stock On Hand"
        className="block w-full mb-2 p-2 border rounded"
      />
      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white p-2 rounded"
      >
        Add Product
      </button>

      <ImageUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onImageUpload={handleImageUrlAddition}
      />
    </div>
  );
};

export default NewProductForm;
