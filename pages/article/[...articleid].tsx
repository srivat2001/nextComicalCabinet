import React, { useRef, useState, useEffect, ChangeEvent } from "react";
import { Heading } from "@tcc/Components";
import { auth, LoggedData } from "@tcc/ArticleManager/Database/Auth";
import {
  search,
  add,
  getSections,
  get,
  update,
} from "@tcc/ArticleManager/Database/";
import { useRouter } from "next/router";
import Article from "@/util/js/data/article";
import { User } from "firebase/auth";
import validateInputs from "@scripts/ArticleManager/Assests/validation";

interface AutosizeInputProps {
  remainingChars: number;
  setReplicatedValue: (
    textareaRef: React.RefObject<HTMLTextAreaElement>
  ) => void;
  limitref: number;
  value: string;
}
interface Inputdata {
  date: string;
  time: string;
  title: string;
  desc: string;
  blogid: string;
  uid: any;
  section: string;
}
const useAutosizeInput = (limit: number): AutosizeInputProps => {
  const [remainingChars, setRemainingChars] = useState<number>(20);
  const [limitref, setLimit] = useState<number>(limit);
  const [value, setValue] = useState<string>("");

  const setReplicatedValue = (
    textareaRef: React.RefObject<HTMLTextAreaElement>
  ): void => {
    if (textareaRef.current && textareaRef.current.parentNode) {
      const currentValue: string = textareaRef.current.value;
      const truncatedValue: string = currentValue.slice(0, limit);
      setValue(truncatedValue);
      setRemainingChars(limitref - truncatedValue.length);
      const parentNodeWithDataset = textareaRef.current
        .parentNode as HTMLElement;
      parentNodeWithDataset.dataset.replicatedValue = truncatedValue + " ";
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
async function loadArticles(paramValue: string) {
  return await search(paramValue);
}
function PublishArticle({
  isOnline,
  routerloaded,
  articleData,
}: {
  isOnline: boolean;
  routerloaded: boolean;
  articleData: Article;
}) {
  const router = useRouter();
  const [admin, setAdmin] = useState<boolean>(false);
  const [found, Setfound] = useState<boolean>();
  const [load, setLoad] = useState<boolean>(false);
  const [articleID, setArticleID] = useState("");
  const [oldDetails, setOldDetails] = useState<Article | any>();
  const titleInput = useAutosizeInput(120);
  const Imglink = useAutosizeInput(3000);
  const Para = useAutosizeInput(80000);
  const [user, setuser] = useState({});
  const [section, setSection] = useState<string>();
  const [SectionList, setSectionList] = useState<string[]>();
  const [type, setType] = useState("Add");
  const [file, setFile] = useState<File | null>(null);
  const [setImg, setImgLink] = useState<string>();
  const ParaRef = useRef<HTMLTextAreaElement>(null);
  const TitleRef = useRef<HTMLTextAreaElement>(null);

  const ImageRef = useRef(null);

  const TrggerChange = (
    ReFTextarea: React.RefObject<HTMLTextAreaElement>,
    value: string
  ): void => {
    if (ReFTextarea.current) {
      ReFTextarea.current.value = value;
      ReFTextarea.current.dispatchEvent(new Event("input", { bubbles: true }));
    }
  };

  const BlogTOLocalUrl = (blob: Blob) => {
    return URL.createObjectURL(blob);
  };

  useEffect(() => {
    if (
      load == true &&
      admin &&
      oldDetails &&
      Object.keys(oldDetails).length > 0
    ) {
      TrggerChange(TitleRef, oldDetails.title);
      TrggerChange(ParaRef, oldDetails.desc);
      setImgLink(oldDetails.imglink);
    }
  }, [oldDetails, load, admin]);
  const loadArticlesIfexists = (articleid: string) => {
    loadArticles(articleid).then((details) => {
      if (details) {
        setOldDetails(details);
        setSection(details.section);
        Setfound(true);
        setLoad(true);
      } else {
        setLoad(true);
        Setfound(false);
      }
    });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setImgLink(BlogTOLocalUrl(selectedFile));
    }
  };
  const fetchSection = async () => {
    try {
      const sectionsArray = await getSections();
      if (sectionsArray) {
        setSectionList(sectionsArray.data!.SectionList);
        setSection(sectionsArray.data!.SectionList[0]);
      }
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
    auth.onAuthStateChanged(async (user: User) => {
      LoggedData(user)
        .then((result) => {
          setuser(user);
          if (result.data?.isAdmin && router.query.articleid) {
            setAdmin(true);
            if (router.query.articleid[0] == "edit") {
              loadArticlesIfexists(router.query.articleid[1]);
            } else if (router.query.articleid[0] == "add") {
              if (router.query.articleid[1] !== "new") {
                router.push("/404");
              } else {
                setLoad(true);
              }
            }
          } else {
            setAdmin(false);
            setLoad(true);
          }
        })
        .catch((error) => {
          console.log(error);
          setAdmin(false);
        });
    });
  }, [router]);
  const [warning, SetWarning] = useState<string[]>([]);

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
                      onInput={() => Imglink.setReplicatedValue(ImageRef)}
                    ></textarea>

                    <input type="file" onChange={handleFileChange} />
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
                    {SectionList
                      ? SectionList.map((section, index) => (
                          <option key={index} value={section}>
                            {section}
                          </option>
                        ))
                      : null}
                  </select>
                  <div className="warning">{warning}</div>
                  <button
                    disabled={!admin}
                    onClick={async (e) => {
                      SetWarning(["Adding or Updating...."]);
                      if (titleInput.value && Para.value && section) {
                        const validationProblems = validateInputs(
                          titleInput.value,
                          Para.value,
                          section
                        );
                        if (validationProblems.length !== 0) {
                          SetWarning(validationProblems);
                        } else {
                          const Inputdetails = {
                            title: titleInput.value,
                            desc: Para.value,
                            section: section,
                          };
                          if (
                            oldDetails &&
                            oldDetails.hasOwnProperty("blogid")
                          ) {
                            console.log(oldDetails);
                            const result = await update(
                              oldDetails,
                              Inputdetails,
                              file
                            );
                            if (result.status == 200) {
                              SetWarning(["Updated SuccessFully"]);
                              if (
                                result.data?.updateddata &&
                                result.data.updateddata
                              ) {
                                setOldDetails(result.data?.updateddata);
                              }
                            } else if (result.status == 500) {
                              SetWarning(["Internal Error"]);
                            }
                          } else {
                            if (file) {
                              const result = await add(
                                titleInput.value,
                                Para.value,
                                section,
                                file
                              );

                              if (result.status == 200) {
                                if (
                                  result.data?.Title &&
                                  result.data.uploadedArticle
                                ) {
                                  SetWarning(["Added SuccessFully"]);
                                }
                              } else {
                                SetWarning(["An Error Occured"]);
                              }
                            } else {
                              SetWarning(["Upload Image"]);
                            }
                          }
                        }
                      }
                    }}
                  >
                    Publish
                  </button>
                </div>
              ) : (
                <div>
                  <div>
                    {load && admin == false ? (
                      <div>You are not admin</div>
                    ) : null}
                  </div>
                  <div>
                    {load && admin == true && found == false ? (
                      <div>Article Not found</div>
                    ) : null}
                  </div>
                  <div>{load == false ? <div>Loading </div> : null}</div>
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
