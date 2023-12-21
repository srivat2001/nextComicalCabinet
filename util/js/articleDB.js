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
import { db, app } from "./firebaseconn";
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
import { getCurrentDateTime } from "./currentTime";
import Response from "./response";
import slugify from "slugify";
import validateInputs from "./validation";
import { CustomError } from "../errors/CustomError";
import { resolve } from "styled-jsx/css";
export const searcharticle = async (term) => {
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

          resolve(articleData);
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

export const deletedata = (id, uid, title, section) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Delete from articles
      await remove(ref(db, `/articles/${uid}/${id}`));

      // Create slugified title for searchIndex deletion
      const slugifiedTitle = slugify(title, { lower: false });

      // Delete from searchIndex
      await remove(ref(db, `/searchIndex/${slugifiedTitle}`));

      // Delete from articleSectionsGroup
      await remove(ref(db, `/artcleSectionsGroup/${section}/${id}`));

      resolve();
    } catch (error) {
      reject(error);
    }
  });
};
export const getArticleByScroll = async (prevArr, first, lastTime, reftype) => {
  return new Promise(async (resolve, reject) => {
    let articles = prevArr;
    let lowestTimestampKey = null;
    setTimeout(
      () => reject(new CustomError("ITs taking too long to load", 401)),
      5000
    );

    try {
      if (first) {
        const searchIndexRef = query(
          ref(db, reftype),
          orderByChild("time"),
          limitToLast(1) // Limit to the last 1
        );

        const searchIndexSnapshot = await get(searchIndexRef);

        if (!searchIndexSnapshot.exists()) {
          // Handle the case when no data is available
          reject({ error: "No Articles Found", statusCode: 404 });
          return;
        }
        const latestSearchIndexItem = Object.values(
          searchIndexSnapshot.val()
        )[0];
        lastTime = latestSearchIndexItem.time;
      }
      console.log(lastTime);
      if (lastTime !== 0) {
        let searchIndexRef = "";
        if (first === true) {
          searchIndexRef = query(
            ref(db, reftype),
            orderByChild("time"),
            endAt(lastTime),
            limitToLast(3)
          );
        } else {
          searchIndexRef = query(
            ref(db, reftype),
            orderByChild("time"),
            endBefore(lastTime),
            limitToLast(3)
          );
        }

        const searchIndexSnapshot = await get(searchIndexRef);

        if (searchIndexSnapshot.exists()) {
          const searchIndexData = searchIndexSnapshot.val();
          const lastKeys = Object.keys(searchIndexData);
          console.log(searchIndexData, lastKeys);
          for (const key of lastKeys) {
            const articleRef = ref(
              db,
              `articles/${searchIndexData[key].uid}/${searchIndexData[key].blogid}`
            );
            const articleSnapshot = await get(articleRef);

            if (articleSnapshot.exists()) {
              const articleData = articleSnapshot.val();
              articles.push(articleData);
            }

            // Track the lowest timestamp key
            if (
              !lowestTimestampKey ||
              searchIndexData[key].time < lowestTimestampKey.time
            ) {
              lowestTimestampKey = searchIndexData[key];
            }
          }
        }
      }
      articles = articles.reverse();

      if (articles.length === 0) {
        reject({ error: "No More Articles", statusCode: 404 });
      }
      resolve({ articles, lowestTimestampKey });
    } catch (error) {
      console.error("Error fetching articles by scroll:", error);
      reject("Error fetching articles by scroll");
      reject({ error: "Server Error", statusCode: 201 });
    }
  });
};

export const fetchArticleSections = async () => {
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
export const getImageLink = (uid, blogid, GetBlob = false) => {
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
  await update(ref(db), updates);
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
      const auth = getAuth(app);
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

export const LoggedInInfo = async (user) => {
  return new Promise((resolve, reject) => {
    const timeoutDuration = 5000; // Adjust the timeout duration as needed (in milliseconds)

    const timeoutId = setTimeout(() => {
      reject(new CustomError("Timeout: Auh state change took too long.", 401));
    }, timeoutDuration);
    const handleQueryResult = (snapshot) => {
      clearTimeout(timeoutId); // Clear the timeout since the operation completed successfully
      const isAdmin = snapshot.exists();
      resolve({
        isLoggedIn: true,
        isAdmin: isAdmin,
      });
    };
    const handleError = (error) => {
      clearTimeout(timeoutId);
      reject(error);
    };
    if (user) {
      const query = ref(db, "/admins/" + user.uid);
      onValue(query, handleQueryResult, handleError);
    } else {
      clearTimeout(timeoutId);
      resolve({
        isLoggedIn: false,
        isAdmin: false,
      });
    }
  });
};
