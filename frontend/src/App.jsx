import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Home, Contact, Login, Signup, About, Settleup, Expense, Chat, Call } from "./page/index";
import { ProtectedRoute } from "./component/index";
import { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { connectSocket, disconnectSocket } from "./util/socketAction";

const queryClient = new QueryClient();

function App() {
  
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user?.isAuthenticated) {
      dispatch(connectSocket(user?.currentUser?._id));
    }

    return () => {
      disconnectSocket();
    };
  }, [user?.isAuthenticated, dispatch]);


  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/settleup" element={<Settleup />} />
          <Route path="/expense" element={<Expense />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/call" element={<Call />} />
        </Route>

        {!user?.isAuthenticated && <Route path="/signup" element={<Signup />} />}
        {!user?.isAuthenticated && <Route path="/login" element={<Login />} />}

        <Route path="*" element={<Navigate to={user?.isAuthenticated ? "/" : "/login"} />} />
      </Routes>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;