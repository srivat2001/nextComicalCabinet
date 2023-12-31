import { ref, get } from "firebase/database";
import { db } from "@tcc/ArticleManager/Database/Auth";
import Response from "@scripts/response";
const fetchArticleSections = async (): Promise<
  Response<{ SectionList: string[] }>
> => {
  return new Promise(async (resolve, reject) => {
    try {
      const sectionsRef = ref(db, "articleSections");
      const sectionsSnapshot = await get(sectionsRef);

      if (sectionsSnapshot.exists()) {
        const sectionsData = sectionsSnapshot.val();
        const sectionsArray = Object.keys(sectionsData).filter(
          (section) => sectionsData[section] === true
        );
        const resdata = { SectionList: sectionsArray };
        const data = new Response<{ SectionList: string[] }>(
          "Article List",
          201,
          "get",
          resdata
        );
        resolve(data);
      } else {
        reject(new Response("No Article Found", 404));
      }
    } catch (error) {
      console.error("Error fetching article sections:", error);
      reject(new Response("Server Error", 201));
    }
  });
};
export default fetchArticleSections;
