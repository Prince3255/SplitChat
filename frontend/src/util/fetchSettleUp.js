import toast from "react-hot-toast";

const fetchSettleUp = async ({ queryKey }) => {
  const [_, settleUpId] = queryKey;
  let url = `/api/settleup/${settleUpId}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    if (!res.ok) {
      toast.error(res.statusText);
      return null;
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

export default fetchSettleUp;