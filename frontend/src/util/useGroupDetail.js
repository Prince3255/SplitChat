import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchGroupDetail } from "./fetchGroupDetail";

const useGroupDetail = (id, isAuthenticated) => {
  const [groupDetail, setGroupDetail] = useState(null);

  const {
    data: groupData,
    isLoading: groupLoading,
    isError: groupError,
    error: groupErrorMessage,
  } = useQuery({
    queryKey: ["groupDetail", id],
    queryFn: fetchGroupDetail,
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (groupData) {
      setGroupDetail(groupData);
    }
  }, [groupData]);

  return { groupDetail, groupLoading, groupError, groupErrorMessage };
};

export default useGroupDetail;