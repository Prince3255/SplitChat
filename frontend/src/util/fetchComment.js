import toast from "react-hot-toast";

const fetchComment = async ({ queryKey }) => {
  const [_, postId] = queryKey;

  try {
    const res = await fetch(`/api/comment/getcomment/${postId}`, {
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