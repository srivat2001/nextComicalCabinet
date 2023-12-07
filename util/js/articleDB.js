import {
  ref,
  query,
  orderByChild,
  equalTo,
  orderByKey,
  onValue,
  set,
  startAt,
  endAt,
  child,
  push,
  get,
  remove,
  limitToFirst,
  limitToLast,
  startAfter,
  endBefore,
  update,
} from "firebase/database";
import { auth, db } from "./firebaseconn";
import { getCurrentDateTime } from "./currentTime";
import { getAuth } from "firebase/auth";
import slugify from "slugify";
import { app } from "./firebaseconn";
import validateInputs from "./validation";
import { CustomError } from "../errors/CustomError";
export const searcharticle = async (term) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(term);
      const slugifiedTitle = slugify(
        "Unveiling the Myth: Photography, the Comedy in Every Snapshot",
        { lower: false }
      );
      console.log(slugifiedTitle);
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
// export const getArticleByScroll = async (prevArr,first = true,lastTime=0) => {
//   const articles = [];

//   try {
//     if (first) {
//       const searchIndexRef = query(
//         ref(db, "searchIndex"),
//         orderByChild("time"),

//         limitToLast(1) // End at the specified key
//       );
//       const searchIndexSnapshot = await get(searchIndexRef);
//       const lastey = searchIndexSnapshot.val();
//       const latestSearchIndexItem = Object.values(searchIndexSnapshot.val())[0];
//       lastTime = latestSearchIndexItem.time;
//       }
//       if (lastTime>0) {
//         const searchIndexRef = query(
//           ref(db, "searchIndex"),
//           orderByChild("time"),
//           endAt(lastTime),
//           limitToLast(3) // End at the specified key
//         );
//         const searchIndexSnapshot = await get(searchIndexRef);
//         const lastKey = searchIndexSnapshot.val();
//         console.log(lastKey);
//       }

//     // const searchIndexRef = query(
//     //   ref(db, "searchIndex"),
//     //   orderByChild("time"),
//     //   startAt(1700890197), // Order by keys
//     //   limitToFirst(5) // End at the specified key
//     // );

