import {
  getStorage,
  ref as ref1,
  uploadBytes,
  getMetadata,
  deleteObject,
} from "firebase/storage";
import getImageLink from "./getImageLink";
import { storage } from "./Auth/firebaseconn";
import Response from "@scripts/response";

const uploadFile = (
  uid: string,
  blogid: string,
  file: Blob
): Promise<Response<{ url: string }>> => {
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
      if (!file) {
        throw new Error("No file provided.");
      }

      await getMetadata(storageRef);
      await deleteObject(storageRef);
      await uploadBytes(storageRef, file, metadata);
      const data = await getImageLink(uid, blogid, false);

      resolve(new Response("Image Link", 200, "get", { url: data.url }));
    } catch (error) {
      await uploadBytes(storageRef, file, metadata);
      const data = await getImageLink(uid, blogid, false);
      resolve(new Response("Image Link", 200, "get", { url: data.url }));
    }
  });
};

export default uploadFile;
