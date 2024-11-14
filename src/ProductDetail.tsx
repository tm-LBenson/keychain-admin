// ProductDetail.tsx
import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { db } from "./firestore";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import Modal from "./Modal";
import { Product } from "./ProductsContext";
import ProductOptionsForm from "./ProductOptionsForm";
import useS3Images, { Image } from "./useS3Images";
import ImageUploadModal from "./ImageUploadModal";

const ProductDetail: React.FC = () => {
  const [product, setProduct] = useState<Product>({
    id: "",
    name: "",
    description: "",
    imageUrls: [""],
    unitAmount: { value: "", currencyCode: "USD" },
    onHand: 0,
    options: [],
    showOnStore: false,
  });

  const [editMode, setEditMode] = useState(false);
  const [hasUnsavedOptions, setHasUnsavedOptions] = useState(false);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [refreshFlag, setRefreshFlag] = useState(false);

  // Fetch images using the custom hook
  const images = useS3Images(refreshFlag);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      const docRef = doc(db, "products", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProduct({
          id: docSnap.id,
          name: data.name || "",
          description: data.description || "",
          imageUrls: data.imageUrls || [""],
          unitAmount: data.unitAmount || { value: "", currencyCode: "USD" },
          onHand: data.onHand || 0,
          options: data.options || [],
          showOnStore: data.showOnStore || false,
        });
      } else {
        console.log("No such document!");
      }
    };

    fetchProduct();
  }, [id]);

  const handleInputChange = (
    name: keyof Product,
    value: string | number | boolean,
  ) => {
    if (name === "onHand") {
      setProduct((prev) => ({ ...prev, [name]: parseInt(value as string) }));
    } else if (name === "unitAmount") {
      setProduct((prev) => ({
        ...prev,
        unitAmount: { ...prev.unitAmount, value: value as string },
      }));
    } else {
      setProduct((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUrlChange = (index: number, url: string) => {
    const newImageUrls = [...product.imageUrls];
    newImageUrls[index] = url;
    setProduct((prev) => ({ ...prev, imageUrls: newImageUrls }));
  };

  const addImageUrl = () => {
    setProduct((prev) => ({ ...prev, imageUrls: [...prev.imageUrls, ""] }));
  };

  const removeImageUrl = (index: number) => {
    setProduct((prev) => {
      const newImageUrls = [...prev.imageUrls];
      newImageUrls.splice(index, 1);
      return { ...prev, imageUrls: newImageUrls };
    });
  };

  const deleteProduct = async () => {
    if (!id) return;
    const docRef = doc(db, "products", id);
    await deleteDoc(docRef);
    alert("Product deleted successfully!");
    navigate("/");
  };

  const saveUpdates = async () => {
    if (!id) return;
    const docRef = doc(db, "products", id);

    const updateData = {
      name: product.name,
      description: product.description,
      imageUrls: product.imageUrls,
      unitAmount: product.unitAmount,
      onHand: product.onHand,
      showOnStore: product.showOnStore,
      options: product.options,
    };

    try {
      await updateDoc(docRef, updateData);
      alert("Product updated successfully!");
      setEditMode(false);
      setRefreshFlag((prev) => !prev);
    } catch (error) {
      console.error("Error updating product: ", error);
      alert("Failed to update product.");
    }
  };

  const handleImageUrlAddition = (url: string) => {
    handleUrlChange(activeImageIndex, url);
    setIsUploadModalOpen(false);
    setRefreshFlag((prev) => !prev);
  };

  const [activeImageIndex, setActiveImageIndex] = useState(-1);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const openUploadModal = (index: number) => {
    setActiveImageIndex(index);
    setIsUploadModalOpen(true);
  };

  const handleOptionsChange = (unsaved: boolean) => {
    setHasUnsavedOptions(unsaved);
  };

  return (
    <div className="font-sans p-4 lg:max-w-5xl max-w-lg mx-auto space-y-4">
      <div className="flex justify-start space-x-4 mb-4">
        <Link
          to="/"
          className="inline-flex items-center justify-center bg-pink-400 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:bg-pink-500"
        >
          Back
        </Link>
        <button
          onClick={() => setEditMode(true)}
          className="bg-blue-800 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded-lg"
        >
          Edit
        </button>
        <button
          onClick={deleteProduct}
          className="bg-red-800 hover:bg-red-900 text-white font-bold py-2 px-4 rounded-lg"
        >
          Delete
        </button>
      </div>

      <Modal
        isOpen={editMode}
        onClose={() => {
          if (!hasUnsavedOptions) {
            setEditMode(false);
          } else {
            alert("Please save or discard your changes before closing.");
          }
        }}
      >
        <div className="space-y-4 max-h-[80vh] overflow-y-auto">
          <label className="flex items-center space-x-2">
            <span className="text-gray-700">Show On Store Page</span>
            <input
              type="checkbox"
              checked={product.showOnStore}
              onChange={(e) =>
                handleInputChange("showOnStore", e.target.checked)
              }
              className="ml-2"
            />
          </label>
          <label className="block">
            <span className="text-gray-700">Product Name</span>
            <input
              type="text"
              placeholder="Product Name"
              value={product.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full px-2 py-1 border rounded"
            />
          </label>
          <label className="block">
            <span className="text-gray-700">Description</span>
            <textarea
              placeholder="Description"
              value={product.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full px-2 py-1 border rounded"
              rows={4}
            />
          </label>
          <label className="block">
            <span className="text-gray-700">Price</span>
            <input
              type="text"
              placeholder="Price"
              value={product.unitAmount.value}
              onChange={(e) => handleInputChange("unitAmount", e.target.value)}
              className="w-full px-2 py-1 border rounded"
            />
          </label>
          <label className="block">
            <span className="text-gray-700">On Hand Quantity</span>
            <input
              type="number"
              placeholder="On Hand Quantity"
              value={product.onHand}
              onChange={(e) =>
                handleInputChange("onHand", parseInt(e.target.value))
              }
              className="w-full px-2 py-1 border rounded"
            />
          </label>

          {product.imageUrls.map((url, index) => (
            <div
              key={index}
              className="flex items-center space-x-2"
            >
              <label className="block w-full">
                <span className="text-gray-700">Image URL</span>
                <input
                  type="text"
                  placeholder="Image URL"
                  value={url}
                  onChange={(e) => handleUrlChange(index, e.target.value)}
                  className="w-full px-2 py-1 border rounded"
                />
              </label>
              {/* Dropdown to select existing images */}
              <select
                className="p-2 border rounded"
                value={url}
                onChange={(e) => handleUrlChange(index, e.target.value)}
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
                onClick={() => removeImageUrl(index)}
                className="bg-red-500 text-white px-2 py-1 rounded-lg"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={addImageUrl}
            className="bg-green-500 text-white px-4 py-2 rounded-lg"
          >
            Add Image URL
          </button>

          <ProductOptionsForm
            productId={product.id}
            onUnsavedChanges={handleOptionsChange}
          />

          {!hasUnsavedOptions && (
            <button
              onClick={saveUpdates}
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Save Changes
            </button>
          )}
        </div>
      </Modal>

      <ImageUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onImageUpload={handleImageUrlAddition}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="w-full">
          <img
            src={product.imageUrls[0] || "placeholder.png"}
            alt={product.name}
            className="w-full rounded-md object-cover shadow-lg"
          />
        </div>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p>{product.description}</p>
          <p className="text-xl font-bold">${product.unitAmount.value}</p>
          <p>Stock On Hand: {product.onHand}</p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
