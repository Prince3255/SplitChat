import toast from "react-hot-toast";

export const getMessage = async ({ queryKey }) => {
  const [_, receiverId, groupId] = queryKey;
  const API_URL = import.meta.env.VITE_API_URL
  let url = `${API_URL}/chat/`;
  // if (id !== groupId) url += `?receiverId=${id}`;
  // if (groupId) {
  //     url += `?receiverId=${id}&groupId=${groupId}`
  // }

  // Construct query parameters correctly
  const params = new URLSearchParams();
  if (receiverId) params.append("receiverId", receiverId);
  if (groupId) params.append("groupId", groupId);

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await res.json();

    if (!data.success) {
      if (data.message) toast.error(data.message);
      return { success: false, data: [] };
    } else {
      return data;
    }
  } catch (error) {
    console.log("error", error.message);
    toast.error(error.message);
  }
};
