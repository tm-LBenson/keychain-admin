// S3ImageManager.tsx
import { useState, useEffect } from "react";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, bucketName } from "../aws-config";
import Modal from "./Modal";
import { useProducts } from "./ProductsContext";
import useS3Images, { Image } from "./useS3Images";

const S3ImageManager = () => {
  const [file, setFile] = useState<File | null>(null);
  const [filename, setFilename] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { getProductsUsingImage, isImageInCarousel } = useProducts();
  const [imageStatus, setImageStatus] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [refreshFlag, setRefreshFlag] = useState(false); // To trigger image refresh

  // Use the custom hook to fetch images
  const images = useS3Images(refreshFlag);

  useEffect(() => {
    const fetchImageUsageStatus = async () => {
      const status: { [key: string]: boolean } = {};

      for (const img of images) {
        const isUsedInProduct = getProductsUsingImage(img.url).length > 0;
        const isUsedInCarousel = await isImageInCarousel(img.url);
        status[img.url] = isUsedInProduct || isUsedInCarousel;
      }

      setImageStatus(status);
    };

    if (images.length > 0) {
      fetchImageUsageStatus();
    }
  }, [images, getProductsUsingImage, isImageInCarousel]);

  const handleUpload = async () => {
    if (file) {
      try {
        const command = new PutObjectCommand({
          Bucket: bucketName,
          Key: filename || file.name,
          Body: file,
        });
        await s3Client.send(command);
        setFile(null);
        setFilename("");
        setIsModalOpen(false);
        setRefreshFlag((prev) => !prev); // Toggle to refresh images
      } catch (error) {
        console.error("Error uploading image to S3: ", error);
      }
    }
  };

  const handleDelete = async (image: Image) => {
    try {
      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: image.name,
      });
      await s3Client.send(command);
      setRefreshFlag((prev) => !prev); // Toggle to refresh images
    } catch (error) {
      console.error("Error deleting image from S3: ", error);
    }
  };

  return (
    <div className="flex flex-col w-[75vw] bg-slate-100 p-5 m-auto items-center justify-center min-h-screen">
      <h2 className="self-start text-5xl font-bold">Image Gallery</h2>
      <p className="p-3 self-start">
        Manage the photos used by your site. Upload photos to be used by your
        products.
      </p>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Upload New Image
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mt-4 p-4">
        {images.map((img, index) => {
          const isUsed = imageStatus[img.url] || false;

          return (
            <div
              key={index}
              className="rounded shadow-lg relative"
            >
              <img
                className="max-h-[300px] object-cover"
                src={img.url}
                alt={img.name}
              />
              <div className="bottom-0 left-0 bg-gray-900 bg-opacity-75 text-white w-full text-center py-2">
                {img.name}
              </div>
              <div className="p-4 flex justify-between items-center">
                <button
                  onClick={() => handleDelete(img)}
                  disabled={isUsed}
                  className={`bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ${
                    isUsed ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Delete
                </button>
                {isUsed && (
                  <span className="text-sm text-black">
                    Image in use on product or carousel
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <div className="p-5 space-y-4">
          <div className="p-4 border-dashed border-2 border-gray-300 rounded-md cursor-pointer">
            <input
              type="file"
              onChange={(e) =>
                setFile(e.target.files ? e.target.files[0] : null)
              }
              className="w-full"
            />
          </div>
          <input
            type="text"
            placeholder="Enter file name"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            className="border p-2 w-full"
          />
          <button
            onClick={handleUpload}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Upload
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default S3ImageManager;
