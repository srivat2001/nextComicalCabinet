import {
  getStorage,
  ref as ref1,
  getDownloadURL,
  getBlob,
} from "firebase/storage";
import { storage } from "./Auth/firebaseconn";
interface ImageLinkResponse {
  url: string;
  blob?: Blob;
}

const getImageLink = (
  uid: string,
  blogid: string,
  GetBlob = false
): Promise<ImageLinkResponse> => {
  return new Promise(async (resolve, reject) => {
    try {
      const url = await getDownloadURL(
        ref1(storage, `images/imgid${uid}${blogid}`)
      );
      const response: ImageLinkResponse = { url };

      if (GetBlob) {
        const blob = await getBlob(
          ref1(storage, `images/imgid${uid}${blogid}`)
        );
        response.blob = blob;
      }

      resolve(response);
    } catch (error) {
      reject({ status: 404, message: "Doesn't Exist" });
    }
  });
};

export default getImageLink;
