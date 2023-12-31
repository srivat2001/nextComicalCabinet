import { ref, remove } from "firebase/database";

import { db } from "@tcc/ArticleManager/Database/Auth";
import slugify from "slugify";
const deletedata = (
  id: string,
  uid: string,
  title: string,
  section: string
): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      await remove(ref(db, `/articles/${uid}/${id}`));
      const slugifiedTitle = slugify(title, { lower: false });
      await remove(ref(db, `/searchIndex/${slugifiedTitle}`));
      await remove(ref(db, `/artcleSectionsGroup/${section}/${id}`));
    } catch (error) {
      reject(error);
    }
  });
};

export default deletedata;