//     return articles;
//   } catch (error) {
//     console.error("Error fetching articles by scroll:", error);
//     throw new Error("Error fetching articles by scroll");
//   }
// };
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

          for (const key of lastKeys) {
            // Fetch article using the key
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

export const getArticles = async () => {
  return new Promise(async (resolve, reject) => {
    const articlesList = [];

    try {
      const usersRef = ref(db, "/articles/");
      const usersSnapshot = await get(usersRef);
      if (usersSnapshot.exists()) {
        const userIDs = Object.keys(usersSnapshot.val());
        for (const userId of userIDs) {
          const userArticlesRef = ref(db, `/articles/${userId}`);
          const snapshot = await get(userArticlesRef);
          if (snapshot.exists()) {
            const userArticles = snapshot.val();
            for (const articleKey in userArticles) {
              const articleData = userArticles[articleKey];

              articlesList.push(articleData);
            }
          }
        }
      }

      resolve(articlesList);
    } catch (error) {
      console.error("Error retrieving articles:", error);
      reject("Problem With Backend Connection");
    }
  });
};

// export const getArticles = async () => {
//   return new Promise(async (resolve, reject) => {
//     const articles = [];
//     const usersRef = ref(db, "/articles/");
//     const usersSnapshot = await get(usersRef);
//     console.log(usersSnapshot.val());
//     try {
//       const query = ref(db, "/articles/j9kOTr52eiSwBsq0hnhgMVv8jIG2/");
//       onValue(
//         query,
//         (snapshot) => {
//           const articlebase = snapshot.val();

//           for (const key in articlebase) {
//             articles.push(articlebase[key]);
//           }
//           const articlesList = articles.map((article) => {
//             return new Article(
//               article.title,
//               article.imglink,
//               article.desc,

//               article.date,
//               article.key
//             );
//           });
//           resolve(articlesList);
//         },
//         (error) => {
//           console.log(error);
//         }
//       );
//     } catch (error) {
//       console.error("Error retrieving articles:", error);
//       reject("Problem With Backend Connection");
//     }
//   });
// };

export const Publisharticle1 = async (
  title,
  desc,
  imglink,
  articleID,
  section,
  olddetails,
  user
) => {
  const validationProblems = validateInputs(title, imglink, desc, section);
  if (validationProblems.length !== 0) {
    return validationProblems;
  }
  let key = articleID;

  try {
    if (key.length === 0) {
      key = push(child(ref(db), "/articles/")).key;
    }
    const auth = getAuth(app);
    const user = auth.currentUser;

    if (user) {
      await set(ref(db, "articles/" + user.uid + "/" + key), {
        date: getCurrentDateTime().date,
        time: getCurrentDateTime().time,
        title: title,
        desc: desc,
        imglink: imglink,
        key: key,
        uid: user.uid,
        section: section,
      });

      const currentDate = new Date();
      const timestampInSeconds = Math.floor(currentDate.getTime() / 1000);
      let searchIndexData = {
        uid: user.uid,
        blogid: key,
        time: timestampInSeconds,
      };

      if (olddetails.length > 0 && olddetails.title !== title) {
        console.log("title changed");
        olddetails.title = slugify(olddetails.title, { lower: false });
        const oldTitleRef = ref(db, "searchIndex/" + olddetails.title);
        const oldTitleSnapshot = await get(oldTitleRef);
        if (oldTitleSnapshot.exists()) {
          searchIndexData = oldTitleSnapshot.val();
          await set(oldTitleRef, null);
        }
      }
      const updates = {};
      title = slugify(title, { lower: false });
      updates["/searchIndex/" + title] = searchIndexData;
      updates["artcleSectionsGroup/" + section + "/" + key] = {
        uid: user.uid,
        blogid: key,
      };
      const userdetailsref = ref(db, "userdetails/" + user.uid);
      const userdetailssnapshot = await get(userdetailsref);
      if (!userdetailssnapshot.exists()) {
        updates["/userdetails/" + user.uid] = searchIndexData;
      }

      update(ref(db), updates);
      return ["Added Successfully"];
    } else {
      throw new Error("User not authenticated");
    }
  } catch (error) {
    console.error("Error adding data: ", error.message);
    if (error.code === "PERMISSION_DENIED") {
      return ["Permission Denied, You Dont have write access"];
    } else {
      return ["Error adding data"];
    }
  }
};
export const getArticlesBySection = async (sectionTerm) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Reference to the "artcleSectionsGroup" node for the specified sectionTerm
      const sectionGroupRef = ref(db, `artcleSectionsGroup/${sectionTerm}`);
      const sectionGroupSnapshot = await get(sectionGroupRef);

      if (sectionGroupSnapshot.exists()) {
        const storiesData = sectionGroupSnapshot.val();
        const storyIds = Object.keys(storiesData);

        // Retrieve articles for each story id
        const articlesArray = await Promise.all(
          storyIds.map(async (storyId) => {
            const { uid, blogid } = storiesData[storyId];

            // Reference to the article in the "articles" node
            const articleRef = ref(db, `articles/${uid}/${blogid}`);
            const articleSnapshot = await get(articleRef);

            if (articleSnapshot.exists()) {
              return articleSnapshot.val();
            } else {
              return null; // Article not found for the current story id
            }
          })
        );

        // Filter out null values (articles that were not found)
        const filteredArticlesArray = articlesArray.filter(
          (article) => article !== null
        );

        resolve(filteredArticlesArray);
      } else {
        resolve([]); // No stories found for the specified section term
      }
    } catch (error) {
      console.error("Error getting articles by section:", error);
      reject("Error getting articles by section");
    }
  });
};
export const getUserData = (uid) => {
  return new Promise(async (resolve, reject) => {
    try {
      const userRecord = {};
      resolve(userRecord);
    } catch (error) {
      reject(error);
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
