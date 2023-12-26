import { ref, remove } from "firebase/database";

import { db } from "@tcc/ArticleManager/Database/Auth";
import slugify from "slugify";
const deletedata = (id, uid, title, section) => {
  return new Promise(async (resolve, reject) => {
    try {
      await remove(ref(db, `/articles/${uid}/${id}`));
      const slugifiedTitle = slugify(title, { lower: false });
      await remove(ref(db, `/searchIndex/${slugifiedTitle}`));
      await remove(ref(db, `/artcleSectionsGroup/${section}/${id}`));

      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

export default deletedata;
