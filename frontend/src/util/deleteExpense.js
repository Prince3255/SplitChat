import toast from "react-hot-toast";

const deleteExpense = async (expenseId) => {
  const API_URL = import.meta.env.VITE_API_URL
  let url = `${API_URL}/expense/delete/${expenseId}`;

  try {
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ expenseId: expenseId }),
      credentials: "include",
    });
    if (!res.ok) {
      toast.error(res.statusText);
      return;
    }

    const data = await res.json();
    if (!data.success) {
      toast.error(data?.message || 'something went wrong');
      return false;
    } else {
      toast.success(data?.message || "expense deleted successfully");
      return true;
    }
  } catch (error) {
    console.log("error", error.message);
    toast.error(error.message);
  }
};

export default deleteExpense;
