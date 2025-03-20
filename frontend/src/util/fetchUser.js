import fetchSingleUser from "./fetchSingleUser";

const fetchUser = async ({ queryKey }) => {
  const [_, id] = queryKey;

  return await fetchSingleUser(id)
};

export default fetchUser