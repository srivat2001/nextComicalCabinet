import React from "react";
import dynamic from "next/dynamic";

const NoSSR = dynamic(() => import("../util/components/404Error.js"), {
  ssr: false,
});

const Custom404 = ({ isOnline }) => {
  return <NoSSR isOnline={isOnline} />;
};

export default Custom404;
