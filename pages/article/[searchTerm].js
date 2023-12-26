import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import timeAndDateConverter from "@tcc/ArticleManager/timeAndDateConverter";
import slugify from "slugify";
import { Heading, Disclaimer, NoIntenet } from "@tcc/Components";
import { LoggedData, auth } from "@tcc/ArticleManager/Database/Auth";
import { search } from "@tcc/ArticleManager/Database";
import Head from "next/head";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "@fortawesome/fontawesome-svg-core/styles.css"; // Import the styles
import "@scripts/font-awsome";
import {
  faFacebook,
  faTwitter,
  faInstagram,
  faWhatsapp,
} from "@fortawesome/free-brands-svg-icons";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
function portfolioProject({ isOnline, routerloaded, articleData, searchTerm }) {
  const router = useRouter();
  const [load, loaded] = useState(false);
  const [admin, isAdmin] = useState(false);

  if (typeof window !== "undefined") {
    if (!articleData) {
      router.push("404");
    }
  }
  const copyUrlToClipboard = (e) => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(url)
        .then(() => {})
        .catch((error) => {
          console.error("Unable to copy to clipboard", error);
        });
    } else {
      // Fallback for browsers that do not support navigator.clipboard
      const textarea = document.createElement("textarea");
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      alert("URL copied to clipboard!");
    }
  };
  const handleImageLoad = (e) => {
    e.target.parentNode.className = e.target.parentNode.className.replace(
      new RegExp("loadingScreenBar", "g"),
      ""
    );
  };
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

                <div className="blog_img_cover loadingScreenBar">
                  <img src={articleData.imglink} onLoad={handleImageLoad} />
                </div>
                <div className="font-social">
                  <a
                    href={
                      "https://www.facebook.com/sharer.php?u=" +
                      window.location.href
                    }
                    target="_blank"
                  >
                    <FontAwesomeIcon icon={["fab", "facebook"]} size="2x" />
                  </a>

                  <a
                    href={
                      "https://twitter.com/intent/tweet?url=" +
                      window.location.href
                    }
                    target="_blank"
                  >
                    <FontAwesomeIcon icon={["fab", "twitter"]} size="2x" />
                  </a>
                  <a
                    href={"https://wa.me/?text=" + window.location.href}
                    target="_blank"
                  >
                    <FontAwesomeIcon icon={faWhatsapp} size="2x" />
                  </a>
                  <a href="#" onClick={copyUrlToClipboard}>
                    <FontAwesomeIcon icon={faCopy} size="2x" />
                  </a>
                </div>
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
        searchTerm: searchT,
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
