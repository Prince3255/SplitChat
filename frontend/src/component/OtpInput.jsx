import React, { useState, useRef, useEffect } from "react";
import { Button } from "flowbite-react";

const OtpInput = ({ onSubmit, loading, sendOtp }) => {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [time, setTime] = useState(120);
  const inputRefs = useRef([]);
  const buttonRef = useRef(null);

  useEffect(() => {
    let interval;
    if (time > 0) {
      interval = setInterval(() => {
        setTime((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [time]);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  const isOtpComplete = otp.every((digit) => digit !== "");

  const handleChange = (e, index) => {
    const { value } = e.target;

    if (!/^[a-zA-Z0-9]$/.test(value) && value !== "") {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }

    if (value !== "" && index === 5) {
      buttonRef.current.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        inputRefs.current[index - 1].focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }

    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1].focus();
    }

    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");

    if (!/^[a-zA-Z0-9]{1,6}$/.test(pastedData)) {
      return;
    }

    const newOtp = [...otp];
    for (let i = 0; i < Math.min(pastedData.length, 6); i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    if (pastedData.length < 6) {
      inputRefs.current[pastedData.length].focus();
    } else {
      buttonRef.current.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isOtpComplete) {
      onSubmit(otp.join(""));
    }
  };

  const formatTime = () => {
    const minute = Math.floor(time / 60);
    const second = minute % 60;

    return `${minute}:${second.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Enter Verification Code
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col items-center">
          <div className="flex justify-center gap-2 sm:gap-4 mb-6 w-full">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={index === 0 ? handlePaste : null}
                className={`
                  w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold
                  rounded-lg border-2 focus:outline-none transition-all duration-200
                  ${digit ? "border-green-500 bg-green-50" : "border-gray-300"}
                  ${
                    inputRefs.current[index] === document.activeElement
                      ? "border-blue-500 ring-2 ring-blue-200"
                      : "hover:border-gray-400"
                  }
                `}
                aria-label={`Digit ${index + 1} of OTP`}
                autoComplete={index === 0 ? "one-time-code" : "off"}
                inputMode="numeric"
              />
            ))}
          </div>

          <button
            ref={buttonRef}
            type="submit"
            disabled={!isOtpComplete}
            className={`
              w-full py-3 px-6 rounded-lg text-white font-medium transition-all duration-200
              ${
                isOtpComplete
                  ? "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 focus:outline-none"
                  : "bg-gray-400 cursor-not-allowed"
              }
            `}
            aria-label="Verify OTP code"
          >
            {loading ? "Verifying.." : "Verify Code"}
          </button>

          <p className="mt-4 text-sm text-gray-600 text-center">
            Didn't receive the code?
            <button
              type="button"
              className={`ml-1 text-blue-600 hover:text-blue-800 focus:outline-none ${
                time > 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => {
                setOtp(Array(6).fill(""));
                inputRefs.current[0].focus();
                sendOtp(e);
                setTime(120);
              }}
              disabled={time > 0}
            >
              Resend {time > 0 ? `in ${formatTime()} seconds` : `now`}
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default OtpInput;
