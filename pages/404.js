import React from "react";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import { Heading } from "../util/components/heading";
import dynamic from "next/dynamic";

const NoSSR = dynamic(() => import("../util/components/404Error.js"), {
  ssr: false,
});

const Custom404 = ({ isOnline }) => {
  return <NoSSR isOnline={isOnline} />;
};

export default Custom404;
