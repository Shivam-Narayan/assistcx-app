import * as url from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { useEffect, useState } from "react";

const useGetAllToolList = () => {
  const { axiosAuth, loading } = useAxiosAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [allToolsList, setAllToolsList] = useState<any[]>([]);

  const getAgentToolsDetails = async () => {
    if (!loading) {
      try {
        setIsLoading(true);
        const result = await axiosAuth.get(url.AGENT_TOOLS_LIST);
        if (result?.status === 200) {
          const raw = result?.data?.agent_tools ?? [];
          let parsed: any = raw.map((item: any) => {
            return {
              name: item["name"],
              action: item["action"],
              function: item["function"],
              description: item["description"],
              api_type: item["api_type"],
              icon: item["icon"],
            };
          });
          setAllToolsList(parsed);
        }
      } catch (error: any) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    getAgentToolsDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);
  

  return {
    allToolsList,
    isLoading,
  };
};

export default useGetAllToolList;
