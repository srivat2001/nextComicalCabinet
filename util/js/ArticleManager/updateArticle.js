import { ref, update, remove } from "firebase/database";
import { db } from "@tcc/ArticleManager/Database/Auth";
import createTimeStamp from "./Assests/createTimeStamp";
import checkIfArticleExists from "./checkIfArticleExists";
import Response from "@scripts/response";
import uploadAndCompressImage from "./Assests/compressImage";
import { uploadImage } from "@tcc/ArticleManager/Database/";
import compressImage from "./Assests/compressImage";
const updateArticle = async (
  oldDetails,
  updatedData,
  newSlugifiedtitle,
  articleMetaData,
  newfile,
  user
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const updates = {};
      console.log(newfile);
      if (newfile !== undefined) {
        let toBeUploaded = newfile;
        if (newfile) {
          toBeUploaded = await compressImage(newfile);
        }
        console.log(toBeUploaded);
        const result = await uploadImage(
          oldDetails.uid,
          oldDetails.blogid,
          toBeUploaded
        );
        updatedData.imglink = result.url;
      }
      const timestampinseconds = createTimeStamp(
        oldDetails.date,
        oldDetails.time
      );
      articleMetaData.time = timestampinseconds;

      console.log(user);
      Object.keys(oldDetails).forEach((param) => {
        if (
          oldDetails.hasOwnProperty(param) &&
          updatedData.hasOwnProperty(param) &&
          oldDetails[param] !== updatedData[param]
        ) {
          updates[`/articles/${oldDetails.uid}/${oldDetails.blogid}/${param}`] =
            updatedData[param];
        }
      });

      const articleSectionRef = ref(
        db,
        `artcleSectionsGroup/${oldDetails.section}/${oldDetails.blogid}`
      );

      if (oldDetails.title !== updatedData.title) {
        if (await checkIfArticleExists(newSlugifiedtitle)) {
          resolve(new Response("Title Already exists", 401));
          return;
        }

        await remove(
          ref(db, "searchIndex/" + slugify(oldDetails.title, { lower: false }))
        );
        updates["searchIndex/" + newSlugifiedtitle] = articleMetaData;
      }

      if (oldDetails.section !== updatedData.section) {
        updates[
          `artcleSectionsGroup/${updatedData.section}/${oldDetails.blogid}`
        ] = articleMetaData;
        await remove(articleSectionRef);
      }
      console.log(updates);
      await update(ref(db), updates);
      resolve(new Response("Updated Successfully"));
    } catch (error) {
      console.error("Error updating article:", error);
      reject(new Response("Error updating article", 500));
    }
  });
};

export default updateArticle;
