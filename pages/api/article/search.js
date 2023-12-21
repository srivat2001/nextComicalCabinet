// pages/api/example.js

import { db } from "@scripts/firebaseconn";
import { ref, get } from "firebase/database";
import Response from "@scripts/response";
export default async function handler(req, res) {
  const {
    body: { term },
  } = req;
  if (req.method === "POST") {
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
          res.status(200).json(
            new Response("Success", 200, "Search Successfull", {
              article: articleData,
            })
          );
        } else {
          res
            .status(404)
            .json(new Response("Article Not Found", 404, "failed"));
        }
      } else {
        res.status(404).json(new Response("Article Not Found", 404, "Failed"));
      }
    } catch (error) {
      console.error("Error searching article:", error);
      res.status(401).json(new Response("Server Error", 401, "Failed"));
    }
  } else {
    res.status(405).json(new Response("Forbidden", 401, "Method Not allowed"));
  }
}
