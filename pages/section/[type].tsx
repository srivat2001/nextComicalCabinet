import React, { useRef, useState, useEffect } from "react";
import { Heading, BlogBox, MetaData } from "@tcc/Components";
import { auth, LoggedData } from "@tcc/ArticleManager/Database/Auth";
import { useRouter } from "next/router";
import { get } from "@tcc/ArticleManager/Database";
import Head from "next/head";
import Article from "@/util/js/data/article";
import { GetServerSidePropsContext } from "next";
import { User } from "firebase/auth";
import Response from "@scripts/response";

export default function Section({
  isOnline,
  routerloaded,
  typeSection,
}: {
  isOnline: boolean;
  routerloaded: boolean;
  typeSection: string;
}) {
  const [alist, setAlist] = useState<Article[]>([]);
  const router = useRouter();
  const [actionMessage, setActionMessage] = useState<string>("Loading");
  const [admin, isAdmin] = useState<boolean>(false);
  const [reload, setReload] = useState<boolean>(false);
  const [nextKey, setNextKey] = useState<number>(0);
  const [FirstTime, setFirstTime] = useState<boolean>(true);
  const EffectRan = useRef(true);
  const [loaded, setLoded] = useState<boolean>(false);
  const [addMore, setAddMore] = useState<boolean>(false);
  const [type, setType] = useState<string>("");

  const addmore = async (isFirstTime = false) => {
    let localFirstTime = FirstTime;
    let localNextkey = nextKey;
    if (isFirstTime) {
      localFirstTime = true;
      localNextkey = 0;
    }
    console.log(localFirstTime);
    console.log(localNextkey);
    try {
      const val = await get(
        localFirstTime,
        localNextkey,
        `artcleSectionsGroup/${router.query.type}`
      );
      console.log(val);
      if (val.status == 404) {
        if (!localFirstTime) {
          setAddMore(false);
        }
        setActionMessage(val.message);
      } else {
        const rvarr: Article[] = val.data!.ArticleList.reverse();
        console.log(rvarr);
        setNextKey(val.data!.time);
        setFirstTime(false);
        setAlist((alist) => [...alist!, ...rvarr]);
        setAddMore(true);
        setActionMessage("Loaded Successfully");
      }
    } catch (error: any) {
      if (error instanceof Response) {
        if (error.status === 404) {
          setLoded(true);
          setActionMessage(error.message);
          setAddMore(false);
        } else {
          setActionMessage("Server Error");
        }
      }
    }
  };
  const deletedAlert = () => {
    alert("deleted SuccessFully");
    setReload((reload) => !reload);
  };

  useEffect(() => {
    setAlist([]);
    if (!isOnline) {
      setActionMessage("You are offline");
      return () => {};
    }
    if (router.query.type) {
      if (typeof router.query.type === "string") {
        setType(router.query.type);
      }
    }

    auth.onAuthStateChanged((user: User) => {
      LoggedData(user)
        .then((result) => {
          if (result.data?.isAdmin) {
            isAdmin(true);
          } else {
            isAdmin(false);
          }
          setLoded(true);
        })
        .catch((error) => {
          setLoded(true);
          isAdmin(false);
        });
    });

    setFirstTime(true);
    setActionMessage("loading");
    addmore(true);
    EffectRan.current = false;
  }, [router.query.type]);

  return (
    <div>
      <MetaData pageTitle={typeSection + " Page"} />
      <div
        className={!loaded || !routerloaded ? "App  mainloadingScreen" : "App"}
      >
        <div className="blog-display-container">
          <Heading loaded={loaded} />
          <div className="sectioncontainer">
            <div className="section-topic">{type}</div>
            <div
              className={
                !loaded ? "blogs-data  loadingScreenBar" : "blogs-data"
              }
            >
              {alist.length > 0 ? (
                alist.map((article) => <BlogBox data={article} admin={admin} />)
              ) : (
                <div className="not-found">{actionMessage}</div>
              )}
            </div>
            {addMore && alist.length > 0 ? (
              <div>
                <button
                  onClick={() => {
                    addmore();
                  }}
                >
                  Load more
                </button>
                s
              </div>
            ) : null}
            {!addMore && alist.length > 0 ? (
              <div>No More Article to load</div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const searchT = context.params?.type;
  return {
    props: {
      typeSection: searchT,
    },
  };
}
