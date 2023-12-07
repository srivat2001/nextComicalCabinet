import React, { useState, useEffect } from "react";
import { withRouter, useRouter, Link } from "next/router";
import { searcharticle } from "../../util/js/articleDB";
import { timeAndDateConverter } from "../../util/js/converter";
import slugify from "slugify";
import { Heading } from "../../util/components/heading";
import { Breadcomb } from "../../util/components/breadcomb";
import { auth } from "../../util/js/firebaseconn";
import { LoggedInInfo, getUserData } from "../../util/js/articleDB";
import { Helmet } from "react-helmet";
import Disclaimer from "../../util/components/footer";
async function search(term) {
  try {
    const articles = await searcharticle(term); // Assuming `getArticles` is an asynchronous function that retrieves the articles
    return articles;
  } catch (error) {
    console.error("Error retrieving articles:", error);
    return [];
  }
}

function Article() {
  const router = useRouter();
  const [article1, setAricle] = useState(null);
  const [load, loaded] = useState(0);
  const [admin, isAdmin] = useState(false);
  const [userdata, setUserData] = useState({});
  console.log(router);
  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      LoggedInInfo(user)
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
    console.log(router);
    if (router.query.articleid) {
      console.log(router.query.articleid);
      search(router.query.articleid).then(async (arlist) => {
        if (arlist) {
          loaded(1);
          setAricle(arlist);
          console.log(arlist.desc);
          console.log(arlist.desc.split("\n"));
        } else {
          loaded(1);

          setAricle({});
        }
        console.log(arlist);
        getUserData(arlist.uid).then((val) => {
          setUserData(val);
        });
      });
    } else {
      loaded(1);
    }
  }, []);

  const breadcrumbPaths = [
    { url: "/", label: "Home" },
    { url: "", label: "Article" },
  ];
  // Fetch article data using the articleId or load it from a data source

  return (
    <div>
      <div className="App">
        <Heading />
        <div className="article-page">
          {"<Breadcomb paths={breadcrumbPaths} /> "}
          {load ? (
            Object.keys(article1).length ? (
              <div>
                <Helmet>
                  <title>{article1.title}</title>
                  <meta name="description" content={article1.desc} />
                  <meta property="og:title" content={article1.title} />
                  <meta property="og:description" content={article1.desc} />
                  <meta property="og:image" content={article1.imglink} />
                </Helmet>
                <div className="heading-main">{article1.title}</div>
                <div className="datetime">
                  Upload date:{" "}
                  {timeAndDateConverter(article1.date, article1.time)}
                </div>
                {admin ? (
                  <Link
                    href={
                      "/article/edit/" +
                      slugify(article1.title, { lower: false })
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

export default Article;
