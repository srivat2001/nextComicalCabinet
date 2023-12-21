import Link from "next/link";
import React, { useEffect, useState, useReducer } from "react";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithRedirect,
  getRedirectResult,
  signOut,
} from "firebase/auth";
import { fetchArticleSections } from "../js/articleDB";
import { app } from "../js/firebaseconn";
import img_logo from "../img/TCB_Banner2.png";
import Image from "next/image";
// YourComponent.js
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";

export const Heading = ({ loaded }) => {
  const initialState = {
    alist: [],
    userName: "",
    loggedData: {},
  };
  const reducer = (state, action) => {
    switch (action.type) {
      case "SET_LOGGED_DATA":
        return { ...state, loggedData: action.payload.user };
      case "LOGOUT":
        return { ...state, loggedData: {} };
      default:
        return state;
    }
  };
  const [state, dispatch] = useReducer(reducer, initialState);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [load, setLoad] = useState(true);
  const [sections, setSectionList] = useState([]);
  const fetchSection = async () => {
    try {
      // = await fetchArticleSections();
      const result = await fetch("/api/article/sections/get", {
        method: "GET",
      });
      const data = await result.json();
      const sectionsArray = data.data.sectionArray;

      setSectionList(sectionsArray);
    } catch (error) {
      console.error("Error fetching article sections:", error);
    }
  };
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  function signin() {
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();

    const isMobileDevice = true;

    if (1) {
      signInWithRedirect(auth, provider);
    } else {
      signInWithPopup(auth, provider)
        .then((result) => {
          localStorage.setItem("_loggeddata", JSON.stringify(result));
          dispatch({ type: "SET_LOGGED_DATA", payload: result });
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }
  function signOutbtn() {
    const auth = getAuth(app);
    signOut(auth)
      .then(() => {
        localStorage.removeItem("_loggeddata");
        dispatch({ type: "LOGOUT", payload: {} });
      })
      .catch((error) => {
        // An error happened.
      });
  }
  useEffect(() => {
    fetchSection();
    const auth = getAuth(app);
    console.log(auth.currentUser);
    getRedirectResult(auth)
      .then((result) => {
        console.log(result);
        // This gives you a Google Access Token. You can use it to access Google APIs.
        const credential = GoogleAuthProvider.credentialFromResult(result);

        const token = credential.accessToken;
        setLoad(false);
        // The signed-in user info.
        const user = result.user;
        // IdP data available using getAdditionalUserInfo(result)
        // ...

        localStorage.setItem("_loggeddata", JSON.stringify(result));
        dispatch({ type: "SET_LOGGED_DATA", payload: result });
      })
      .catch((error) => {
        setLoad(false);
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        //  const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });
    console.log(localStorage.getItem("_loggeddata"));
    if (localStorage.getItem("_loggeddata")) {
      const parsedData = JSON.parse(localStorage.getItem("_loggeddata"));
      dispatch({ type: "SET_LOGGED_DATA", payload: parsedData });
    }
  }, []);
  return (
    <header>
      <div className={!loaded ? "head-flex loadingScreenBar" : "head-flex"}>
        <div className="head-logo">
          <Image
            src={img_logo} // Path to the image in the public directory
            alt="Description of the image"
            width={400} // Set the width of the image
          ></Image>
        </div>

        {Object.keys(state.loggedData).length ? (
          <div className="user-logged-in-details">
            <div className="for-pc-width">
              <div className="welcome-message">
                Welcome {state.loggedData.displayName}
              </div>
              <div className="btn-holder">
                <a onClick={signOutbtn}>
                  <button className="upload-btn ">
                    <FontAwesomeIcon icon={faSignOutAlt} />
                    <span>Sign out</span>
                  </button>
                </a>
                <Link href="/article/add/new">
                  <button className="upload-btn ">
                    <FontAwesomeIcon icon={faUpload} />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="user-logged-out-details">
            <a className="login-btn" onClick={() => signin()}>
              <button>Login</button>
            </a>
          </div>
        )}
      </div>
      <div className={`sidebarContainer ${sidebarOpen ? "open" : ""}`}>
        {/* Sidebar */}
        <div className={!loaded ? "sidebar loadingScreenBar" : "sidebar"}>
          <div className="sidebar-ul">
            <button className="toggle-btn" onClick={toggleSidebar}>
              ☰
            </button>
            {sections.length > 0 ? (
              <ul>
                <li>
                  <Link href="/">Home</Link>
                </li>

                {sections.map((section, index) => (
                  <li key={index}>
                    {/* Assuming the route path is '/section/:type' */}
                    <Link href={`/section/${section}`}>{section}</Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <div className="loader-container">
            {load ? <div class="loader"></div> : null}
          </div>
          {!load ? (
            <div className="mobile-login-logout-container">
              {Object.keys(state.loggedData).length ? (
                <div className="btn-holder">
                  <button className="upload-btn " onClick={signOutbtn}>
                    <FontAwesomeIcon icon={faSignOutAlt} />
                    <span>Sign out</span>
                  </button>
                  {/* <Link to="/article/add-article"></Link> */}

                  <Link href="/article/add-article">
                    <button className="upload-btn ">
                      <FontAwesomeIcon icon={faUpload} />
                    </button>
                  </Link>
                </div>
              ) : (
                <div>
                  <a className="login-btn" onClick={() => signin()}>
                    <button>Login</button>
                  </a>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
      {/* <div className="head-flex nav-bar">
        <div className="items">Politics</div>
        <div className="items">Entertainment</div>
        <div className="items">Sports</div>
      </div> */}
    </header>
  );
};
