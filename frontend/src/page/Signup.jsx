// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { Button, TextInput, Label, Spinner } from "flowbite-react";
// import toast from "react-hot-toast";
// import { Oauth } from "../component";
// import OtpInput from "../component/OtpInput";
// import { HiOutlineArrowLeft } from "react-icons/hi";

// export default function Signup() {
//   const [formData, setFormData] = useState({});
//   const [email, setEmail] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();
//   const API_URL = import.meta.env.VITE_API_URL;

//   const validateForm = () => {
//     if (!formData.username || formData.username.trim().length < 3) {
//       toast.error("Username must be at least 3 characters");
//       return false;
//     }
//     if (!formData.email || !formData.email.trim()) {
//       toast.error("Email is required");
//       return false;
//     }
//     if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       toast.error("Invalid email format");
//       return false;
//     }
//     if (!formData.password || !formData.password.trim()) {
//       toast.error("Password is required");
//       return false;
//     }
//     if (formData.password.length < 8) {
//       toast.error("Password must be at least 8 characters");
//       return false;
//     }
//     return true;
//   };

//   const createNewUser = async () => {
//     setEmail(null);
//     setLoading(true);
//     try {
//       const res = await fetch(`${API_URL}/auth/signup`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(formData),
//       });

//       const data = await res.json();
//       if (!data.success) throw new Error(data.message || "Signup failed");
//       toast.success("Signup successfull");
//       if (data.success) {
//         navigate("/login");
//       }
//     } catch (error) {
//       toast.error(error.message);
//     } finally {
//       setLoading(false);
//       setEmail(null);
//     }
//   };

//   const handleSubmit = async (e) => {
//     setEmail(null);
//     e.preventDefault();
//     const validate = validateForm();

//     if (!validate) {
//       return;
//     }

//     if (!formData.email || !formData.password) {
//       toast.error("Please fill in all fields");
//       return;
//     }

//     try {
//       setLoading(true);
//       const response = await fetch(`${API_URL}/otp/send-otp`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(formData),
//       });

//       const data = await response.json();
//       if (!data.success) throw new Error(data.message || "Signup failed");
//       toast.success(data?.message || "OTP sent successfully");
//       setEmail("done");
//     } catch (error) {
//       toast.error(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleOTPSubmit = async (otp) => {
//     try {
//       setLoading(true);
//       const form = {
//         email: formData.email,
//         otp: otp,
//       };
//       const res = await fetch(`${API_URL}/otp/verify-otp`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(form),
//         credentials: "include",
//       });

//       const data = await res.json();
//       if (!data.success) {
//         toast.error(data?.message || "OTP verification failed");
//         return;
//       }
//       toast.success(data?.message || "OTP verified successfully");
//       setEmail(null);
//       createNewUser();
//     } catch (error) {
//       toast.error(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
//   };

//   const handleBackButton = () => {
//     setEmail(null);
//   };

