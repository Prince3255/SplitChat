import toast from "react-hot-toast";

export const fetchGroupDetail = async ({ queryKey }) => {
    const [_, id] = queryKey;
    const API_URL = import.meta.env.VITE_API_URL
    let url = `${API_URL}/group/${id}/detail`;
  
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
      if (!res.ok) {
        toast.error(res.statusText);
        return
      }
      
      const data = await res.json();
  
      if (!data.success) {
        toast.error(data.message);
        return { success: false, data: [] }
      } else {
        return data;
      }
    } catch (error) {
      console.log('error', error.message);
      toast.error(error.message)
    }
}