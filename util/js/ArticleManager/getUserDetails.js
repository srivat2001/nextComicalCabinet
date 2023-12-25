import { ref, get } from "firebase/database";
import { db } from "@tcc/ArticleManager/Database/Auth";

const getUserDetails = (uid) => {
  return new Promise(async (resolve, reject) => {
    try {
      const userIndexRef = ref(db, "userdetails/" + uid);
      const userIndexRefSnap = await get(userIndexRef);
      if (userIndexRefSnap.exists()) {
        resolve(userIndexRefSnap.val());
      } else {
        reject("No User Found");
      }
    } catch (error) {
      console.error("Error searching article:", error);
      reject("Error searching article");
    }
  });
};
export default getUserDetails;
