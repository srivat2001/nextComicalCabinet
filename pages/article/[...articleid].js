import React, { useRef, useState, useEffect } from "react";
import { Heading } from "../../util/components/heading";
import { auth } from "../../util/js/firebaseconn";
import {
  searcharticle,
  Publisharticle1,
  LoggedInInfo,
  fetchArticleSections,
} from "../../util/js/articleDB";
import { withRouter, useRouter } from "next/router";
const useAutosizeInput = (remainwords) => {
  const [value, setValue] = useState("");
  const [remainingChars, setRemainingChars] = useState(remainwords);
  const [isLowRemainingChars, setIsLowRemainingChars] = useState(false);
  const inputRef = useRef(null);
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "0px";
      const scrollHeight = inputRef.current.scrollHeight;
      inputRef.current.style.height = scrollHeight + "px";
    }
  }, [value]);

  const handleInputChange = (e) => {
    const updatedValue = e;
    setIsLowRemainingChars(remainingChars <= 0.1 * 50);
    const charsLeft = remainwords - updatedValue.length;

    if (charsLeft >= 0) {
      setValue(updatedValue);
      setRemainingChars(charsLeft);
    } else {
      setValue(updatedValue.slice(0, remainwords));
      setRemainingChars(0);
    }
  };

  return {
    value,
    remainingChars,
    inputRef,
    isLowRemainingChars,
    handleInputChange,
  };
};
async function loadArticles(paramValue, uid) {
  return await searcharticle(paramValue, uid);
}
function PublishArticle({}) {
  const router = useRouter();
  const [found, Setfound] = useState(0);
  const [oldTitle, setOldTitle] = useState("");
  const [admin, setAdmin] = useState(false);
  const [load, setLoad] = useState(0);
  const [articleID, setArticleID] = useState("");
  const [oldDetails, setOldDetails] = useState({});
  const [breadcrumbPaths, setBreadcrumbPaths] = useState([
    { url: "/", label: "Home" },
    { url: "", label: "Aricle" },
    { url: "/add", label: "Add Article" },
  ]);
  const titleInput = useAutosizeInput(120, true);
  const Imglink = useAutosizeInput(3000, false);
  const Para = useAutosizeInput(80000, false);
  const [user, setuser] = useState({});
  const [section, setSection] = useState();
  const [SectionList, setSectionList] = useState([]);
  const [type, setType] = useState("Add");
  const loadArticlesIfexists = (uid, articleid = null) => {
    console.log(uid, articleid, type);
    setBreadcrumbPaths([
      { url: "/", label: "Home" },
      { url: "", label: "Aricle" },
      { url: "", label: "Edit Article" },
    ]);

    loadArticles(articleid).then((details) => {
      if (details) {
        setOldDetails(details);

        titleInput.handleInputChange(details.title);
        Imglink.handleInputChange(details.imglink);
        Para.handleInputChange(details.desc);
        setOldTitle(details.title);
        setSection(details.section);
        setArticleID(details.key);
        Setfound(1);
      } else {
        Setfound(0);
      }

      setLoad(1);
    });
  };
  const fetchSection = async () => {
    try {
      const sectionsArray = await fetchArticleSections();
      setSectionList(sectionsArray);
      setSection(sectionsArray[0]);
    } catch (error) {
      console.error("Error fetching article sections:", error);
    }
  };
  useEffect(() => {
    if (router.query.articleid) {
      setType(router.query.articleid[0]);
    }

    fetchSection();
    auth.onAuthStateChanged(async (user) => {
      LoggedInInfo(user)
        .then((result) => {
          setuser(user);
          console.log(result);
          if (result.isAdmin) {
            setAdmin(true);
            if (router.query.articleid && router.query.articleid[0] == "edit") {
              loadArticlesIfexists(user.uid, router.query.articleid[1]);
            } else {
              setLoad(1);
            }
          } else {
            setAdmin(false);
          }
        })
        .catch((error) => {
          console.log(error);
          setAdmin(false);
        });
    });
  }, [router]);
  const [warning, SetWarning] = useState([]);

  return (
    <div>
      <div className="App">
        <Heading loaded={load} />
        <div className="publish-page">
          {load ? (
            <div
              className={
                admin == true ? "edit-content" : "edit-content blur-bg"
              }
            >
              <div className="heading">
                {type === "edit" ? "Edit" : "Add"} Article
              </div>
              {load ? (
                found ? (
                  <div>
                    <label className="textarea-label">Enter Your Title</label>
                    <textarea
                      ref={titleInput.inputRef}
                      value={titleInput.value}
                      className={"addArticle"}
                      onChange={(e) =>
                        titleInput.handleInputChange(e.target.value)
                      }
                      contentEditable={true}
                    >
                      dfdf
                    </textarea>
                    <div
                      className={
                        titleInput.isLowRemainingChars
                          ? "Alert Character red-characters"
                          : "Alert Character"
                      }
                    >
                      No of Characters Left: {titleInput.remainingChars}
                    </div>

                    <label className="textarea-label">Img Link</label>

                    <textarea
                      ref={Imglink.inputRef}
                      value={Imglink.value}
                      className="addArticle"
                      onChange={(e) =>
                        Imglink.handleInputChange(e.target.value)
                      }
                      contentEditable={true}
                    />
                    <img className="edit-img" src={Imglink.value} />
                    <div className="Alert Character">
                      No of Characters Left: {Imglink.remainingChars}
                    </div>

                    <label className="textarea-label">Paragraph</label>
                    <textarea
                      ref={Para.inputRef}
                      value={Para.value}
                      className="addArticle"
                      onChange={(e) => Para.handleInputChange(e.target.value)}
                      contentEditable={true}
                    />
                    <div className="Alert Character">
                      No of Characters Left: {Para.remainingChars}
                    </div>
                    <select
                      onChange={(e) => setSection(e.target.value)}
                      className="addArticle"
                      id="articleSection"
                      value={section}
                    >
                      {SectionList.map((section, index) => (
                        <option key={index} value={section}>
                          {section}
                        </option>
                      ))}
                    </select>

                    <div className="warning">{warning.join(", ")}</div>
                    <button
                      onClick={async (e) => {
                        SetWarning(
                          await Publisharticle1(
                            titleInput.value,
                            Para.value,
                            Imglink.value,
                            articleID,
                            section,
                            oldDetails,
                            user
                          )
                        );
                      }}
                    >
                      Publish
                    </button>
                  </div>
                ) : (
                  <div>No Article Found</div>
                )
              ) : (
                <div>loading</div>
              )}
              {!admin ? (
                <div className="not-allowed-overlay">
                  <div className="alert">You Dont Have Access!</div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default PublishArticle;