import Link from "next/link";
import slugify from "slugify";
import timeAndDateConverter from "@tcc/ArticleManager/timeAndDateConverter";
const Banner = ({ alist }) => {
  // throw new Error("Simulated error in component");
  const handleImageLoad = (e) => {
    e.target.parentNode.className = e.target.parentNode.className.replace(
      new RegExp("loadingScreenBar", "g"),
      ""
    );
  };

  return (
    <div>
      {alist.length > 0 ? (
        <div className="banner-container">
          <div className="Banner">
            <div className="left">
              <div className="figure-wrapper loadingScreenBar">
                <img
                  src={alist[0].imglink}
                  className="loadingScreenBar"
                  onLoad={handleImageLoad}
                ></img>
              </div>
            </div>

            <div className="right">
              <div className="Section">{alist[0].section}</div>
              <Link
                href={`/article/${slugify(alist[0].title, {
                  lower: false,
                })}`}
              >
                <div className="title">{alist[0].title}</div>
              </Link>
              <div className="desc">
                {alist[0].desc.split(" ").length > 15
                  ? alist[0].desc.split(" ").slice(0, 14).join(" ") + "..."
                  : alist[0].desc}
              </div>

              <div className="timedate">
                {timeAndDateConverter(alist[0].date, alist[0].time)}
              </div>
              <div></div>
              <div></div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
export default Banner;