//   return (
//     <>
//       {email === "done" ? (
//         <div className="min-h-screen flex items-center justify-center bg-gray-50 relative">
//           <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6">
//             <Button
//               type="button"
//               size="xs"
//               outline
//               gradientDuoTone="cyanToBlue"
//               className="w-fit absolute text-xs mt-0 ml-2 left-0"
//               onClick={handleBackButton}
//             >
//               <HiOutlineArrowLeft className="size-4" />
//             </Button>
//             <OtpInput
//               onSubmit={handleOTPSubmit}
//               loading={loading}
//               sendOtp={handleSubmit}
//             />
//           </div>
//         </div>
//       ) : (
//         <div className="h-screen w-full flex justify-center items-center">
//           <div className="flex p-3 w-full sm:w-96 md:w-1/2 lg:w-1/3 xl:w-1/4 border border-slate-200 rounded-lg h-fit">
//             <div className="flex flex-col h-full w-full">
//               <form
//                 className="flex flex-col gap-4 w-full"
//                 onSubmit={handleSubmit}
//               >
//                 <div>
//                   <Label value="Your username" />
//                   <TextInput
//                     type="text"
//                     placeholder="Username"
//                     id="username"
//                     onChange={handleChange}
//                     required
//                   />
//                 </div>
//                 <div>
//                   <Label value="Your email" />
//                   <TextInput
//                     type="email"
//                     placeholder="Email"
//                     id="email"
//                     onChange={handleChange}
//                     required
//                   />
//                 </div>
//                 <div>
//                   <Label value="Your password" />
//                   <TextInput
//                     type="password"
//                     placeholder="Password"
//                     id="password"
//                     onChange={handleChange}
//                     required
//                   />
//                 </div>
//                 <Button gradientDuoTone="greenToBlue" type="submit">
//                   {loading ? (
//                     <>
//                       <Spinner size="sm" className="disabled" />
//                       <span>Loading...</span>
//                     </>
//                   ) : (
//                     "SignUp"
//                   )}
//                 </Button>
//                 <Oauth />
//               </form>
//               <div className="flex gap-2 text-sm mt-5">
//                 <span>Have an account?</span>
//                 <Link to="/login" className="text-blue-500">
//                   Log In
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button, TextInput, Label, Spinner } from "flowbite-react"
import toast from "react-hot-toast"
import { Oauth } from "../component"
import OtpInput from "../component/OtpInput"
import { HiOutlineArrowLeft, HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi"
import logo from "../assets/logo.png";

export default function Signup() {
  const [formData, setFormData] = useState({})
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [email, setEmail] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const API_URL = import.meta.env.VITE_API_URL

  const validateForm = () => {
    if (!formData.username || formData.username.trim().length < 3) {
      toast.error("Username must be at least 3 characters")
      return false
    }
    if (!formData.email || !formData.email.trim()) {
      toast.error("Email is required")
      return false
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Invalid email format")
      return false
    }
    if (!formData.password || !formData.password.trim()) {
      toast.error("Password is required")
      return false
    }
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters")
      return false
    }
    if (!confirmPassword || confirmPassword.trim() === "") {
      toast.error("Please confirm your password")
      return false
    }
    if (formData.password !== confirmPassword) {
      toast.error("Passwords do not match")
      return false
    }
    return true
  }

  const createNewUser = async () => {
    setEmail(null)
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      if (!data.success) throw new Error(data.message || "Signup failed")
      toast.success("Signup successfull")
      if (data.success) {
        navigate("/login")
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
      setEmail(null)
    }
  }

  const handleSubmit = async (e) => {
    setEmail(null)
    e.preventDefault()
    const validate = validateForm()

    if (!validate) {
      return
    }

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields")
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/otp/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (!data.success) throw new Error(data.message || "Signup failed")
      toast.success(data?.message || "OTP sent successfully")
      setEmail("done")
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOTPSubmit = async (otp) => {
    try {
      setLoading(true)
      const form = {
        email: formData.email,
        otp: otp,
      }
      const res = await fetch(`${API_URL}/otp/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
        credentials: "include",
      })

      const data = await res.json()
      if (!data.success) {
        toast.error(data?.message || "OTP verification failed")
        return
      }
      toast.success(data?.message || "OTP verified successfully")
      setEmail(null)
      createNewUser()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() })
  }

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value.trim())
  }

  const handleBackButton = () => {
    setEmail(null)
  }

  const handleLogoClick = () => {
    navigate("/")
  }

  return (
    <>
      {email === "done" ? (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative">
          <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
            <Button
              type="button"
              size="xs"
              outline
              gradientDuoTone="cyanToBlue"
              className="w-fit absolute text-xs mt-0 ml-2 left-0 top-4"
              onClick={handleBackButton}
            >
              <HiOutlineArrowLeft className="size-4" />
            </Button>

            {/* Logo - Clickable */}
            <div className="flex justify-center mb-6">
              <button onClick={handleLogoClick} className="transition-transform hover:scale-105">
                <img
                  className="h-12 w-auto"
                  src={logo}
                  alt="SplitChat"
                  onError={(e) => {
                    e.target.style.display = "none"
                    e.target.nextSibling.style.display = "block"
                  }}
                />
                <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent hidden">
                  SplitChat
                </div>
              </button>
            </div>

            <OtpInput onSubmit={handleOTPSubmit} loading={loading} sendOtp={handleSubmit} />
          </div>
        </div>
      ) : (
        <div className="min-h-screen w-full flex justify-center items-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4">
          <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
            {/* Logo - Clickable */}
            <div className="flex justify-center mb-8">
              <button onClick={handleLogoClick} className="transition-transform hover:scale-105">
                <img
                  className="h-12 w-auto"
                  src={logo}
                  alt="SplitChat"
                  onError={(e) => {
                    e.target.style.display = "none"
                    e.target.nextSibling.style.display = "block"
                  }}
                />
                <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent hidden">
                  SplitChat
                </div>
              </button>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                Create Account
              </h1>
              <p className="text-slate-600">Join SplitChat and start managing expenses with friends</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Username Field */}
              <div>
                <Label value="Username" className="text-slate-700 font-medium mb-2 block" />
                <TextInput
                  type="text"
                  placeholder="Enter your username"
                  id="username"
                  onChange={handleChange}
                  required
                  className="[&>div>input]:bg-white/70 [&>div>input]:border-slate-200 [&>div>input]:rounded-xl [&>div>input]:shadow-sm [&>div>input]:placeholder-slate-400 [&>div>input]:focus:border-emerald-300 [&>div>input]:focus:ring-emerald-200"
                />
              </div>

              {/* Email Field */}
              <div>
                <Label value="Email Address" className="text-slate-700 font-medium mb-2 block" />
                <TextInput
                  type="email"
                  placeholder="Enter your email"
                  id="email"
                  onChange={handleChange}
                  required
                  className="[&>div>input]:bg-white/70 [&>div>input]:border-slate-200 [&>div>input]:rounded-xl [&>div>input]:shadow-sm [&>div>input]:placeholder-slate-400 [&>div>input]:focus:border-emerald-300 [&>div>input]:focus:ring-emerald-200"
                />
              </div>

              {/* Password Field */}
              <div>
                <Label value="Password" className="text-slate-700 font-medium mb-2 block" />
                <div className="relative">
                  <TextInput
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    id="password"
                    onChange={handleChange}
                    required
                    className="[&>div>input]:bg-white/70 [&>div>input]:border-slate-200 [&>div>input]:rounded-xl [&>div>input]:shadow-sm [&>div>input]:placeholder-slate-400 [&>div>input]:focus:border-emerald-300 [&>div>input]:focus:ring-emerald-200 [&>div>input]:pr-12"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <HiOutlineEyeOff className="h-5 w-5" /> : <HiOutlineEye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <Label value="Confirm Password" className="text-slate-700 font-medium mb-2 block" />
                <div className="relative">
                  <TextInput
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    required
                    className="[&>div>input]:bg-white/70 [&>div>input]:border-slate-200 [&>div>input]:rounded-xl [&>div>input]:shadow-sm [&>div>input]:placeholder-slate-400 [&>div>input]:focus:border-emerald-300 [&>div>input]:focus:ring-emerald-200 [&>div>input]:pr-12"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <HiOutlineEyeOff className="h-5 w-5" />
                    ) : (
                      <HiOutlineEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                gradientDuoTone="greenToBlue"
                type="submit"
                className="w-full py-1 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Spinner size="sm" className="disabled" />
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>

              <Oauth />
            </form>

            {/* Sign In Link */}
            <div className="text-center mt-8 pt-6 border-t border-slate-200">
              <p className="text-slate-600">
                Already have an account?{" "}
                <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
