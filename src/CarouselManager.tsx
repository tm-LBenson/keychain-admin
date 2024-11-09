import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  ListObjectsCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { s3Client, bucketName } from "../aws-config";
import Modal from "./Modal";
import { useProducts } from "./ProductsContext";
import HeroCarousel from "./HeroCarousel";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { db } from "./firestore";

interface Image {
  name: string;
  url: string;
}

const CarouselManager = () => {
  const [carouselImages, setCarouselImages] = useState<string[]>([]);
  const [images, setImages] = useState<Image[]>([]);
  const [isAddImageModalOpen, setIsAddImageModalOpen] = useState(false);
  const { isImageInCarousel } = useProducts();

  useEffect(() => {
    fetchImages();
    fetchCarouselImages();
  }, []);

  const fetchImages = async () => {
    const command = new ListObjectsCommand({ Bucket: bucketName });
    const response = await s3Client.send(command);
    const fetchedImages =
      response.Contents?.map((file) => ({
        name: file.Key!,
        url: `https://${bucketName}.s3.amazonaws.com/${file.Key}`,
      })) || [];
    setImages(fetchedImages);
  };

  const fetchCarouselImages = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "carousel"));
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data && Array.isArray(data.urls)) {
          setCarouselImages(data.urls);
        }
      });
    } catch (error) {
      console.error("Error fetching carousel images: ", error);
    }
  };

  const toggleCarouselImage = async (imageUrl: string) => {
    const updatedCarouselImages = carouselImages.includes(imageUrl)
      ? carouselImages.filter((url) => url !== imageUrl)
      : [...carouselImages, imageUrl];

    try {
      await setDoc(doc(db, "carousel", "default"), {
        urls: updatedCarouselImages,
      });
      setCarouselImages(updatedCarouselImages);
    } catch (error) {
      console.error("Error updating carousel images: ", error);
    }
  };

  return (
    <div className="flex flex-col w-[75vw] bg-slate-100 p-5 m-auto items-center justify-center min-h-screen">
      <h2 className="self-start text-5xl font-bold">Carousel Manager</h2>
      <p className="p-3 self-start">
        Select images to include in the HeroCarousel on the production site.
      </p>

      <div className="w-full mb-10">
        <h3 className="text-3xl mb-4">HeroCarousel Preview</h3>
        <HeroCarousel />
      </div>

      <button
        onClick={() => setIsAddImageModalOpen(true)}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Add Image to Carousel
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mt-4 p-4">
        {images.map((img, index) => {
          const [isInCarousel, setIsInCarousel] = useState<boolean>(false);

          useEffect(() => {
            const checkCarousel = async () => {
              const result = await isImageInCarousel(img.url);
              setIsInCarousel(result);
            };
            checkCarousel();
          }, [img.url, isImageInCarousel]);

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
              <div className="p-4 flex flex-col items-start">
                <button
                  onClick={() => toggleCarouselImage(img.url)}
                  className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2 ${
                    isInCarousel ? "bg-green-500" : ""
                  }`}
                >
                  {isInCarousel ? "Remove from Carousel" : "Add to Carousel"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Image to Carousel Modal */}
      <Modal
        isOpen={isAddImageModalOpen}
        onClose={() => setIsAddImageModalOpen(false)}
      >
        <div className="p-5 space-y-4">
          <h3 className="text-2xl font-bold">Add Image to Carousel</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mt-4">
            {images.map((img, index) => (
              <div
                key={index}
                className="rounded shadow-lg relative"
              >
                <img
                  className="max-h-[150px] object-cover"
                  src={img.url}
                  alt={img.name}
                />
                <div className="bottom-0 left-0 bg-gray-900 bg-opacity-75 text-white w-full text-center py-1">
                  {img.name}
                </div>
                <button
                  onClick={() => toggleCarouselImage(img.url)}
                  className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2 ${
                    carouselImages.includes(img.url) ? "bg-green-500" : ""
                  }`}
                >
                  {carouselImages.includes(img.url)
                    ? "Remove from Carousel"
                    : "Add to Carousel"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};

const S3ImageManager = () => {
  const [images, setImages] = useState<Image[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [filename, setFilename] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<Image | null>(null);

  const { getProductsUsingImage, isImageInCarousel } = useProducts();

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    const command = new ListObjectsCommand({ Bucket: bucketName });
    const response = await s3Client.send(command);
    const fetchedImages =
      response.Contents?.map((file) => ({
        name: file.Key!,
        url: `https://${bucketName}.s3.amazonaws.com/${file.Key}`,
      })) || [];
    setImages(fetchedImages);
  };

  const handleUpload = async () => {
    if (file) {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: filename || file.name,
        Body: file,
      });
      await s3Client.send(command);
      fetchImages();
      setFile(null);
      setFilename("");
      setIsModalOpen(false);
    }
  };

  const promptDeleteImage = (image: Image) => {
    setImageToDelete(image);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteImage = async () => {
    if (imageToDelete) {
      const isInProducts = getProductsUsingImage(imageToDelete.url).length > 0;
      const isInCarousel = await isImageInCarousel(imageToDelete.url);

      if (!isInProducts && !isInCarousel) {
        const command = new DeleteObjectCommand({
          Bucket: bucketName,
          Key: imageToDelete.name,
        });
        await s3Client.send(command);
        fetchImages();
        setImageToDelete(null);
      }
    }
    setIsDeleteModalOpen(false);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
      setFilename(acceptedFiles[0].name);
    },
  });

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
          const usingProducts = getProductsUsingImage(img.url);
          const [isInCarousel, setIsInCarousel] = useState<boolean>(false);

          useEffect(() => {
            const checkCarousel = async () => {
              const result = await isImageInCarousel(img.url);
              setIsInCarousel(result);
            };
            checkCarousel();
          }, [img.url, isImageInCarousel]);

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
              <div className="p-4 flex flex-col items-start">
                <button
                  onClick={() => promptDeleteImage(img)}
                  className={`bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mb-2 ${
                    usingProducts.length > 0 || isInCarousel
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={usingProducts.length > 0 || isInCarousel}
                >
                  Delete
                </button>
                {usingProducts.length > 0 && (
                  <span className="text-sm text-black">
                    Image in use on product: {usingProducts.join(", ")}
                  </span>
                )}
                {isInCarousel && (
                  <span className="text-sm text-black">
                    Image is used in the carousel
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
          <div
            {...getRootProps()}
            className={`p-4 border-dashed border-2 ${
              isDragActive ? "border-blue-500" : "border-gray-300"
            } rounded-md cursor-pointer`}
          >
            <input {...getInputProps()} />
            <p>
              {isDragActive
                ? "Drop the files here ..."
                : "Drag 'n' drop an image here, or click to select an image"}
            </p>
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

      {/* Confirmation Modal for Deleting an Image */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <div className="p-5">
          <h3>Confirm Deletion</h3>
          <p>
            Are you sure you want to delete this image: {imageToDelete?.name}?
          </p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteImage}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export { CarouselManager, S3ImageManager };
