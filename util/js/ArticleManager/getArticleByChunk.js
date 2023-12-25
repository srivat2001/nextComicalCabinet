import {
  ref,
  query,
  orderByChild,
  endAt,
  get,
  limitToLast,
  endBefore,
} from "firebase/database";
import { db } from "@tcc/ArticleManager/Database/Auth";
import { CustomError } from "@error/CustomError";
const getArticleByChunk = async (prevArr, first, lastTime, reftype) => {
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
      articles = articles;

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
export default getArticleByChunk;
