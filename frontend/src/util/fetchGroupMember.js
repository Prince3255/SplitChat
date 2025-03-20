import toast from "react-hot-toast";

const fetchGroupMember = async (groupId) => {
  try {
    const res = await fetch(`/api/group/${groupId}/member`, {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!res.ok) {
      toast.error("Something went wrong");
      return;
    }

    const data = await res.json();

    if (!data.success) {
      toast(data.message);
      return { success: false, data: [] };
    } else {
      return data;
    }
  } catch (error) {
    console.log("error", error.message);
    toast.error(error.message);
  }
};

export default fetchGroupMember;