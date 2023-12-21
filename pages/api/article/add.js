import {
  ref,
  query,
  orderByChild,
  onValue,
  set,
  endAt,
  child,
  push,
  get,
  remove,
  limitToLast,
  endBefore,
  update,
} from "firebase/database";
import { db, app } from "@scripts/firebaseconn";
import {
  getStorage,
  ref as ref1,
  uploadBytes,
  getDownloadURL,
  getMetadata,
  getBlob,
  deleteObject,
} from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getCurrentDateTime } from "@scripts/currentTime";
import Response from "@scripts/response";
import slugify from "slugify";
import validateInputs from "@scripts/validation";
import { CustomError } from "../../../util/errors/CustomError";
import multer from "multer";

const upload = multer({ dest: "uploads/" }); // Set the destination folder for uploaded files

export const config = {
  api: {
    bodyParser: false,
  },
};

const checkIfArticleExists = async (slugifiedtitle) => {
  const sectionsRef = ref(db, `searchIndex/${slugifiedtitle}`);
  const sectionsSnapshot = await get(sectionsRef);
  console.log(sectionsSnapshot.exists());
  if (sectionsSnapshot.exists()) {
    return true;
  }

  return false;
};

function createTimestamp(dateString, timeString) {
  const [day, month, year] = dateString.split("/");
  const [hours, minutes, seconds] = timeString.split(":");
  const timestamp = new Date(
    `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`
  );
  const timestampInSeconds = Math.floor(timestamp.getTime() / 1000);
  return timestampInSeconds;
}
const getImageLink = (uid, blogid, GetBlob = false) => {
  return new Promise(async (resolve, reject) => {
    const storage = getStorage();
    getDownloadURL(ref1(storage, `images/imgid${uid}${blogid}`))
      .then(async (url) => {
        const response = {};
        response.url = url;
        if (GetBlob) {
          response.blob = await getBlob(
            ref1(storage, `images/imgid${uid}${blogid}`)
          );
        }

        return resolve(response);
      })
      .catch(() => {
        return reject({ status: 404, message: "Doenst Exists" });
      });
  });
};

const uploadFile = (uid, blogid, file) => {
  return new Promise(async (resolve, reject) => {
    const storage = getStorage();
    const randomId = Math.random().toString(36).substring(7);
    const storageRef = ref1(storage, `images/imgid${uid}${blogid}`);

    const metadata = {
      contentType: file.type,
      customMetadata: {
        id: randomId,
      },
    };
    try {
      // Validate if a file is provided
      if (!file) {
        throw new Error("No file provided.");
      }

      //  Check if the file already exists (getMetadata will reject if not found)
      await getMetadata(storageRef);
      await deleteObject(storageRef);
      await uploadBytes(storageRef, file, metadata);
      const data = await getImageLink(uid, blogid, false);

      resolve({ url: data.url });
    } catch (error) {
      await uploadBytes(storageRef, file, metadata);
      const data = await getImageLink(uid, blogid, false);
      resolve({ url: data.url });
    }
  });
};

const updateArticle = async (
  oldDetails,
  updatedData,
  newSlugifiedtitle,
  articleMetaDat,
  newfile
) => {
  const updates = {};
  const result = await uploadFile(oldDetails.uid, oldDetails.blogid, newfile);
  console.log(result);
  updatedData.imglink = result.url;

  const timestampinseconds = createTimestamp(oldDetails.date, oldDetails.time);
  const articleMetaData = {
    uid: oldDetails.uid,
    time: timestampinseconds,
    blogid: oldDetails.blogid,
  };
  Object.keys(oldDetails).forEach((pararm) => {
    if (
      oldDetails.hasOwnProperty(pararm) &&
      oldDetails[pararm] != updatedData[pararm]
    ) {
      updates[`/articles/${oldDetails.uid}/${oldDetails.blogid}/${pararm}`] =
        updatedData[pararm];
    }
  });

  const articleSectionRef = ref(
    db,
    `artcleSectionsGroup/${oldDetails.section}/${oldDetails.blogid}`
  );
  if (oldDetails.title !== updatedData.title) {
    console.log("updated");
    if (await checkIfArticleExists(newSlugifiedtitle)) {
      return { status: 401, message: "Title Already exists" };
    }

    await remove(
      ref(db, "searchIndex/" + slugify(oldDetails.title, { lower: false }))
    );
    updates["searchIndex/" + newSlugifiedtitle] = articleMetaData;
  }
  if (oldDetails.section !== updatedData.section) {
    updates[`artcleSectionsGroup/${updatedData.section}/${oldDetails.blogid}`] =
      articleMetaData;
    await remove(articleSectionRef);
  }
  console.log(updates);
  // await update(ref(db), updates);
  return { status: 200, message: "Updated Successfully" };
};
export const Publisharticle1 = async (
  title,
  desc,
  imglink,
  articleID,
  section,
  oldDetails,
  user,
  file
) => {
  return new Promise(async (resolve, reject) => {
    const validationProblems = validateInputs(title, imglink, desc, section);
    if (validationProblems.length !== 0) {
      resolve(new Response(validationProblems.join(" "), 401, "add"));
    }
    try {
      if (!user) {
        resolve(new Response("Forbidden", 401, "add"));
      }
      let blogid = "";
      let Inputdata = {
        date: getCurrentDateTime().date,
        time: getCurrentDateTime().time,
        title: title,
        desc: desc,
        imglink: imglink,
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
        const result = await updateArticle(
          oldDetails,
          Inputdata,
          newSlugifiedtitle,
          articleMetaData,
          file
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
      const uploadedImage = await uploadFile(
        Inputdata.uid,
        Inputdata.blogid,
        file
      );
      Inputdata.imglink = uploadedImage.url;
      console.log(Inputdata.imglink);
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
      } else {
        reject(["Error adding/updating data"]);
      }
    }
  });
};
export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      await new Promise((resolve, reject) => {
        upload.single("file")(req, res, (err) => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });

      const {
        title,
        desc,
        imglink,
        articleID,
        section,
        oldDetailsJSON,
        userJSON,
      } = req.body;
      const user = JSON.parse(userJSON);
      const oldDetails = JSON.parse(oldDetailsJSON);
      const file = req.file;
      console.log(userJSON);
      const result = await Publisharticle1(
        title,
        desc,
        imglink,
        articleID,
        section,
        oldDetails,
        user,
        file
      );

      res.status(200).json({ message: "Request processed successfully" });
    } catch (error) {
      console.error("Error processing request:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
// const result = await Publisharticle1(
//   title,
//   desc,
//   imglink,
//   articleID,
//   section,
//   oldDetails,
//   user,
//   file
// );
