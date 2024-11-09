import { useState, useEffect } from "react";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { ListObjectsCommand } from "@aws-sdk/client-s3";
import { s3Client, bucketName } from "../aws-config";
import HeroCarousel from "./HeroCarousel";
import Modal from "./Modal";
import { db } from "./firestore";

interface Image {
  name: string;
  url: string;
}

const CarouselManager = () => {
  const [carouselImages, setCarouselImages] = useState<string[]>([]);
  const [images, setImages] = useState<Image[]>([]);
  const [isAddImageModalOpen, setIsAddImageModalOpen] = useState(false);

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
        {images.map((img, index) => (
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
                  carouselImages.includes(img.url) ? "bg-green-500" : ""
                }`}
              >
                {carouselImages.includes(img.url)
                  ? "Remove from Carousel"
                  : "Add to Carousel"}
              </button>
            </div>
          </div>
        ))}
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

export default CarouselManager;
