import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
export default function NoIntenet({ isOnline }) {
  return (
    <div>
      {typeof window !== "undefined" && !isOnline ? (
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
              <AlertTitle>No Internet Connection</AlertTitle>
              Please check your internet connection and try again.
            </Alert>
          </Box>
        </div>
      ) : null}
    </div>
  );
}
