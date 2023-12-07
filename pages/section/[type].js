import React, { useRef, useState, useEffect } from "react";
import { Heading } from "../../util/components/heading";
import Link from "next/link";
import { auth } from "../../util/js/firebaseconn";
import { withRouter, useRouter } from "next/router";

import {
  searcharticle,
  Publisharticle1,
  LoggedInInfo,
  fetchArticleSections,
  getArticlesBySection,
  getArticleByScroll,
} from "../../util/js/articleDB";

import { BlogBox } from "../../util/components/blogBox";

export default function Section() {
  function deleteData() {}
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
  // const { data, isLoading, isError } = useArticleByScroll([], FirstTime, nextKey);

  function delete1() {
    //  updatedata(setAlist);
  }

  const addmore = async () => {
    try {
      const val = await getArticleByScroll(
        [],
        FirstTime,
        nextKey,
        `artcleSectionsGroup/${type}`
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
  const deletedAlert = () => {
    alert("deleted SuccessFully");
    setReload((reload) => !reload);
  };
  useEffect(() => {
    if (router.query.type) {
      setType(router.query.type);
    }
    auth.onAuthStateChanged((user) => {
      LoggedInInfo(user)
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
    setNextKey(0);
    setAddMore(false);
    setAlist([]);
    setLoded(false);
    addmore();

    EffectRan.current = false;
    return () => {};
  }, [type, reload, router]);
  return (
    <div>
      <div className="App section">
        <Heading loaded={loaded} />

        <div className="section-topic">{type}</div>
        <div className="blogs-data">
          {alist.length > 0 ? (
            alist.map((article) => (
              <BlogBox
                data={article}
                admin={admin}
                deleteAlert={deletedAlert}
              />
            ))
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
  );
}
