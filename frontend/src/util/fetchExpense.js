import toast from "react-hot-toast";

const fetchExpense = async ({ queryKey }) => {
    const [_, expenseId] = queryKey;
    const API_URL = import.meta.env.VITE_API_URL
    let url = `${API_URL}/expense/${expenseId}`;
    
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!res.ok) {
        // toast.error(res.statusText);
        return null
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


export default fetchExpense