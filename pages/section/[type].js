import React, { useRef, useState, useEffect } from "react";
import { Heading, BlogBox } from "@tcc/Components";
import { auth, LoggedData } from "@tcc/ArticleManager/Database/Auth";
import { useRouter } from "next/router";
import { get } from "@tcc/ArticleManager/Database";

export default function Section({ isOnline, routerloaded }) {
  const [alist, setAlist] = useState([]);
  const router = useRouter();
  const [actionMessage, setActionMessage] = useState("Loading");
  const [admin, isAdmin] = useState(false);
  const [reload, setReload] = useState(false);
  const [nextKey, setNextKey] = useState(0);
  const [FirstTime, setFirstTime] = useState(true);
  const EffectRan = useRef(true);
  const [loaded, setLoded] = useState(false);
  const [addMore, setAddMore] = useState(false);
  const [type, setType] = useState("");

  const addmore = async (isFirstTime = false) => {
    let localFirstTime = FirstTime;
    let localNextkey = nextKey;
    if (isFirstTime) {
      localFirstTime = true;
      localNextkey = 0;
    }
    try {
      const val = await get(
        [],
        localFirstTime,
        localNextkey,
        `artcleSectionsGroup/${router.query.type}`
      );

      let rvarr = val.articles;
      console.log(val);
      setNextKey(val.lowestTimestampKey.time);
      setFirstTime(false);
      setAlist((alist) => [...alist, ...rvarr]);
      setAddMore(true);
      setActionMessage("Loaded Successfully");
    } catch (error) {
      console.log(error);
      if (error.statusCode === 404) {
        setActionMessage(error.error);
        setAddMore(false);
      }
    }
  };
  const deletedAlert = () => {
    alert("deleted SuccessFully");
    setReload((reload) => !reload);
  };

  useEffect(() => {
    if (router.query.type) {
      console.log(router.query.type);
    }
    setAlist([]);
    if (!isOnline) {
      setActionMessage("You are offline");
      return () => {};
    }
    if (router.query.type) {
      setType(router.query.type);
    }

    auth.onAuthStateChanged((user) => {
      LoggedData(user)
        .then((result) => {
          if (result.isAdmin) {
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
            {addMore ? (
              <div>
                {" "}
                <button
                  onClick={() => {
                    addmore();
                  }}
                >
                  Load more
                </button>{" "}
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
