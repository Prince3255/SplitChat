import toast from "react-hot-toast";

const searchUsersApi = async (searchTerm) => {
  const API_URL = import.meta.env.VITE_API_URL
  try {
    const res = await fetch(
      `${API_URL}/user/search?query=${encodeURIComponent(searchTerm)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error("Error searching users:", error.message);
    toast.error("Something went wrong while searching for users.");
    return [];
  }
};

export default searchUsersApi;