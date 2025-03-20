import toast from "react-hot-toast";

export const fetchGroupDetail = async ({ queryKey }) => {
    const [_, id] = queryKey;
    let url = `/api/group/${id}/detail`;
  
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