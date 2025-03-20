import toast from "react-hot-toast";

const fetchComment = async ({ queryKey }) => {
  const [_, postId] = queryKey;
  const API_URL = import.meta.env.VITE_API_URL

  try {
    const res = await fetch(`${API_URL}/comment/getcomment/${postId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!res.ok) {
      toast.error(res.statusText);
      return;
    }

    const data = await res.json();

    if (!data.success) {
      toast.error(data.message);
      return { success: false, data: [] };
    } else {
      return data;
    }
  } catch (error) {
    console.log("error", error.message);
    toast.error(error.message);
  }
};





export default fetchComment;