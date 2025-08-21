// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { Button, TextInput, Label, Spinner } from "flowbite-react";
// import toast from "react-hot-toast";
// import { Oauth } from "../component";

// export default function Login() {
//   const [formData, setFormData] = useState({});
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const API_URL = import.meta.env.VITE_API_URL;

//   const navigate = useNavigate();

//   const validateForm = () => {
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
//     return true;
//   };

//   const handleSubmit = async (e) => {
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
//       setError(null);
//       setLoading(true);
//       const res = await fetch(`${API_URL}/auth/login`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         credentials: "include",
//         body: JSON.stringify(formData),
//       });
//       const data = await res.json();
//       if (!data.success) {
//         throw new Error(data.message || "Log in failed");
//       }
//       toast.success("Logged in successfull");
//       if (data.success) {
//         navigate("/tab");
//       }
//     } catch (error) {
//       setError(error.message);
//       console.log(error);
//       toast.error(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
//   };

//   return (
//     <div className="h-screen w-full flex justify-center items-center">
//       <div className="flex p-3 w-full sm:w-96 md:w-1/2 lg:w-1/3 xl:w-1/4 border border-slate-200 rounded-lg h-fit">
//         <div className="flex flex-col h-full w-full">
//           <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
//             <div>
//               <Label value="Your email" />
//               <TextInput
//                 type="email"
//                 placeholder="Email"
//                 id="email"
//                 onChange={handleChange}
//               />
//             </div>
//             <div>
//               <Label value="Your password" />
//               <TextInput
//                 type="password"
//                 placeholder="Password"
//                 id="password"
//                 onChange={handleChange}
//               />
//             </div>
//             <Button gradientDuoTone="greenToBlue" type="submit">
//               {loading ? (
//                 <>
//                   <Spinner size="sm" />
//                   <span>Loading...</span>
//                 </>
//               ) : (
//                 "Log In"
//               )}
//             </Button>
//             <Oauth />
//           </form>
//           <div className="flex gap-2 text-sm mt-5">
//             <span>Don't have an account?</span>
//             <Link to="/signup" className="text-blue-500">
//               Sign Up
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, TextInput, Label, Spinner } from "flowbite-react";
import toast from "react-hot-toast";
import { Oauth } from "../component";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import logo from "../assets/logo.png";

export default function Login() {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  const navigate = useNavigate();

  const validateForm = () => {
    if (!formData.email || !formData.email.trim()) {
      toast.error("Email is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Invalid email format");
      return false;
    }
    if (!formData.password || !formData.password.trim()) {
      toast.error("Password is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validate = validateForm();

    if (!validate) {
      return;
    }

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setError(null);
      setLoading(true);
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "Log in failed");
      }
      toast.success("Logged in successfull");
      if (data.success) {
        navigate("/tab");
      }
    } catch (error) {
      setError(error.message);
      console.log(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <button
            onClick={handleLogoClick}
            className="transition-transform hover:scale-105"
          >
            <img
              className="h-12 w-auto"
              src={logo}
              alt="SplitChat"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "block";
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
            Welcome Back
          </h1>
          <p className="text-slate-600">Sign in to your SplitChat account</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Email Field */}
          <div>
            <Label
              value="Email Address"
              className="text-slate-700 font-medium mb-2 block"
            />
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
            <div className="flex justify-between items-center mb-2">
              <Label value="Password" className="text-slate-700 font-medium" />
            </div>
            <div className="relative">
              <TextInput
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
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
                {showPassword ? (
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
                <Spinner size="sm" />
                <span>Signing In...</span>
              </div>
            ) : (
              "Sign In"
            )}
          </Button>

          <Oauth />
        </form>

        {/* Sign Up Link */}
        <div className="text-center mt-8 pt-6 border-t border-slate-200">
          <p className="text-slate-600">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
