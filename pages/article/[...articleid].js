import React, { useRef, useState, useEffect } from "react";
import { Heading } from "@tcc/Components";
import { auth, LoggedData } from "@tcc/ArticleManager/Database/Auth";
import { search, add, getSections, get } from "@tcc/ArticleManager/Database/";
import { useRouter } from "next/router";
const useAutosizeInput = (limit) => {
  const [remainingChars, setRemainingChars] = useState(20);
  const [limitref, setLimit] = useState(limit);
  const [value, setValue] = useState("f");
  const setReplicatedValue = (textareaRef) => {
    if (textareaRef.current && textareaRef.current.parentNode) {
      const currentValue = textareaRef.current.value;
      const truncatedValue = currentValue.slice(0, limit);
      setValue(truncatedValue);
      setRemainingChars(limitref - truncatedValue.length);
      textareaRef.current.parentNode.dataset.replicatedValue =
        truncatedValue + " ";

      // If the user exceeds the limit, prevent further input
      if (currentValue.length >= limit) {
        textareaRef.current.value = truncatedValue;
        setValue(truncatedValue);
      }
    }
  };

  return {
    remainingChars,
    setReplicatedValue,
    limitref,
    value,
  };
};
async function loadArticles(paramValue, uid) {
  return await search(paramValue, uid);
}
function PublishArticle({ isOnline, routerloaded, articleData }) {
  const router = useRouter();
  const [admin, setAdmin] = useState(false);
  const [found, Setfound] = useState();
  const [load, setLoad] = useState(0);
  const [articleID, setArticleID] = useState("");
  const [oldDetails, setOldDetails] = useState({});
  const titleInput = useAutosizeInput(120);
  const Imglink = useAutosizeInput(3000);
  const Para = useAutosizeInput(80000);
  const [user, setuser] = useState({});
  const [section, setSection] = useState();
  const [SectionList, setSectionList] = useState([]);
  const [type, setType] = useState("Add");
  const [file, setFile] = useState();
  const [setImg, setImgLink] = useState();
  const ParaRef = useRef(null);
  const TitleRef = useRef(null);

  const ImageRef = useRef(null);
  const TrggerChange = (ReFTextarea, value) => {
    if (ReFTextarea.current) {
      ReFTextarea.current.value = value;
      ReFTextarea.current.dispatchEvent(new Event("input", { bubbles: true }));
    }
  };

  const BlogTOLocalUrl = (blob) => {
    return URL.createObjectURL(blob);
  };

  useEffect(() => {
    if (load == 1) {
    }
    if (load == 1 && admin == 1 && Object.keys(oldDetails).length > 0) {
      TrggerChange(TitleRef, oldDetails.title);
      TrggerChange(ParaRef, oldDetails.desc);
      setImgLink(oldDetails.imglink);
    }
  }, [oldDetails, load, admin]);
  const loadArticlesIfexists = (uid, articleid = null) => {
    loadArticles(articleid).then((details) => {
      if (details) {
        setOldDetails(details);
        setSection(details.section);
        Setfound(1);
        setLoad(1);
      } else {
        setLoad(1);
        Setfound(0);
      }
    });
  };
  const fetchSection = async () => {
    try {
      const sectionsArray = await getSections();
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
      LoggedData(user)
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
      <div>
        <div
          className={!load || !routerloaded ? "App  mainloadingScreen" : "App"}
        >
          <Heading loaded={load} />

          <div className="publish-page">
            <div className={1 ? "edit-content" : "edit-content blur-bg"}>
              <div className="heading">
                {type === "edit" ? "Edit" : "Add"} Article
              </div>

              {(load && admin && type === "edit" && found) ||
              (load && admin && type === "add") ? (
                <div>
                  <div>Title</div>
                  <div className="grow-wrap">
                    <textarea
                      name="text"
                      id="text"
                      ref={TitleRef}
                      value={titleInput.value}
                      onInput={() => titleInput.setReplicatedValue(TitleRef)}
                    ></textarea>
                  </div>
                  <div className="Alert Character">
                    No of Characters Left: {titleInput.remainingChars}
                  </div>
                  <div>Img Src</div>
                  <img className="edit-img" src={setImg} />
                  <div className="grow-wrap">
                    <textarea
                      name="text"
                      id="text"
                      ref={ImageRef}
                      visibility="hidden"
                      onInput={() => Imglink.setReplicatedValue(ImageRef)}
                    ></textarea>

                    <input
                      type="file"
                      onChange={(e) => {
                        setFile(e.target.files[0]);
                        setImgLink(BlogTOLocalUrl(e.target.files[0]));
                      }}
                    />
                  </div>
                  <div className="Alert Character">
                    No of Characters Left: {Imglink.remainingChars}
                  </div>
                  <div>Paragraph</div>
                  <div className="grow-wrap">
                    <textarea
                      name="text"
                      id="text"
                      ref={ParaRef}
                      onInput={() => Para.setReplicatedValue(ParaRef)}
                    ></textarea>
                  </div>
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
                      SetWarning("Adding or Updating....");
                      const result = await add(
                        titleInput.value,
                        Para.value,
                        section,
                        oldDetails,
                        file
                      );

                      SetWarning(result.message);
                      if (result.type == "update" && result.status == 200) {
                        setOldDetails(result.data.updateddata);
                        //    router.push("/article/" + result.data.updatedtitle);
                      }
                      if (result.type == "add" && result.status == 200) {
                        // router.push("/article/" + result.data.title);
                      }
                    }}
                  >
                    Publish
                  </button>
                </div>
              ) : (
                <div>
                  <div>
                    {load && admin == 0 ? <div>You are not admin</div> : null}
                  </div>
                  <div>
                    {load && admin == 1 && found == 0 ? (
                      <div>Article Not found</div>
                    ) : null}
                  </div>
                  <div>{load == 0 ? <div>Loading </div> : null}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PublishArticle;
