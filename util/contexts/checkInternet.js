import React, { createContext, useEffect, useState } from "react";

export const CheckInternet = createContext();

const InternetCheckProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(
    typeof window !== "undefined" && window.navigator.onLine
  );

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log("it is online");
    };
    const handleOffline = () => {
      setIsOnline(false);
      console.log("it is offline");
    };

    // Attach event listeners to router events
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Remove event listeners when the component unmounts
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    // Provide the loaded state to the context
    <CheckInternet.Provider value={{ isOnline }}>
      {children}
    </CheckInternet.Provider>
  );
};
export default InternetCheckProvider;
// Custom hook to access the loaded state anywhere in your app
