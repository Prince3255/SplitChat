import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, TextInput, Label, Spinner } from "flowbite-react";
import toast from "react-hot-toast";
import { Oauth } from "../component";
import OtpInput from "../component/OtpInput";

export default function Signup() {
  const [formData, setFormData] = useState({});
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const validateForm = () => {
    if (!formData.username || formData.username.trim().length < 3) {
      toast.error("Username must be at least 3 characters");
      return false;
    }
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
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return false;
    }
    return true;
  };

  const createNewUser = async () => {
    setEmail(null)
    setLoading(true);
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Signup failed");
      toast.success("Signup successfull");
      if (data.success) {
        navigate("/login");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
      setEmail(null);
    }
  };

  const handleSubmit = async (e) => {
    setEmail(null)
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
      setLoading(true);
      const response = await fetch(`${API_URL}/otp/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.message || "Signup failed");
      toast.success(data?.message || "OTP sent successfully");
      setEmail("done");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (otp) => {
    try {
      setLoading(true);
      const form = {
        email: formData.email,
        otp: otp,
      };
      const res = await fetch(`${API_URL}/otp/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
        credentials: 'include'
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "OTP verification failed");
      }
      toast.success(data.message || "OTP verified successfully");
      createNewUser();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
      setEmail(null);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };

  const handleBackButton = () => {
    setEmail(null)
  }

  return (
    <>
      {email === "done" ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 relative">
          <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6">
            <OtpInput onSubmit={handleOTPSubmit} loading={loading} sendOtp={handleSubmit} handleBackButton={handleBackButton} />
          </div>
        </div>
      ) : (
        <div className="h-screen w-full flex justify-center items-center">
          <div className="flex p-3 w-full sm:w-96 md:w-1/2 lg:w-1/3 xl:w-1/4 border border-slate-200 rounded-lg h-fit">
            <div className="flex flex-col h-full w-full">
              <form
                className="flex flex-col gap-4 w-full"
                onSubmit={handleSubmit}
              >
                <div>
                  <Label value="Your username" />
                  <TextInput
                    type="text"
                    placeholder="Username"
                    id="username"
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label value="Your email" />
                  <TextInput
                    type="email"
                    placeholder="Email"
                    id="email"
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label value="Your password" />
                  <TextInput
                    type="password"
                    placeholder="Password"
                    id="password"
                    onChange={handleChange}
                    required
                  />
                </div>
                <Button gradientDuoTone="greenToBlue" type="submit">
                  {loading ? (
                    <>
                      <Spinner size="sm" className="disabled" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    "SignUp"
                  )}
                </Button>
                <Oauth />
              </form>
              <div className="flex gap-2 text-sm mt-5">
                <span>Have an account?</span>
                <Link to="/login" className="text-blue-500">
                  Log In
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
