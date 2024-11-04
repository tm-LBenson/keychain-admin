// ImageUploadModal.tsx
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, bucketName } from "../aws-config";

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageUpload: (url: string) => void;
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  isOpen,
  onClose,
  onImageUpload,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [filename, setFilename] = useState("");

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
      setFilename(acceptedFiles[0].name);
    },
  });

  const handleUpload = async () => {
    if (file) {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: filename || file.name,
        Body: file,
      });
      await s3Client.send(command);
      const imageUrl = `https://${bucketName}.s3.amazonaws.com/${filename}`;
      onImageUpload(imageUrl);
      setFile(null);
      setFilename("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-4 rounded">
        <div
          {...getRootProps()}
          className="border-dashed border-4 border-gray-200 p-4 text-center"
        >
          <input {...getInputProps()} />
          <p>Drag 'n' drop some files here, or click to select files</p>
        </div>
        <input
          type="text"
          placeholder="Enter file name"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          className="border p-2 w-full mt-2"
        />
        <button
          onClick={handleUpload}
          className="mt-2 bg-blue-500 text-white p-2 rounded"
        >
          Upload Image
        </button>
        <button
          onClick={onClose}
          className="mt-2 bg-red-500 text-white p-2 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ImageUploadModal;
