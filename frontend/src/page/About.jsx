import React from "react";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-4xl font-bold text-gray-800 text-center mb-6">
          About SplitChat
        </h1>
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4">Who We Are</h2>
        <p className="text-lg text-gray-600 text-center mb-4">
          Welcome to SplitChat, your go-to platform for seamless expense
          tracking and real-time communication. We believe in making expense
          management simple, transparent, and efficient, whether it's for
          friends, families, roommates, or work teams.
        </p>

        <div className="mt-6">
          <h2 className="text-2xl font-semibold text-gray-700">Our Mission</h2>
          <p className="text-gray-600 mt-2">
            At SplitChat, our mission is to eliminate financial stress by
            providing an intuitive and collaborative solution for tracking
            shared expenses. We strive to help users split, settle, and chat
            effortlessly, ensuring that financial transparency is never a hurdle
            in relationships.
          </p>
        </div>

        <div className="mt-6">
          <h2 className="text-2xl font-semibold text-gray-700">
            Why Choose SplitChat?
          </h2>
          <ul className="list-disc list-inside text-gray-600 mt-2">
            <li>
              Smart Expense Tracking: Easily add and split expenses among
              friends, roommates, or colleagues.
            </li>
            <li>
              Seamless Settlements: Keep track of who owes whom and settle
              payments effortlessly.
            </li>
            <li>
              Integrated Chat System: Communicate with group members in real
              time while managing expenses.
            </li>
            <li>
              User-Friendly Interface: Designed for simplicity and ease of use.
            </li>
            <li>
              Secure & Reliable: Your financial data is safe with us, using the
              latest security protocols.
            </li>
          </ul>
        </div>

        <div className="mt-6">
          <h2 className="text-2xl font-semibold text-gray-700">How It Works</h2>
          <p className="text-gray-600 mt-2">
            1. Create a Group – Add friends, colleagues, or roommates to manage
            expenses together.
            <br />
            2. Add Expenses – Log shared bills, rent, meals, or any other
            expenses.
            <br />
            3. Chat & Discuss – Communicate with group members directly within
            the app.
            <br />
            4. Settle up with built-in payment options and enjoy stress-free
            expense management.
          </p>
        </div>

        <div className="mt-6">
          <h2 className="text-2xl font-semibold text-gray-700">Our Vision</h2>
          <p className="text-gray-600 mt-2">
            We envision a world where financial misunderstandings no longer
            create friction in relationships. Our goal is to empower users with
            a transparent, easy-to-use, and collaborative platform that makes
            managing shared expenses stress-free.
          </p>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-700 text-lg font-medium">
            Start using SplitChat today and experience a hassle-free way to
            split and settle expenses!
          </p>
        </div>
      </div>
    </div>
  );
}