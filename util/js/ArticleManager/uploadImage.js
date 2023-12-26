import {
  getStorage,
  ref as ref1,
  uploadBytes,
  getMetadata,
  deleteObject,
} from "firebase/storage";
import getImageLink from "./getImageLink";
import { storage } from "./Auth/firebaseconn";
const uploadFile = (uid, blogid, file) => {
  return new Promise(async (resolve, reject) => {
    const imgRef = `images/imgid${uid}${blogid}`;
    const storageRef = ref1(storage, imgRef);

    const metadata = {
      contentType: file.type,
      customMetadata: {
        id: imgRef,
      },
    };
    try {
      // Validate if a file is provided
      if (!file) {
        throw new Error("No file provided.");
      }

      //  Check if the file already exists (getMetadata will reject if not found)
      await getMetadata(storageRef);
      await deleteObject(storageRef);
      await uploadBytes(storageRef, file, metadata);
      const data = await getImageLink(uid, blogid, false);

      resolve({ url: data.url });
    } catch (error) {
      await uploadBytes(storageRef, file, metadata);
      const data = await getImageLink(uid, blogid, false);
      resolve({ url: data.url });
    }
  });
};

export default uploadFile;
