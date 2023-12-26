import getCurrentDateTime from "./Assests/currentTime";
import slugify from "slugify";
import { ref, child, push, update } from "firebase/database";
import { db, auth } from "@tcc/ArticleManager/Database/Auth";
import Response from "@scripts/response";
import validateInputs from "./Assests/validation";
import { update as UpdateArticle } from "@tcc/ArticleManager/Database";
import checkIfArticleExists from "./checkIfArticleExists";
import { uploadImage } from "@tcc/ArticleManager/Database/";
const addArticle = async (title, desc, section, oldDetails, file) => {
  return new Promise(async (resolve, reject) => {
    // const validationProblems = validateInputs(title, imglink, desc, section);
    // if (validationProblems.length !== 0) {
    //   resolve(new Response(validationProblems.join(" "), 401, "add"));
    // }
    try {
      const user = auth.currentUser;

      if (!user) {
        resolve(new Response("Forbidden", 401, "add"));
      }
      let blogid = "";
      let Inputdata = {
        date: getCurrentDateTime().date,
        time: getCurrentDateTime().time,
        title: title,
        desc: desc,
        blogid: blogid,
        uid: user.uid,
        section: section,
      };

      const newSlugifiedtitle = slugify(title, { lower: false });

      const currentDate = new Date();
      const timestampInSeconds = Math.floor(currentDate.getTime() / 1000);
      const articleMetaData = {
        uid: user.uid,
        time: timestampInSeconds,
      };
      if (!oldDetails.hasOwnProperty("blogid")) {
        blogid = push(child(ref(db), "/articles/")).key;
        Inputdata.blogid = blogid;
        articleMetaData.blogid = blogid;
      } else {
        Inputdata["blogid"] = oldDetails.blogid;
        articleMetaData.blogid = oldDetails.blogid;
        const result = await UpdateArticle(
          oldDetails,
          Inputdata,
          newSlugifiedtitle,
          articleMetaData,
          file,
          user
        );

        return resolve(
          new Response(result.message, result.status, "update", {
            updateddata: Inputdata,
            updatedtitle: newSlugifiedtitle,
          })
        );
      }
      if (await checkIfArticleExists(newSlugifiedtitle)) {
        return resolve(new Response("Title already Exists", 403, "add"));
      }
      const searchIndexUpdates = {};
      const uploadedImage = await uploadImage(
        Inputdata.uid,
        Inputdata.blogid,
        file
      );
      Inputdata.imglink = uploadedImage.url;
      const userDetails = {};
      userDetails.displayName = user.displayName;
      userDetails.email = user.email;
      userDetails.uid = user.uid;
      searchIndexUpdates[`/userdetails/${userDetails.uid}/`] = userDetails;
      searchIndexUpdates[`/articles/${user.uid}/${Inputdata.blogid}`] =
        Inputdata;
      searchIndexUpdates[
        `/artcleSectionsGroup/${Inputdata.section}/${Inputdata.blogid}`
      ] = articleMetaData;
      searchIndexUpdates[`/searchIndex/${newSlugifiedtitle}`] = articleMetaData;
      console.log(searchIndexUpdates);
      await update(ref(db), searchIndexUpdates);
      return resolve(
        new Response("Added Successfully", 200, "add", {
          title: newSlugifiedtitle,
        })
      );
    } catch (error) {
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
