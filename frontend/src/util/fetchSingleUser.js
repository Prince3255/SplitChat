import toast from "react-hot-toast";

const fetchSingleUser = async (id) => {
  try {
    const res = await fetch(`/api/user/${id}`, {
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
      toast(data.message);
      return null;
    } else {
      return data;
    }
  } catch (error) {
    console.log("error", error.message);
    toast.error(error.message);
    return null;
  }
};

export default fetchSingleUser;
