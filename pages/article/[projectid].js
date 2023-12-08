import React, { useState, useEffect } from "react";
import { withRouter, useRouter } from "next/router";
import Link from "next/link";
import { timeAndDateConverter } from "../../util/js/converter";
import slugify from "slugify";
import { Heading } from "../../util/components/heading";
import { Breadcomb } from "../../util/components/breadcomb";
import { auth } from "../../util/js/firebaseconn";
import {
  LoggedInInfo,
  getUserData,
  searcharticle,
} from "../../util/js/articleDB";
import { Helmet } from "react-helmet";
import Disclaimer from "../../util/components/footer";
import NoIntenet from "../../util/components/internetNotFound";
import {
  ref as sRef,
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
import { db, app } from "../../util/js/firebaseconn";
async function search(term) {
  try {
    const articles = await searcharticle(term); // Assuming `getArticles` is an asynchronous function that retrieves the articles
    return articles;
  } catch (error) {
    console.error("Error retrieving articles:", error);
    return [];
  }
}

function portfolioProject({ isOnline, articleData }) {
  const router = useRouter();
  const [article1, setAricle] = useState(null);
  const [load, loaded] = useState(false);
  const [admin, isAdmin] = useState(false);
  const [userdata, setUserData] = useState({});
  console.log(articleData);
  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      LoggedInInfo(user)
        .then((result) => {
          if (result.isAdmin) {
            isAdmin(true);
          } else {
            isAdmin(false);
          }
          loaded(true);
        })
        .catch((error) => {
          console.log(error);
          loaded(true);
          isAdmin(false);
        });
    });
    console.log(router);
    if (router.query.projectid) {
      console.log(router.query.projectid);
      search(router.query.projectid).then(async (arlist) => {
        if (arlist) {
          loaded(true);
          setAricle(arlist);
          console.log(arlist.desc);
          console.log(arlist.desc.split("\n"));
        } else {
          loaded(true);

          setAricle({});
        }
        console.log(arlist);
        getUserData(arlist.uid).then((val) => {
          setUserData(val);
        });
      });
    } else {
      loaded(true);
    }
  }, [router]);
  const breadcrumbPaths = [
    { url: "/", label: "Home" },
    { url: "", label: "Article" },
  ];
  return (
    <div>
      <div className="App">
        <Heading loaded={load} />
        <NoIntenet isOnline={isOnline} />
        <Helmet>
          <title>{articleData.title}</title>
          <meta name="description" content={articleData.desc} />
          <meta property="og:title" content={articleData.title} />
          <meta property="og:description" content={articleData.desc} />
          <meta property="og:image" content={articleData.imglink} />
          <meta property="og:title" content={articleData.title} />
        </Helmet>
        <div className="article-page">
          {/* <Breadcomb paths={breadcrumbPaths} /> */}
          {load ? (
            article1 && Object.keys(article1).length ? (
              <div>
                <div className="heading-main">{article1.title}</div>
                <div className="datetime">
                  Upload date:{" "}
                  {timeAndDateConverter(article1.date, article1.time)}
                </div>
                {admin ? (
                  <Link
                    href={
                      "/article/edit/" +
                      slugify(article1.title, { lower: false }) +
                      "?type=edit"
                    }
                  >
                    <button className="editbtn">Edit</button>
                  </Link>
                ) : null}
                <img src={article1.imglink} />
                <div className="article-para">
                  {article1.desc
                    .replace(/\\n/g, "")
                    .replace(/\\/g, "")
                    .split("\n")
                    .map((paragraph, index) => {
                      if (paragraph.length > 0)
                        return (
                          <div>
                            <p key={index}>{paragraph}</p>
                          </div>
                        );
                    })}
                </div>
              </div>
            ) : (
              <div>Not Found</div>
            )
          ) : (
            <div>Loading</div>
          )}

          <Disclaimer></Disclaimer>
        </div>
      </div>
    </div>
  );
}
export default portfolioProject;
export async function getServerSideProps(context) {
  const { params } = context;
  const projectid = params?.projectid;
  console.log(projectid);
  console.log(db);
  //  const searchIndexRef = sRef(db, "searchIndex/" + projectid);
  const articleSnapshot = await searcharticle(projectid);
  //const res = await fetch("https://api.github.com/repos/vercel/next.js");
  console.log(articleSnapshot);
  return {
    props: {
      articleData: articleSnapshot,
    },
  };
}
