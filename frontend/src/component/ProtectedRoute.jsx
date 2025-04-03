// import { Spinner } from 'flowbite-react'
// import React, { useEffect, useState } from 'react'
// import { Navigate, Outlet } from 'react-router-dom'
// import { useDispatch, useSelector } from 'react-redux'
// import { authenticateState, logoutUserSuccess } from '../redux/user/userSlice'
// import Header from './Header'
// import Footer from './Footer'

// function ProtectedRoute() {
//    const [isAuthenticated, setIsAuthenticated] = useState(null)
//    const { isAuthenticated: reduxAuth, currentUser } = useSelector((state) => state.user)
//    const dispatch = useDispatch()
//    const API_URL = import.meta.env.VITE_API_URL

//    useEffect(() => {
//     const verifyUser = async () => {
//         try {
//             const res = await fetch(`${API_URL}/auth/verify`, {
//                 method: 'GET',
//                 credentials: 'include'
//             })
//             const data = await res.json()
//             setIsAuthenticated(data.success)
//             if (data.success) {
//                 dispatch(authenticateState(data.user))
//             }
//             else {
//                 dispatch(logoutUserSuccess())
//                 setIsAuthenticated(false)
//             }
//         } catch (error) {
//             dispatch(logoutUserSuccess())
//             setIsAuthenticated(false)
//             console.log('Unauthorized')
//         }
//     }

//     verifyUser()
//    }, [])

//    if (isAuthenticated === null) {
//     return <div className='flex justify-center items-center w-full min-h-screen'>
//         <Spinner size='lg' className='disabled' />
//     </div>
//    }

//    return isAuthenticated ? (
//     <>
//         <Header />
//         <main>
//             <Outlet />
//         </main>
//         <Footer />
//     </>
//     ) : (
//         <Navigate to='/login' />
//     )
// }

// export default ProtectedRoute

import { Spinner } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { authenticateState, logoutUserSuccess } from "../redux/user/userSlice";
import Header from "./Header";
import Footer from "./Footer";

function ProtectedRoute() {
  const { isAuthenticated: reduxAuth, currentUser } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    let mounted = true;

    const verifyUser = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/verify`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();

        if (mounted) {
          if (data.success) {
            dispatch(authenticateState(data.user));
          } else {
            dispatch(logoutUserSuccess());
          }
          setLoading(false);
        }
      } catch (error) {
        if (mounted) {
          dispatch(logoutUserSuccess());
          console.log("Unauthorized:", error);
          setLoading(false);
        }
      }
    };

    if (reduxAuth === false || !currentUser) {
      verifyUser().catch((err) => {
        if (mounted) {
          console.error("VerifyUser failed:", err);
          setLoading(false);
        }
      });
    } else {
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [reduxAuth, currentUser, dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center w-full min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return reduxAuth ? (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  ) : (
    <Navigate to="/login" replace />
  );
}

export default ProtectedRoute;