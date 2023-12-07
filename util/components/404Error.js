import React from "react";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import { Heading } from "../components/heading";
const Custom404 = ({ isOnline }) => {
  return (
    <div>
      <div className="App">
        <Heading loaded={true} />
        <div>
          {typeof window !== "undefined" && isOnline ? (
            <div suppressHydrationWarning>
              <Box mt={2} sx={{ backgroundColor: "#f44336", color: "#fff" }}>
                <Alert
                  sx={{
                    backgroundColor: "#f44336", // Background color of the alert
                    color: "#fff", // Text color of the alert
                    "& .MuiAlert-icon": {
                      color: "#fff", // Color of the icon
                    },
                  }}
                  severity="warning"
                >
                  <AlertTitle>404</AlertTitle>
                  Page not found
                </Alert>
              </Box>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Custom404;
