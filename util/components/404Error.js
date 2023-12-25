import React from "react";

import { Heading } from "@tcc/Components";

const Custom404 = ({ isOnline }) => {
  return (
    <div>
      <div className="App">
        <Heading loaded={true} />
        <div className="pagenotfound">
          {typeof window !== "undefined" && isOnline ? (
            <h1>Page not found</h1>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Custom404;
