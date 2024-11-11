import React, { useState } from "react";
import ImageUploadModal from "./ImageUploadModal"; // Make sure this import path is correct
import { addDoc, collection } from "firebase/firestore";
import { db } from "./firestore";
import { UnitAmount } from "./ProductsContext";
import { ProductOption } from "./ProductOptionsForm";

interface NewProduct {
  name: string;
  description: string;
  imageUrls: string[];
  unitAmount: UnitAmount;
  onHand: number;
  options?: ProductOption[];
  showOnStore: boolean;
}

interface ModalProps {
  onClose: () => void;
}

const NewProductForm: React.FC<ModalProps> = ({ onClose }) => {
  const [newProduct, setNewProduct] = useState<NewProduct>({
    name: "",
    description: "",
    imageUrls: [""],
    unitAmount: { value: "0", currencyCode: "USD" },
    onHand: 0,
    options: [],
    showOnStore: false,
  });
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(-1);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;

    if (name === "unitAmount.value") {
      setNewProduct((prev) => ({
        ...prev,
        unitAmount: { ...prev.unitAmount, value },
      }));
    } else {
      setNewProduct((prev) => ({ ...prev, [name]: value }));
    }
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

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="p-4 space-y-4">
      <label className="block">
        <span className="text-gray-700">Product Name</span>
        <input
          type="text"
          name="name"
          value={newProduct.name}
          onChange={handleInputChange}
          placeholder="Product Name"
          className="block w-full mb-2 p-2 border rounded"
        />
      </label>
      <label className="block">
        <span className="text-gray-700">Description</span>
        <textarea
          name="description"
          value={newProduct.description}
          onChange={handleInputChange}
          placeholder="Description"
          className="block w-full mb-2 p-2 border rounded"
          rows={3}
        />
      </label>
      {newProduct.imageUrls.map((url, index) => (
        <div
          key={index}
          className="flex items-center space-x-2 mb-2"
        >
          <label className="flex-1">
            <span className="text-gray-700">Image URL</span>
            <input
              type="text"
              value={url}
              onChange={(e) => handleImageUrlChange(index, e.target.value)}
              placeholder="Image URL"
              className="block w-full p-2 border rounded"
            />
          </label>
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
      <label className="block">
        <span className="text-gray-700">Price</span>
        <input
          type="text"
          name="unitAmount.value"
          value={newProduct.unitAmount.value || ""}
          onChange={handleInputChange}
          placeholder="Price"
          className="block w-full mb-2 p-2 border rounded"
        />
      </label>
      <label className="block">
        <span className="text-gray-700">Stock On Hand</span>
        <input
          type="number"
          name="onHand"
          value={newProduct.onHand.toString()}
          onChange={handleInputChange}
          placeholder="Stock On Hand"
          className="block w-full mb-2 p-2 border rounded"
        />
      </label>

      <div className="alert alert-warning mt-4 p-4 border rounded bg-yellow-100 text-yellow-800">
        <p>
          Note: This product will need to be set to visible to be seen on the
          store page. This can be done by editing the product after it is
          created.
        </p>
      </div>
      <div className="alert alert-info mt-4 p-4 border rounded bg-blue-100 text-blue-800">
        <p>
          Options such as sizes and colors can be added by editing the product.
        </p>
      </div>

      <div className="flex space-x-4 mt-4">
        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Create Product
        </button>
        <button
          onClick={handleCancel}
          className="bg-red-500 text-white p-2 rounded"
        >
          Cancel
        </button>
      </div>

      <ImageUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onImageUpload={handleImageUrlAddition}
      />
    </div>
  );
};

export default NewProductForm;
