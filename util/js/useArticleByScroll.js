import { getArticleByScroll } from "./articleDB"; // Replace with the correct path
import { useQuery } from "@tanstack/react-query";
const useArticleByScroll1 = (prevArr, first, lastTime, urlParam) => {
  return useQuery({
    queryKey: ["myQuery", prevArr, first, lastTime],
    queryFn: () => getArticleByScroll(prevArr, first, lastTime, urlParam),

    refetchInterval: false,
    refetchOnWindowFocus: false,
  });
};

export default useArticleByScroll1;
