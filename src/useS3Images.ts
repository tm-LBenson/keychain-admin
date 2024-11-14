// useS3Images.ts
import { useState, useEffect } from "react";
import { ListObjectsCommand } from "@aws-sdk/client-s3";
import { s3Client, bucketName } from "../aws-config";

export interface Image {
  name: string;
  url: string;
}

const useS3Images = (refreshFlag: boolean = false): Image[] => {
  const [images, setImages] = useState<Image[]>([]);

  const fetchImages = async () => {
    try {
      const command = new ListObjectsCommand({ Bucket: bucketName });
      const response = await s3Client.send(command);
      const fetchedImages =
        response.Contents?.map((file) => ({
          name: file.Key!,
          url: `https://${bucketName}.s3.amazonaws.com/${file.Key}`,
        })) || [];
      setImages(fetchedImages);
    } catch (error) {
      console.error("Error fetching images from S3: ", error);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [refreshFlag]);

  return images;
};

export default useS3Images;
