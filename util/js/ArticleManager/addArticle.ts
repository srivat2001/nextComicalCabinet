import getCurrentDateTime from "./Assests/currentTime";
import slugify from "slugify";
import { ref, child, push, update } from "firebase/database";
import { db, auth } from "@tcc/ArticleManager/Database/Auth";
import Response from "@scripts/response";
import validateInputs from "./Assests/validation";
import { update as UpdateArticle } from "@tcc/ArticleManager/Database";
import checkIfArticleExists from "./checkIfArticleExists";
import { uploadImage } from "@tcc/ArticleManager/Database/";
import Article from "../data/article";
import { User } from "firebase/auth";
interface Inputdata {
  date: string;
  time: string;
  title: string;
  desc: string;
  blogid?: string;
  uid: any;
  section: string;
  imglink?: string;
}
interface UserDetails {
  displayName?: string;
  email?: string;
  uid?: string;
}
const addArticle = async (
  title: string,
  desc: string,
  section: string,
  file: File
): Promise<Response<{ Title: string; uploadedArticle: any }>> => {
  return new Promise(async (resolve, reject) => {
    try {
      const user: User = auth.currentUser;
      if (!user) {
        resolve(new Response("Forbidden", 401, "add"));
      }
      const Inputdata: Inputdata = {
        date: getCurrentDateTime().date,
        time: getCurrentDateTime().time,
        title: title,
        desc: desc,
        uid: user.uid,
        section: section,
      };
      const newSlugifiedtitle = slugify(title, { lower: false });
      if (await checkIfArticleExists(newSlugifiedtitle)) {
        return resolve(new Response("Title already Exists", 403, "add"));
      }
      const blogid = push(child(ref(db), "/articles/"))!.key;

      if (blogid) {
        const currentDate = new Date();
        const timestampInSeconds = Math.floor(currentDate.getTime() / 1000);
        const articleMetaData: {
          uid: string;
          time: number;
          blogid: string;
        } = {
          uid: user.uid,
          time: timestampInSeconds,
          blogid: blogid,
        };
        Inputdata.blogid = blogid;
        const searchIndexUpdates: any = {};
        const userDetails: UserDetails = {};
        const uploadedImage = await uploadImage(
          Inputdata.uid,
          Inputdata.blogid,
          file
        );
        Inputdata.imglink = uploadedImage.data?.url;
        if (user.displayName && user.email) {
          userDetails.displayName = user.displayName;
          userDetails.email = user.email;
        }
        userDetails.uid = user.uid;
        searchIndexUpdates[`/userdetails/${userDetails.uid}/`] = userDetails;
        searchIndexUpdates[`/articles/${user.uid}/${Inputdata.blogid}`] =
          Inputdata;
        searchIndexUpdates[
          `/artcleSectionsGroup/${Inputdata.section}/${Inputdata.blogid}`
        ] = articleMetaData;
        searchIndexUpdates[`/searchIndex/${newSlugifiedtitle}`] =
          articleMetaData;
        await update(ref(db), searchIndexUpdates);
        return resolve(
          new Response("Added Successfully", 200, "add", {
            Title: newSlugifiedtitle,
            uploadedArticle: Inputdata,
          })
        );
      }
    } catch (error: any) {
      console.error("Error adding/updating data: ", error.message);
      if (error.code === "PERMISSION_DENIED") {
        reject(["Permission Denied, You Don't have write access"]);
        reject(["Permission Denied, You Don't have write access"]);
      } else {
        reject(["Error adding/updating data"]);
      }
    }
  });
};
export default addArticle;
