import toast from "react-hot-toast";

export const fetchData = async (url, method = "GET", body = null) => {
  try {
    const options = {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const res = await fetch(url, options);
    const data = await res.json();

    if (!res.ok) {
      toast.error(data.message || "Something went wrong");
    }
    
    return data;
  } catch (error) {
    console.error("API Error:", error.message);
    toast.error(error.message);
  }
};

export const groupExpense = async ({ queryKey }) => {
  const [_, userId, groupId] = queryKey;
  const API_URL = import.meta.env.VITE_API_URL
  let url = `${API_URL}/user/${userId}/expense/user`;
  if (groupId) url += `?groupId=${groupId}`;

  return await fetchData(url, "POST");
};

export const settleUpDetail = async ({ queryKey }) => {
  const [_, id] = queryKey;
  const API_URL = import.meta.env.VITE_API_URL
  let url = `${API_URL}/settleup/settle-up`;
  if (id) {
    url += `?groupId=${id}`
  }

  return await fetchData(url, "GET");
};
