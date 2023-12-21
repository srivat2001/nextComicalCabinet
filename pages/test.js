import { useState } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../util/js/firebaseconn";
const FileUploader = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (file) {
      const storage = getStorage();
      const storageRef = ref(storage, `images/${file.name}`);

      // Generate a random ID for metadata
      const randomId = Math.random().toString(36).substring(7);

      // Set file metadata
      const metadata = {
        contentType: file.type,
        customMetadata: {
          id: randomId,
        },
      };

      try {
        // Upload the file and metadata
        await uploadBytes(storageRef, file, metadata);

        // Get the download URL
        const downloadURL = await getDownloadURL(storageRef);

        console.log("File uploaded successfully!");
        console.log("Download URL:", downloadURL);
      } catch (error) {
        console.error("Error uploading file:", error.message);
      }
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload File</button>
    </div>
  );
};

export default FileUploader;
