import { ref, get } from "firebase/database";
import { db } from "@tcc/ArticleManager/Database/Auth";

const checkIfArticleExists = async (
  slugifiedtitle: string
): Promise<boolean> => {
  const sectionsRef = ref(db, `searchIndex/${slugifiedtitle}`);
  const sectionsSnapshot = await get(sectionsRef);
  return sectionsSnapshot.exists();
};
export default checkIfArticleExists;
