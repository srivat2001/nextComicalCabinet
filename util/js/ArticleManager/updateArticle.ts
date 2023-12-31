import { ref, remove, update } from "firebase/database";
import { auth, db } from "@tcc/ArticleManager/Database/Auth";
import createTimeStamp from "./Assests/createTimeStamp";
import checkIfArticleExists from "./checkIfArticleExists";
import { uploadImage } from "@tcc/ArticleManager/Database/";
import compressImage from "./Assests/compressImage";
import slugify from "slugify";
import Response from "@scripts/response";
import Article from "../data/article";
import Inputdata from "../data/Inputdata";
const updateArticle = async (
  oldDetails: Article,
  updatedData: Inputdata,
  newfile: File | null
): Promise<
  Response<{ updateddata: Article | Inputdata; updatedtitle: string }>
> => {
  return new Promise(async (resolve, reject) => {
    try {
      const updates: any = {};
      const user = auth.currentUser;
      const ResponseData = { ...oldDetails };
      if (newfile !== undefined) {
        if (newfile) {
          const compressedFile = await compressImage(newfile);
          if (compressedFile) {
            const result = await uploadImage(
              oldDetails.uid,
              oldDetails.blogid,
              compressedFile
            );
            updatedData.imglink = result.data?.url;
          }
        }

        const timestampinseconds = createTimeStamp(
          oldDetails.date,
          oldDetails.time
        );
        const currentDate = new Date();
        const timestampInSeconds = Math.floor(currentDate.getTime() / 1000);
        const articleMetaData: {
          uid: string;
          time: number;
          blogid?: string;
        } = {
          uid: user.uid,
          time: timestampInSeconds,
          blogid: oldDetails.blogid,
        };
        articleMetaData.time = timestampinseconds;
        console.log(oldDetails.section !== updatedData.section);
        for (const param in oldDetails) {
          if (
            oldDetails.hasOwnProperty(param) &&
            updatedData.hasOwnProperty(param) &&
            oldDetails[param as keyof Article] !==
              updatedData[param as keyof Inputdata]
          ) {
            console.log(oldDetails.section == updatedData.section);
            updates[
              `/articles/${oldDetails.uid}/${oldDetails.blogid}/${param}`
            ] = updatedData[param as keyof Inputdata];
            ResponseData[param as keyof Article] = updatedData[
              param as keyof Inputdata
            ] as string;
          }
        }

        const newSlugifiedtitle = slugify(updatedData.title, { lower: false });

        if (oldDetails.title !== updatedData.title) {
          if (await checkIfArticleExists(newSlugifiedtitle)) {
            resolve(new Response("Title Already exists", 401));
            return;
          }

          await remove(
            ref(
              db,
              "searchIndex/" + slugify(oldDetails.title, { lower: false })
            )
          );
          updates["searchIndex/" + newSlugifiedtitle] = articleMetaData;
        }
        console.log(oldDetails.section !== updatedData.section);

        if (oldDetails.section !== updatedData.section) {
          console.log("true");
          const articleSectionRef = ref(
            db,
            `artcleSectionsGroup/${oldDetails.section}/${oldDetails.blogid}`
          );
          updates[
            `artcleSectionsGroup/${updatedData.section}/${oldDetails.blogid}`
          ] = articleMetaData;
          await remove(articleSectionRef);
        }
        console.log(updates);
        await update(ref(db), updates);
        console.log(ResponseData);
        resolve(
          new Response("Updated Successfully", 200, "update", {
            updateddata: ResponseData,
            updatedtitle: newSlugifiedtitle,
          })
        );
      }
    } catch (error) {
      console.error("Error updating article:", error);
      reject(new Response("Error updating article", 500));
    }
  });
};

export default updateArticle;
