import {
  BlogBox,
  Heading,
  Disclaimer,
  Banner,
  MetaData,
} from "@tcc/Components";
import React, { useEffect, useState, lazy, Suspense } from "react";
import { auth } from "@tcc/ArticleManager/Database/Auth";
import { get } from "@tcc/ArticleManager/Database";
import { LoggedData } from "@tcc/ArticleManager/Database/Auth";
import { getSections } from "@tcc/ArticleManager/Database";
import Link from "next/link";
import { ErrorBoundary } from "@tcc/Components";
const BlogBoxLazy = lazy(() => import("../util/components/blogBox"));
function Main({ isOnline, routerloaded }) {
  const [alist, setAlist] = useState([]); //ArticleList
  const [section, SetSections] = useState([]);
  const [admin, isAdmin] = useState(false); //Yes if admin
  const [nextKey, setNextKey] = useState(0); //Next Key of article Which needs to be loaded when clicked on load more
  const [FirstTime, setFirstTime] = useState(true); //true when article loaded fot the firstTime
  const [loaded, setLoded] = useState(false); //when any promises are running
  const [addMore, setAddMore] = useState(false); //true when new articles can be loaded
  const [warningMessage, setwarningMessage] = useState("loading");
  const [online, setOnline] = useState(false);
  const [blogsBySection, setBlogsBySection] = useState({});
  const [blogsFromAllsections, SetblogsFromAllSections] = useState();
  const addmore = async () => {
    try {
      const val = await get([], FirstTime, nextKey, `searchIndex`);
      let rvarr = val.articles;
      setNextKey(val.lowestTimestampKey.time);
      setFirstTime(false);
      setAlist((alist) => [...alist, ...rvarr]);
      setAddMore(true);
      setwarningMessage("Loaded Successfully");
    } catch (error) {
      if (error.statusCode === 401) {
        setwarningMessage(error.error);
      } else if (error.statusCode === 404) {
        setwarningMessage(error.error);
      }
      setAddMore(false);
    }
  };
  const fetchSection = async () => {
    try {
      const sectionsArray = await getSections();
      return sectionsArray;
    } catch (error) {
      console.error("Error fetching article sections:", error);
    }
  };
  const GetArticleOnSection = async (type) => {
    return await get([], true, 0, `artcleSectionsGroup/${type}`);
  };
  const fetchAndSetBlogs = async () => {
    try {
      const SectionArr = await fetchSection();

      for (const secitonInd of SectionArr) {
        const indvArticle = await GetArticleOnSection(secitonInd);

        setBlogsBySection((prevBlogs) => ({
          ...prevBlogs,
          [secitonInd]: indvArticle.articles,
        }));
      }
    } catch (error) {
      console.error("Error fetching and setting blogs:", error);
    }
  };
  useEffect(() => {
    fetchSection().then((SectionArr) => {
      SectionArr.forEach((secitonInd) => {
        GetArticleOnSection(secitonInd).then((indvArticle) => {
          setBlogsBySection((prevBlogs) => ({
            ...prevBlogs,
            [secitonInd]: indvArticle.articles,
          }));
        });
      });
    });
  }, []);

  const deletedAlert = (uid, key) => {
    alert("Deleted");
    const updatedItems = alist.filter((item) => item.blog_id !== key);
    setAlist(updatedItems);
  };

  //ping for internet speed test
  const ping = async (url) => {
    try {
      const response = await fetch(url, { method: "HEAD" });
      return response.ok; // Returns true if the response status is 2xx
    } catch (error) {
      return false; // Returns false if there is an error (e.g., network issue)
    }
  };
  const checkInternet = async () => {
    const isInternetWorking = await ping("https://httpbin.org/get");
    return isInternetWorking;
  };

  useEffect(() => {
    if (!isOnline) {
      setLoded(false);
      setOnline(false);
      setwarningMessage("You are offline");
      return () => {};
    }
    setNextKey(0);
    setAlist([]);
    setLoded(false);
    checkInternet().then((isOnline) => {
      if (isOnline) {
        addmore().then(() => setLoded(true));
        setOnline(true);
        auth.onAuthStateChanged((user) => {
          LoggedData(user)
            .then((result) => {
              if (result.isAdmin) {
                isAdmin(true);
              } else {
                isAdmin(false);
              }
            })
            .catch((error) => {
              isAdmin(false);
            });
        });
      } else {
        setLoded(true);
        setOnline(false);
        setwarningMessage("Internet not available");
      }
    });
  }, []);
  const handleImageLoad = (e) => {
    e.target.parentNode.className = e.target.parentNode.className.replace(
      new RegExp("loadingScreenBar", "g"),
      ""
    );
  };
  return (
    <div>
      <div
        className={!routerloaded || !loaded ? "App  mainloadingScreen" : "App"}
      >
        <Heading loaded={loaded} />

        <MetaData pageTitle={"The Comical Cabinet"} />
        <div className="blog-display-container">
          <div className="blog-holder-btn-container">
            <ErrorBoundary fallback={<p>Something went wrong</p>}>
              <Banner alist={alist} />
            </ErrorBoundary>

            <h2>Latest Article</h2>
            <div
              className={
                !loaded ? "blogs-data  loadingScreenBar" : "blogs-data"
              }
            >
              {!loaded ? <BlogBox loaded={alist.length == 0}></BlogBox> : null}
              {!loaded ? <BlogBox loaded={alist.length == 0}></BlogBox> : null}
              {!loaded ? <BlogBox loaded={alist.length == 0}></BlogBox> : null}

              {alist.length > 0
                ? alist.map((article) => (
                    <BlogBoxLazy
                      key={article.key}
                      data={article}
                      admin={admin}
                      deleteAlert={deletedAlert}
                      loaded={false}
                    />
                  ))
                : null}

              {online && loaded && alist.length == 0 ? (
                <div className="warning-message">{warningMessage}</div>
              ) : null}
              {loaded && !online ? (
                <div className="warning-message">{warningMessage}</div>
              ) : null}
            </div>

            <div>
              {/* Loop through sections and render blogs */}
              {Object.keys(blogsBySection).map((section) => (
                <div>
                  <Link href={`/section/` + section}>
                    <h2 className="link">{section}</h2>
                  </Link>
                  <div
                    key={section}
                    className={
                      !loaded ? "blogs-data  loadingScreenBar" : "blogs-data"
                    }
                  >
                    {blogsBySection[section].map((blog, index) => (
                      <BlogBox
                        key={blog.blog_id}
                        data={blog}
                        admin={admin}
                        deleteAlert={deletedAlert}
                        loaded={false}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Disclaimer></Disclaimer>
    </div>
  );
}

export default Main;
