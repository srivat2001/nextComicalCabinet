import { useEffect, useState } from "react";

const checkInternet = () => {
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

    if (typeof window !== "undefined") {
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
    }
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
  return isOnline;
};

export default checkInternet;
