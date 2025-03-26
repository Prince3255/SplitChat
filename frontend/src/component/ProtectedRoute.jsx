import { Spinner } from 'flowbite-react'
import React, { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { authenticateState, logoutUserSuccess } from '../redux/user/userSlice'
import Header from './Header'
import Footer from './Footer'

function ProtectedRoute() {
   const [isAuthenticated, setIsAuthenticated] = useState(null)
   const dispatch = useDispatch()
   const API_URL = import.meta.env.VITE_API_URL

   useEffect(() => {
    const verifyUser = async () => {
        try {
            const res = await fetch(`${API_URL}/auth/verify`, {
                method: 'GET',
                credentials: 'include'
            })
            const data = await res.json()
            setIsAuthenticated(data.success)
            if (data.success) {
                dispatch(authenticateState(data.user))
            }
            else {
                dispatch(logoutUserSuccess())
                setIsAuthenticated(false)
            }
        } catch (error) {
            dispatch(logoutUserSuccess())
            setIsAuthenticated(false)
            console.log('Unauthorized')
        }
    }

    verifyUser()
   }, [])

   if (isAuthenticated === null) {
    return <div className='flex justify-center items-center w-full min-h-screen'>
        <Spinner size='lg' className='disabled' />
    </div>
   }
    
   return isAuthenticated ? (
    <>
        <Header />
        <main>
            <Outlet />
        </main>
        <Footer />
    </>
    ) : (
        <Navigate to='/login' />
    )
}

export default ProtectedRoute