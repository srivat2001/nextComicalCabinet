import React, { useRef, useState, useEffect } from "react";
import { Heading } from "../../util/components/heading";
import { auth } from "../../util/js/firebaseconn";
import {
  searcharticle,
  Publisharticle1,
  LoggedInInfo,
  fetchArticleSections,
} from "../../util/js/articleDB";
import { redirect } from "next/navigation";
import { useRouter } from "next/router";
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
function PublishArticle({ isOnline, routerloaded, articleData }) {
  const router = useRouter();
  const [found, Setfound] = useState(0);
  const [admin, setAdmin] = useState(false);
  const [load, setLoad] = useState(0);
  const [articleID, setArticleID] = useState("");
  const [oldDetails, setOldDetails] = useState({});
  const titleInput = useAutosizeInput(120, true);
  const Imglink = useAutosizeInput(3000, false);
  const Para = useAutosizeInput(80000, false);
  const [user, setuser] = useState({});
  const [section, setSection] = useState();
  const [SectionList, setSectionList] = useState([]);
  const [type, setType] = useState("Add");
  const loadArticlesIfexists = (uid, articleid = null) => {
    console.log(uid, articleid, type);

    loadArticles(articleid).then((details) => {
      if (details) {
        setOldDetails(details);
        titleInput.handleInputChange(details.title);
        Imglink.handleInputChange(details.imglink);
        Para.handleInputChange(details.desc);
        setSection(details.section);
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
      switch (router.query.articleid[0]) {
        case "add":
          setType(router.query.articleid[0]);
          break;
        case "edit":
          setType(router.query.articleid[0]);
          break;
        default:
          router.push("/404");
      }
    }
    fetchSection();
    auth.onAuthStateChanged(async (user) => {
      LoggedInInfo(user)
        .then((result) => {
          setuser(user);
          if (result.isAdmin && router.query.articleid) {
            setAdmin(true);
            if (router.query.articleid[0] == "edit") {
              loadArticlesIfexists(user.uid, router.query.articleid[1]);
            } else if (router.query.articleid[0] == "add") {
              if (router.query.articleid[1] !== "new") {
                router.push("/404");
              } else {
                setLoad(1);
              }
            }
          } else {
            setAdmin(false);
            setLoad(1);
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
      <div
        className={!load || !routerloaded ? "App  mainloadingScreen" : "App"}
      >
        <Heading loaded={load} />
        <div className="publish-page">
          {load ? (
            <div className={1 ? "edit-content" : "edit-content blur-bg"}>
              <div className="heading">
                {type === "edit" ? "Edit" : "Add"} Article
              </div>
              {load ? (
                (found || type == "add" || type == "edit") && admin == true ? (
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

                    <div className="warning">{warning}</div>
                    <button
                      disabled={!admin}
                      onClick={async (e) => {
                        const result = await Publisharticle1(
                          titleInput.value,
                          Para.value,
                          Imglink.value,
                          articleID,
                          section,
                          oldDetails,
                          user
                        );

                        SetWarning(result.message);
                        if (result.type == "update" && result.status == 200) {
                          setOldDetails(result.data.updateddata);
                          router.push("/article/" + result.data.updatedtitle);
                        }
                      }}
                    >
                      Publish
                    </button>
                  </div>
                ) : type == "add" && admin == false ? (
                  <div>You are not admin</div>
                ) : type == "edit" && admin == true && !found ? (
                  <div>Not found, and the user is not an admin</div>
                ) : null
              ) : (
                <div>loading</div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default PublishArticle;
