import { db } from "@scripts/firebaseconn";
import { ref, get } from "firebase/database";
import Response from "@scripts/response";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const sectionsRef = ref(db, "articleSections");
      const sectionsSnapshot = await get(sectionsRef);
      if (sectionsSnapshot.exists()) {
        const sectionsData = sectionsSnapshot.val();
        const sectionsArray = Object.keys(sectionsData).filter(
          (section) => sectionsData[section] === true
        );
        res.status(200).json(
          new Response("Section Array", 200, "Article", {
            sectionArray: sectionsArray,
          })
        );
      } else {
        res
          .status(404)
          .json(
            new Response("No Section Array Found", 404, "No Section Found")
          );
      }
    } catch (error) {
      res.status(500).json(new Response("An Internal Error", 401, "failed"));
    }
  } else {
    res.status(405).json(new Response("An Internal Error", 401, "failed"));
  }
}
