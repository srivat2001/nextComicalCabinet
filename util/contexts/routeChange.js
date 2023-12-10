import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";

export const RouterChange = createContext();

const RouterContextProvider = ({ children }) => {
  const [routerloaded, setLoaded] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const handleStart = () => {
      setLoaded(false);
    };

    const handleComplete = () => {
      setLoaded(true);
    };

    // Attach event listeners to router events
    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);

    // Remove event listeners when the component unmounts
    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
    };
  }, [router.events]);

  return (
    // Provide the loaded state to the context
    <RouterChange.Provider value={{ routerloaded }}>
      {children}
    </RouterChange.Provider>
  );
};
export default RouterContextProvider;
// Custom hook to access the loaded state anywhere in your app
