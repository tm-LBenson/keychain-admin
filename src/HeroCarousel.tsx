import { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { db } from "./firestore";
import { getDoc, doc } from "firebase/firestore";

const HeroCarousel = () => {
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchCarouselImages = async () => {
      try {
        const docRef = doc(db, "carousel", "default");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data && Array.isArray(data.urls)) {
            setImages(data.urls);
          }
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching carousel images: ", error);
      }
    };

    fetchCarouselImages();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 8000,
    cssEase: "linear",
    pauseOnHover: true,
  };

  return (
    <div className="carousel-container">
      <Slider {...settings}>
        {images.length > 0 ? (
          images.map((src, index) => (
            <div key={index}>
              <img
                src={src}
                alt={`Slide ${index}`}
                style={{ width: "100%", height: "50vh", objectFit: "cover" }}
              />
            </div>
          ))
        ) : (
          <div className="text-center p-10">
            <p>
              No carousel images available. Please add some in the admin panel.
            </p>
          </div>
        )}
      </Slider>
    </div>
  );
};

export default HeroCarousel;
