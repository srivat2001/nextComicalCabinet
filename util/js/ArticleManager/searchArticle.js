import { ref, get } from "firebase/database";
import { db } from "@tcc/ArticleManager/Database/Auth";
import { user } from "@tcc/ArticleManager/Database";
const searchArticle = (term) => {
  return new Promise(async (resolve, reject) => {
    try {
      const searchIndexRef = ref(db, "searchIndex/" + term);
      const searchIndexSnapshot = await get(searchIndexRef);

      if (searchIndexSnapshot.exists()) {
        const searchResult = searchIndexSnapshot.val();
        const articleRef = ref(
          db,
          `articles/${searchResult.uid}/${searchResult.blogid}`
        );
        const articleSnapshot = await get(articleRef);
        if (articleSnapshot.exists()) {
          const articleData = articleSnapshot.val();
          const userDetails = await user(articleData.uid);
          const concatenatedObject = { ...articleData, ...userDetails };
          resolve(concatenatedObject);
        } else {
          resolve(null); // Article not found
        }
      } else {
        resolve(null); // Search term not found in the search index
      }
    } catch (error) {
      console.error("Error searching article:", error);
      reject("Error searching article");
    }
  });
};

export default searchArticle;
