import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchUserDetail } from "./fetchUserDetail";

const useUserDetail = (id, isAuthenticated) => {
  const [userDetail, setUserDetail] = useState(null);

  const {
    data: userData,
    isLoading: userLoading,
    isError: userError,
    error: userErrorMessage,
  } = useQuery({
    queryKey: ["userDetail", id],
    queryFn: fetchUserDetail,
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (userData) {
      setUserDetail(userData);
    }
  }, [userData]);

  return { userDetail, userLoading, userError, userErrorMessage, setUserDetail };
};

export default useUserDetail;