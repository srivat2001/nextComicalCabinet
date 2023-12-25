import { ref, get } from "firebase/database";

import { db } from "@tcc/ArticleManager/Database/Auth";
const fetchArticleSections = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const sectionsRef = ref(db, "articleSections");
      const sectionsSnapshot = await get(sectionsRef);

      if (sectionsSnapshot.exists()) {
        const sectionsData = sectionsSnapshot.val();
        const sectionsArray = Object.keys(sectionsData).filter(
          (section) => sectionsData[section] === true
        );
        resolve(sectionsArray);
      } else {
        resolve([]); // No sections found
      }
    } catch (error) {
      console.error("Error fetching article sections:", error);
      reject("Error fetching article sections");
    }
  });
};
export default fetchArticleSections;
