import {
  getStorage,
  ref as ref1,
  uploadBytes,
  getMetadata,
  deleteObject,
} from "firebase/storage";
import getImageLink from "./getImageLink";
const uploadFile = (uid, blogid, file) => {
  return new Promise(async (resolve, reject) => {
    const storage = getStorage();
    const randomId = Math.random().toString(36).substring(7);
    const storageRef = ref1(storage, `images/imgid${uid}${blogid}`);

    const metadata = {
      contentType: file.type,
      customMetadata: {
        id: randomId,
      },
    };
    try {
      // Validate if a file is provided
      if (!file) {
        return reject(new Error("No file provided."));
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
