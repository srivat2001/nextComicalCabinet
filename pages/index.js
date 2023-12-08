import { BlogBox } from "../util/components/blogBox";
import React, { useEffect, useState, useReducer, useRef } from "react";
import { getArticles } from "../util/js/articleDB";
import Disclaimer from "../util/components/footer";
import { Heading } from "../util/components/heading";
import { useOnline } from "react-detect-offline";

import { auth } from "../util/js/firebaseconn";
import { LoggedInInfo, getArticleByScroll } from "../util/js/articleDB";
import cooking from "../util/img/cooking.gif";
import NoIntenet from "../util/components/internetNotFound";

function Main({ isOnline }) {
  const [alist, setAlist] = useState([]);
  const [admin, isAdmin] = useState(false);
  const [nextKey, setNextKey] = useState(0);
  const [FirstTime, setFirstTime] = useState(true);
  const EffectRan = useRef(true);
  const [loaded, setLoded] = useState(false);
  const [reload, setReload] = useState(false);
  const [addMore, setAddMore] = useState(false);
  const [actionMessage, setActionMessage] = useState("Loading");
  const [warningMessage, setwarningMessage] = useState(
    "Blogs will be uploaded soon"
  );
  const [online, setOnline] = useState(false);
  function delete1() {
    //  updatedata(setAlist);
  }

  async function getdata(arr, firstTime, nextVal, reftype = "searchIndex") {
    return getArticleByScroll([], firstTime, nextVal, reftype);
  }
  const addmore = async () => {
    try {
      const val = await getArticleByScroll(
        [],
        FirstTime,
        nextKey,
        `searchIndex`
      );
      let rvarr = val.articles;
      setNextKey(val.lowestTimestampKey.time);
      setFirstTime(false);
      setAlist((alist) => [...alist, ...rvarr]);
      setAddMore(true);

      setActionMessage("Loaded Successfully");
    } catch (error) {
      if (error.statusCode === 404) {
        setActionMessage(error.error);
        setAddMore(false);
      }
    }
  };
  const deletedAlert = (uid, key) => {
    alert("deleted");
    console.log(alist, key);

    const updatedItems = alist.filter((item) => item.key !== key);

    // Update the state with the new array
    setAlist(updatedItems);
    // setReload((reload) => !reload);
  };
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
  const handleOffline = () => {
    console.log("Offline event detected");
    // Add any additional logic you want to run when offline
  };

  useEffect(() => {
    if (!isOnline) {
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
      } else {
        setLoded(true);
        setOnline(false);
        setwarningMessage("Internet not available");
      }
    });
  }, [reload]);

  return (
    <div>
      <div className={!loaded ? "App  loadingScreenBar" : "App"}>
        <Heading loaded={loaded} />
        <NoIntenet isOnline={isOnline} />
        <div className="top-message ">{isOnline}Whats Cooking? </div>

        <div className="blog-display-container">
          <div className="blog-holder-btn-container">
            <div
              className={
                !loaded ? "blogs-data  loadingScreenBar" : "blogs-data"
              }
            >
              {!loaded ? <BlogBox loaded={alist.length == 0}></BlogBox> : null}
              {!loaded ? <BlogBox loaded={alist.length == 0}></BlogBox> : null}
              {alist.length > 0
                ? alist.map((article) => (
                    <BlogBox
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
                <div className="warning-message">No internet Connection</div>
              ) : null}
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
                </button>
              </div>
            ) : null}
            {!addMore && alist.length > 0 ? (
              <div>
                No More Article to load<div>{alist[0]}</div>
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
