import Link from "next/link";
import slugify from "slugify";
import { useRouter } from "next/router";
import { remove } from "@tcc/ArticleManager/Database";
interface BlogBoxProps {
  data: any;
  delete1?: any;
  admin?: any;
  deleteAlert?: any;
  loaded?: any;
}
const BlogBox: React.FC<BlogBoxProps> = ({
  data,
  delete1,
  admin,
  deleteAlert,
  loaded,
}) => {
  // console.log(data);
  const deleteArticleAsync = async (
    key: string,
    uid: string,
    title: string,
    section: string
  ) => {
    try {
      await remove(key, uid, title, section);
      console.log("Deletion successful");
      deleteAlert(uid, key);
    } catch (error) {
      console.error("Deletion failed:", error);
    }
  };
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    if (target.parentNode) {
      const LinkNode = target.parentNode as HTMLElement;
      const FigureWrapper = LinkNode.parentNode as HTMLElement;
      FigureWrapper.className = FigureWrapper.className.replace(
        new RegExp("loadingScreenBar", "g"),
        ""
      );
    }
  };

  const router = useRouter();
  return (
    <div className={loaded ? "box loadingScreenBar boxloading" : "box"}>
      {data && Object.keys(data).length ? (
        <div className="img-bloginfo-container">
          <div className="blog_img_cover loadingScreenBar">
            <Link href={`/article/${slugify(data.title, { lower: false })}`}>
              <img
                className="blog_img"
                onLoad={handleImageLoad}
                src={data.imglink}
                alt="blog_img"
              />
            </Link>
          </div>
          <div className="right-side">
            <div className="title">
              <Link href={`/article/${slugify(data.title, { lower: false })}`}>
                {data.title}
              </Link>
            </div>
            <div className="date">{data.date}</div>
            <div className="line"></div>
            <p className="desc">
              {data.desc.split(" ").length > 15
                ? data.desc.split(" ").slice(0, 14).join(" ") + "..."
                : data.desc}
            </p>
            {admin ? (
              <div className="btn-list">
                <button
                  onClick={(e) =>
                    deleteArticleAsync(
                      data.blogid,
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
                      "/article/edit/" + slugify(data.title, { lower: false })
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
export default BlogBox;
