// import "../styles/globals.css";
import "../util/scss/blogBox.scss";
import "../util/scss/main.scss";
// import "../util/scss/disclaimer.scss";
import "../util/scss/head.scss";
import "../util/scss/article.scss";
// import "../util/scss/section.scss";
// import "../util/scss/breadcumb.scss";
import checkInternet from "../util/js/checkConnection";
import React, { useEffect, useState, useReducer, useRef } from "react";
import "../util/scss/publishpage.scss";
function MyApp({ Component, pageProps }) {
  const isOnline = checkInternet();
  return (
    <StylesProvider injectFirst>
      <Component {...pageProps} isOnline={isOnline} />
    </StylesProvider>
  );
}

export default MyApp;
