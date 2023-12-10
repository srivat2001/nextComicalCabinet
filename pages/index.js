import { BlogBox } from "../util/components/blogBox";
import React, { useEffect, useState, useContext } from "react";
import Disclaimer from "../util/components/footer";
import { Heading } from "../util/components/heading";
import { auth } from "../util/js/firebaseconn";
import { LoggedInInfo, getArticleByScroll } from "../util/js/articleDB";
import { useRouter } from "next/router";
function Main({ isOnline, routerloaded }) {
  const [alist, setAlist] = useState([]); //ArticleList
  const [admin, isAdmin] = useState(false); //Yes if admin
  const [nextKey, setNextKey] = useState(0); //Next Key of article Which needs to be loaded when clicked on load more
  const [FirstTime, setFirstTime] = useState(true); //true when article loaded fot the firstTime
  const [loaded, setLoded] = useState(false); //when any promises are running
  const [addMore, setAddMore] = useState(false); //true when new articles can be loaded
  const [warningMessage, setwarningMessage] = useState("loading");
  const [online, setOnline] = useState(false);

  //Add article

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
      if (error.statusCode === 401) {
        setwarningMessage(error.error);
      } else if (error.statusCode === 404) {
        setwarningMessage(error.error);
      }
      setAddMore(false);
    }
  };

  //alert when deleted
  const deletedAlert = (uid, key) => {
    alert("deleted");
    const updatedItems = alist.filter((item) => item.key !== key);
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
    console.log(isOnline);
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
  }, []);

  return (
    <div>
      <div
        className={!routerloaded || !loaded ? "App  mainloadingScreen" : "App"}
      >
        <Heading loaded={loaded} />
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
                <div className="warning-message">{warningMessage}</div>
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
              <div>No More Article to load</div>
            ) : null}
          </div>
        </div>
      </div>
      <Disclaimer></Disclaimer>
    </div>
  );
}

export default Main;
