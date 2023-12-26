import {
  getStorage,
  ref as ref1,
  getDownloadURL,
  getBlob,
} from "firebase/storage";
import { storage } from "./Auth/firebaseconn";
const getImageLink = (uid, blogid, GetBlob = false) => {
  return new Promise(async (resolve, reject) => {
    getDownloadURL(ref1(storage, `images/imgid${uid}${blogid}`))
      .then(async (url) => {
        const response = {};
        response.url = url;
        if (GetBlob) {
          response.blob = await getBlob(
            ref1(storage, `images/imgid${uid}${blogid}`)
          );
        }

        return resolve(response);
      })
      .catch(() => {
        return reject({ status: 404, message: "Doenst Exists" });
      });
  });
};
export default getImageLink;
