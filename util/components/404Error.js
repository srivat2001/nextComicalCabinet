import React from "react";
import { Heading } from "../components/heading";
const Custom404 = ({ isOnline }) => {
  return (
    <div>
      <div className="App">
        <Heading loaded={true} />
        <div>
          {typeof window !== "undefined" && isOnline ? (
            <div suppressHydrationWarning>Page not found</div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Custom404;
