import toast from "react-hot-toast";

const deleteSettleUp = async (settlupid) => {
  const API_URL = import.meta.env.VITE_API_URL
  let url = `${API_URL}/settleup/delete/${settlupid}`;

  try {
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ settlupid: settlupid }),
      credentials: "include",
    });
    
    const data = await res.json();
    
    if (!data.success) {
      toast.error(data?.message || "something went wrong");
      return false;
    } else {
      toast.success(data?.message || "settlement deleted successfully");
      return true;
    }
  } catch (error) {
    console.log("error", error.message);
    toast.error(error.message);
  }
};

export default deleteSettleUp;
