import { ref, onValue } from "firebase/database";
import { db } from "@tcc/ArticleManager/Database/Auth";
import { CustomError } from "@error/CustomError";
import Response from "@scripts/response";

const LoggedInInfo = async (user: any) => {
  return new Promise<Response<{ isAdmin: boolean }>>((resolve, reject) => {
    const timeoutDuration = 5000; // Adjust the timeout duration as needed (in milliseconds)
    const timeoutId = setTimeout(() => {
      reject(new CustomError("Timeout: Auth state change took too long.", 401));
    }, timeoutDuration);

    const handleQueryResult = (snapshot: any) => {
      clearTimeout(timeoutId); // Clear the timeout since the operation completed successfully
      const isAdmin = snapshot.exists();
      resolve(
        new Response("Logged Data", 200, "GET", {
          isAdmin: isAdmin,
        })
      );
    };

    const handleError = (error: any) => {
      clearTimeout(timeoutId);
      reject(error);
    };

    if (user) {
      const query = ref(db, "/admins/" + user.uid); // Assuming 'db' is defined elsewhere
      onValue(query, handleQueryResult, handleError);
    } else {
      clearTimeout(timeoutId);

      resolve(
        new Response("Logged Data", 200, "GET", {
          isAdmin: false,
        })
      );
    }
  });
};

export default LoggedInInfo;
