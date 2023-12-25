import { ref, get } from "firebase/database";
import { db } from "@tcc/ArticleManager/Database/Auth";

const checkIfArticleExists = async (slugifiedtitle) => {
  const sectionsRef = ref(db, `searchIndex/${slugifiedtitle}`);
  const sectionsSnapshot = await get(sectionsRef);
  console.log(sectionsSnapshot.exists());
  if (sectionsSnapshot.exists()) {
    return true;
  }

  return false;
};
export default checkIfArticleExists;
