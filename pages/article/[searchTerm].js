import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import timeAndDateConverter from "@tcc/ArticleManager/timeAndDateConverter";
import slugify from "slugify";
import { Heading, Disclaimer, NoIntenet } from "@tcc/Components";
import { LoggedData, auth } from "@tcc/ArticleManager/Database/Auth";
import { search } from "@tcc/ArticleManager/Database";
import Head from "next/head";

function portfolioProject({ isOnline, routerloaded, articleData }) {
  const router = useRouter();
  const [load, loaded] = useState(false);
  const [admin, isAdmin] = useState(false);

  if (typeof window !== "undefined") {
    if (!articleData) {
      router.push("404");
    }
  }

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      LoggedData(user)
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
  }, [router]);
  return (
    <div className={!load || !routerloaded ? "App  mainloadingScreen" : "App"}>
      <Heading loaded={load} />
      <NoIntenet isOnline={isOnline} />
      <Head>
        <title>{articleData.title}</title>
        <script
          src="https://kit.fontawesome.com/yourcode.js"
          crossorigin="anonymous"
        ></script>

        <meta name="description" content={articleData.desc.split(".")[0]} />
        <meta property="og:title" content={articleData.title} />
        <meta
          property="og:description"
          content={articleData.desc.split(".")[0]}
        />
        <meta property="og:image" content={articleData.imglink} />
        <meta property="og:title" content={articleData.title} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:image" content={articleData.imglink}></meta>
        <meta name="twitter:title" content={articleData.title} />
        <meta
          name="twitter:description"
          content={articleData.desc.split(".")[0]}
        />
        <meta name="twitter:image" content={articleData.imglink} />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="preload" as="image" content={articleData.imglink}></link>
      </Head>

      <div className="article-page">
        <div>
          {/* <Breadcomb paths={breadcrumbPaths} /> */}
          {load ? (
            articleData && Object.keys(articleData).length ? (
              <div className="article-cotainer">
                <div className="articletop">
                  <h1 className="section">{articleData.section}</h1>
                  <div className="heading-main">{articleData.title}</div>
                  <div className="datetime">
                    Upload date:{" "}
                    {timeAndDateConverter(articleData.date, articleData.time)}
                  </div>
                  {admin ? (
                    <Link
                      href={
                        "/article/edit/" +
                        slugify(articleData.title, { lower: false }) +
                        "?type=edit"
                      }
                    >
                      <button className="editbtn">Edit</button>
                    </Link>
                  ) : null}
                </div>
                <img src={articleData.imglink} />
                <h1 className="authorname">By {articleData.displayName}</h1>
                <div className="article-para">
                  {articleData.desc
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
  const searchT = context.params?.searchTerm;
  const articleSnapshot = await search(searchT);
  if (articleSnapshot) {
    return {
      props: {
        articleData: articleSnapshot,
      },
    };
  } else {
    return {
      redirect: {
        destination: "/404",
        permanent: false,
      },
    };
  }
}
