import "../styles/globals.css";
import "../util/scss/blogBox.scss";
import "../util/scss/main.scss";
import "../util/scss/disclaimer.scss";
import "../util/scss/head.scss";
import "../util/scss/article.scss";
import "../util/scss/section.scss";
import "../util/scss/breadcumb.scss";
import React, { useContext } from "react";
import "../util/scss/publishpage.scss";
import RouterContextProvider from "../util/contexts/routeChange";
import InternetCheckProvider from "../util/contexts/checkInternet";
import { RouterChange } from "../util/contexts/routeChange";
import { CheckInternet } from "../util/contexts/checkInternet";

const AppWrapper = ({ Component, pageProps }) => {
  return (
    <InternetCheckProvider>
      <RouterContextProvider>
        <MyApp Component={Component} pageProps={pageProps} />
      </RouterContextProvider>
    </InternetCheckProvider>
  );
};

const MyApp = ({ Component, pageProps }) => {
  const { routerloaded } = useContext(RouterChange);
  const { isOnline } = useContext(CheckInternet);
  return (
    <Component {...pageProps} routerloaded={routerloaded} isOnline={isOnline} />
  );
};

export default AppWrapper;
