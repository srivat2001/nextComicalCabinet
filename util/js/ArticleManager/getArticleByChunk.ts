import {
  ref,
  query,
  orderByChild,
  endAt,
  get,
  limitToLast,
  endBefore,
  Query,
} from "firebase/database";
import { db } from "@tcc/ArticleManager/Database/Auth";

import { CustomError } from "@error/CustomError";
import Article from "@scripts/data/article";
import Response from "@scripts/response";
const getArticleByChunk = async (
  isFirst: Boolean,
  lastTime: number,
  reftype: string
): Promise<Response<{ time: number; ArticleList: Article[] }>> => {
  return new Promise(async (resolve, reject) => {
    let lowestTimestampKey: number = 0;
    setTimeout(
      () => reject(new CustomError("ITs taking too long to load", 401)),
      5000
    );
    let articles: Article[] = [];
    try {
      if (isFirst) {
        const searchIndexRef: Query = query(
          ref(db, reftype),
          orderByChild("time"),
          limitToLast(1) // Limit to the last 1
        );
        const searchIndexSnapshot = await get(searchIndexRef);
        if (!searchIndexSnapshot.exists()) {
          // Handle the case when no data is available
          //     reject({ error: "No Articles Found", statusCode: 404 });
          return resolve(new Response("No Articles Found", 404));
        }
        const latestSearchIndexItem: any = Object.values(
          searchIndexSnapshot.val()
        )[0];
        lastTime = latestSearchIndexItem.time;
      }
      if (lastTime !== 0) {
        let searchIndexRef: any = "";
        if (isFirst === true) {
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
              searchIndexData[key].time < lowestTimestampKey
            ) {
              lowestTimestampKey = searchIndexData[key].time;
            }
          }
        }
      }
      let resarticles = articles;

      if (articles.length === 0) {
        return resolve(new Response("No Articles Found", 404));
      }
      const resdata = { time: lowestTimestampKey, ArticleList: articles };
      const data1 = new Response<{ time: number; ArticleList: Article[] }>(
        "Article List",
        203,
        "gert",
        resdata
      );
      console.log(data1.status);
      console.log(data1);
      return resolve(data1);
    } catch (error) {
      console.error("Error fetching articles by scroll:", error);
      reject("Error fetching articles by scroll");
      reject(new Response("Server Error", 201));
    }
  });
};
export default getArticleByChunk;
