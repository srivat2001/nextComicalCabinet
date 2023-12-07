import Link from "next/link";
import slugify from "slugify";
import { useRouter } from "next/router";
import { deletedata } from "../js/articleDB";
import { useEffect } from "react";
export const BlogBox = ({ data, delete1, admin, deleteAlert, loaded }) => {
  // console.log(data);
  const deleteArticleAsync = async (key, uid, title, section) => {
    try {
      await deletedata(key, uid, title, section);
      console.log("Deletion successful");
      deleteAlert(uid, key);
    } catch (error) {
      console.error("Deletion failed:", error);
    }
  };

  const router = useRouter();
  useEffect(() => {
    console.log(data);
  }, []);
  return (
    <div className={loaded ? "box loadingScreenBar boxloading" : "box"}>
      {data && Object.keys(data).length ? (
        <div>
          <div className="blog_img_cover">
            <img className="blog_img" src={data.imglink} alt="blog_img" />
          </div>
          <div>
            <div className="title">
              <Link href={`/article/${slugify(data.title, { lower: false })}`}>
                {" "}
                {data.title}
              </Link>
            </div>
            <div className="date">{data.date}</div>
            <div className="line"></div>
            <p className="desc">
              {data.desc.split(" ").length > 15
                ? data.desc.split(" ").slice(0, 15).join(" ") + "..."
                : data.desc}
            </p>
            {admin ? (
              <div className="btn-list">
                <button
                  onClick={(e) =>
                    deleteArticleAsync(
                      data.key,
                      data.uid,
                      data.title,
                      data.section
                    )
                  }
                >
                  Delete
                </button>
                <button
                  onClick={() =>
                    router.push(
                      "/article/edit/" +
                        slugify(data.title, { lower: false }) +
                        "?type=edit"
                    )
                  }
                >
                  Edit
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
};
