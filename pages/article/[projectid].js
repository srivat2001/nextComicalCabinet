import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { timeAndDateConverter } from "../../util/js/converter";
import slugify from "slugify";
import { Heading } from "../../util/components/heading";
import { auth } from "../../util/js/firebaseconn";
import { LoggedInInfo, searcharticle } from "../../util/js/articleDB";
import Disclaimer from "../../util/components/footer";
import NoIntenet from "../../util/components/internetNotFound";
import Head from "next/head";

function portfolioProject({ isOnline, routerloaded, articleData }) {
  const router = useRouter();
  const [load, loaded] = useState(false);
  const [admin, isAdmin] = useState(false);
  console.log(articleData);
  if (typeof window !== "undefined") {
    if (!articleData) {
      router.push("404");
    }
  }
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
        <meta
          name="twitter:image"
          content="https://c.ndtvimg.com/2023-12/76qv9dt4_surat-diamond-burse_625x300_16_December_23.jpeg?ver-20231203.06"
        ></meta>
        <link
          rel="preload"
          as="image"
          href="https://c.ndtvimg.com/2023-12/76qv9dt4_surat-diamond-burse_625x300_16_December_23.jpeg"
        ></link>
      </Head>
      <img
        title="Diamond Hub Surat Aims To Outshine World As Largest Office Opens Tomorrow"
        alt="Diamond Hub Surat Aims To Outshine World As Largest Office Opens Tomorrow"
        id="story_image_main"
        src="https://c.ndtvimg.com/2023-12/76qv9dt4_surat-diamond-burse_625x300_16_December_23.jpeg"
        pinger-seen="true"
      />
      <div className="article-page">
        {/* <Breadcomb paths={breadcrumbPaths} /> */}
        {load ? (
          articleData && Object.keys(articleData).length ? (
            <div>
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
              <img src={articleData.imglink} />
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
  );
}
export default portfolioProject;
export async function getServerSideProps(context) {
  const { params } = context;
  const projectid = params?.projectid;
  const articleSnapshot = await searcharticle(projectid);
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
