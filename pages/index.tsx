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
import Article from "@/util/js/data/article";
const BlogBoxLazy = lazy(() => import("../util/components/blogBox"));
interface MainProps {
  isOnline: boolean;
  routerloaded: boolean;
}
function Main({ isOnline, routerloaded }: MainProps) {
  const [alist, setAlist] = useState<Article[]>([]); //ArticleList
  const [admin, isAdmin] = useState(false); //Yes if admin
  const [nextKey, setNextKey] = useState<number>(0); //Next Key of article Which needs to be loaded when clicked on load more
  const [FirstTime, setFirstTime] = useState<boolean>(true); //true when article loaded fot the firstTime
  const [loaded, setLoded] = useState<boolean>(false); //when any promises are running
  const [addMore, setAddMore] = useState<boolean>(false); //true when new articles can be loaded
  const [warningMessage, setwarningMessage] = useState<string>("loading");
  const [online, setOnline] = useState<boolean>(false);
  const [blogsBySection, setBlogsBySection] = useState<{
    [section: string]: Article[];
  }>();
  const addmore = async () => {
    try {
      const val = await get(FirstTime, nextKey, `searchIndex`);
      let rvarr = val.data!.ArticleList;
      setNextKey(val.data!.time);
      setFirstTime(false);
      setAlist((alist) => [...alist, ...rvarr]);
      setAddMore(true);
      setwarningMessage("Loaded Successfully");
    } catch (error: any) {
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
      return sectionsArray.data!.SectionList;
    } catch (error) {
      console.error("Error fetching article sections:", error);
    }
  };
  const GetArticleOnSection = async (type: string) => {
    return await get(true, 0, `artcleSectionsGroup/${type}`);
  };

  const getAriclebysection = async (secitonInd: string) => {
    return await GetArticleOnSection(secitonInd);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const SectionArr: string[] | undefined = await fetchSection();
        if (SectionArr) {
          for (const secitonInd of SectionArr) {
            console.log(secitonInd);
            const indarticle = await getAriclebysection(secitonInd);
            if (indarticle.status == 404) {
              continue;
            }
            setBlogsBySection(
              (
                prevBlogs:
                  | {
                      [section: string]: Article[];
                    }
                  | any
              ) => ({
                ...prevBlogs,
                [secitonInd]: indarticle.data?.ArticleList,
              })
            );
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const deletedAlert = (uid: string, key: string) => {
    alert("Deleted");
    const updatedItems = alist.filter((item) => item.blogid !== key);
    setAlist(updatedItems);
  };

  useEffect(() => {
    setNextKey(0);
    setAlist([]);
    setLoded(false);
    addmore().then(() => setLoded(true));
    setOnline(true);
    auth.onAuthStateChanged((user: any) => {
      LoggedData(user)
        .then((result) => {
          if (result.data?.isAdmin) {
            isAdmin(true);
          } else {
            isAdmin(false);
          }
        })
        .catch((error) => {
          isAdmin(false);
        });
    });
  }, []);

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
              {!loaded ? (
                <BlogBox loaded={alist.length == 0} data={undefined}></BlogBox>
              ) : null}
              {!loaded ? (
                <BlogBox loaded={alist.length == 0} data={undefined}></BlogBox>
              ) : null}
              {!loaded ? (
                <BlogBox
                  loaded={alist.length == 0}
                  data={undefined}
                  delete1={undefined}
                  admin={undefined}
                  deleteAlert={undefined}
                ></BlogBox>
              ) : null}

              {alist.length > 0
                ? alist.map((article) => (
                    <BlogBoxLazy
                      key={article.blogid}
                      data={article}
                      admin={admin}
                      deleteAlert={deletedAlert}
                      loaded={false}
                      delete1={undefined}
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
            {blogsBySection !== undefined ? (
              <div>
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
                      {blogsBySection[section].map((blog: any, index: any) => (
                        <BlogBox
                          key={blog.blog_id}
                          data={blog}
                          admin={admin}
                          deleteAlert={deletedAlert}
                          loaded={false}
                          delete1={undefined}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <Disclaimer></Disclaimer>
    </div>
  );
}

export default Main;
