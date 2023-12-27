import { ref, onValue } from "firebase/database";
import { db } from "@tcc/ArticleManager/Database/Auth";
import { CustomError } from "@error/CustomError";

const LoggedInInfo = async (user) => {
  return new Promise((resolve, reject) => {
    const timeoutDuration = 5000; // Adjust the timeout duration as needed (in milliseconds)
    const timeoutId = setTimeout(() => {
      reject(new CustomError("Timeout: Auh state change took too long.", 401));
    }, timeoutDuration);
    const handleQueryResult = (snapshot) => {
      clearTimeout(timeoutId); // Clear the timeout since the operation completed successfully
      const isAdmin = snapshot.exists();
      resolve({
        isLoggedIn: true,
        isAdmin: isAdmin,
      });
    };
    const handleError = (error) => {
      clearTimeout(timeoutId);
      reject(error);
    };
    if (user) {
      const query = ref(db, "/admins/" + user.uid);
      onValue(query, handleQueryResult, handleError);
    } else {
      clearTimeout(timeoutId);
      resolve({
        isLoggedIn: false,
        isAdmin: false,
      });
    }
  });
};

export default LoggedInInfo;
