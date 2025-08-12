import { Button } from 'flowbite-react'
import React from 'react'
import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth'
import { app } from '../firebase'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { AiFillGoogleCircle } from 'react-icons/ai'

export default function Oauth() {
  const auth = getAuth(app)
  const navigate = useNavigate()
  const API_URL = import.meta.env.VITE_API_URL
  
  const handleClick = async () => {
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })
    provider.addScope("profile");


    try {
      const resultFromGoogle = await signInWithPopup(auth, provider)
      const res =  await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          name: resultFromGoogle.user.displayName,
          email: resultFromGoogle.user.email,
          googlePhotoUrl: resultFromGoogle.user.photoURL || 'https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3407.jpg?w=360'
        }),
      })

      const data = await res.json()

      if (!data.success) {
        toast.error(data.message || 'Failed to authenticate with Google');
        return;
      }      

      if (data.success) {
        toast.success(data.message)
        navigate('/tab')
      }
    } catch (error) {
      console.log("error", error)
      toast.error(error.message) // Error while closing the popup of google by client solve left
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center w-full">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="px-3 text-sm text-gray-500">OR</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      <Button
        type="button"
        gradientDuoTone="greenToBlue"
        outline
        onClick={handleClick}
        className='w-full'
      >
        <AiFillGoogleCircle className="w-6 h-6 mr-2" />
        Continue with Google
      </Button>
    </div>
  )
}
