import {
  FaUsers,
  FaCalculator,
  FaComments,
  FaVideo,
  FaMobile,
  FaCheckCircle,
  FaArrowRight,
  FaStar,
  FaBars,
  FaTimes,
} from "react-icons/fa"
import { HiOutlineUsers, HiOutlineCurrencyDollar, HiOutlineChat } from "react-icons/hi"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import logo from "../assets/logo.png";

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const features = [
    {
      icon: <FaCalculator className="w-8 h-8" />,
      title: "Automated Expense Splitting",
      description:
        "Record expenses effortlessly and let the app do the math. No more manual calculations or confusion about who owes what.",
    },
    {
      icon: <FaCheckCircle className="w-8 h-8" />,
      title: "Easy Settlements",
      description:
        "Once your friends settle up, SplitChat updates your overall balance automatically. Keep track of all transactions seamlessly.",
    },
    {
      icon: <FaComments className="w-8 h-8" />,
      title: "Integrated Communication",
      description:
        "Enjoy individual and group chatting with text, audio, image, and video messages. Stay connected with your group.",
    },
    {
      icon: <FaVideo className="w-8 h-8" />,
      title: "Video Calls",
      description:
        "Make one-on-one video calls directly within the app. Discuss expenses and settlements face-to-face.",
    },
    {
      icon: <FaMobile className="w-8 h-8" />,
      title: "Responsive Design",
      description:
        "Fully optimized for a smooth experience across all devices. Use SplitChat on your phone, tablet, or desktop.",
    },
    {
      icon: <FaUsers className="w-8 h-8" />,
      title: "Group Management",
      description:
        "Create and manage multiple groups for different occasions. Keep your expenses organized by context.",
    },
  ]

  const howItWorks = [
    {
      step: "1",
      title: "Create a Group",
      description: "Start by creating a group and inviting your friends for your trip or shared expenses.",
    },
    {
      step: "2",
      title: "Add Expenses",
      description: "Simply add any expense and SplitChat will automatically calculate each person's share.",
    },
    {
      step: "3",
      title: "Track Balances",
      description: "See who owes what at a glance. All balances are updated in real-time.",
    },
    {
      step: "4",
      title: "Settle Up",
      description: "When payments are made, mark them as settled and watch the balances adjust automatically.",
    },
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      text: "SplitChat made our group trip so much easier! No more awkward conversations about money.",
      rating: 5,
    },
    {
      name: "Mike Chen",
      text: "The automatic splitting feature is a game-changer. I love how simple it is to use.",
      rating: 5,
    },
    {
      name: "Emily Davis",
      text: "Finally, an app that combines expense tracking with communication. Perfect for our friend group!",
      rating: 5,
    },
  ]

  const navigate = useNavigate()

  const handleGetStarted = () => {
    navigate("/signup")
  }

  const handleSignIn = () => {
    navigate("/login")
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleClick = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="bg-slate-50 shadow-lg mb-1 sticky top-0 z-50 border-b rounded-lg border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <img
                className="h-12 w-auto sm:h-16"
                src={logo}
                alt="SplitChat"
                onError={(e) => {
                  e.target.style.display = "none"
                  e.target.nextSibling.style.display = "block"
                }}
              />
              <span className="ml-2 text-xl sm:text-2xl font-bold text-green-600 hidden" style={{ display: "none" }}>
                SplitChat
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {/* <button
                onClick={() => navigate("/features")}
                className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                Features
              </button>
              <button
                onClick={() => navigate("/about")}
                className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                About
              </button>
              <button
                onClick={() => navigate("/contact")}
                className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                Contact
              </button> */}
              <button
                onClick={handleSignIn}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors duration-200"
              >
                Login
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button onClick={toggleMenu} className="text-gray-700 hover:text-green-600 p-2">
                {isMenuOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-200">
              <div className="px-2 pt-2 pb-3 space-y-1 bg-white">
                <button
                  onClick={() => {
                    navigate("/features")
                    setIsMenuOpen(false)
                  }}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                >
                  Features
                </button>
                <button
                  onClick={() => {
                    navigate("/about")
                    setIsMenuOpen(false)
                  }}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                >
                  About
                </button>
                <button
                  onClick={() => {
                    navigate("/contact")
                    setIsMenuOpen(false)
                  }}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                >
                  Contact
                </button>
                <button
                  onClick={() => {
                    handleSignIn()
                    setIsMenuOpen(false)
                  }}
                  className="block w-full text-left px-3 py-2 text-base font-medium bg-green-600 text-white hover:bg-green-700 rounded-md transition-colors duration-200 mt-2"
                >
                  Login
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
              Split Expenses,
              <span className="text-green-600"> Stay Connected</span>
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto">
              Imagine you're on a trip with friends and you want to avoid the hassle of manually tracking who paid what.
              With SplitChat, you just add your expense and the app automatically splits the cost among your group.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleGetStarted}
                className="bg-green-600 hover:bg-green-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-lg font-semibold transition-colors duration-200 flex items-center gap-2"
              >
                Get Started Free
                <FaArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleSignIn}
                className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-lg font-semibold transition-colors duration-200"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* What is SplitChat Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
              What is SplitChat?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-4xl mx-auto">
              SplitChat is the ultimate solution for group expense management with integrated communication. When
              payments are made, it adjusts the overall balance seamlessly, making group financial management
              effortless.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center p-6 sm:p-8 bg-green-50 rounded-xl">
              <HiOutlineCurrencyDollar className="w-12 h-12 sm:w-16 sm:h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Smart Splitting</h3>
              <p className="text-gray-600">
                Automatically calculate and split expenses among group members with precision.
              </p>
            </div>
            <div className="text-center p-6 sm:p-8 bg-blue-50 rounded-xl">
              <HiOutlineChat className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Stay Connected</h3>
              <p className="text-gray-600">Chat, share media, and make video calls without leaving the app.</p>
            </div>
            <div className="text-center p-6 sm:p-8 bg-purple-50 rounded-xl">
              <HiOutlineUsers className="w-12 h-12 sm:w-16 sm:h-16 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Group Management</h3>
              <p className="text-gray-600">
                Organize multiple groups for different occasions and track everything separately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">Key Features</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage group expenses and stay connected with your friends.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 sm:p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="text-green-600 mb-4">{feature.icon}</div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">How It Works</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Get started with SplitChat in just four simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
              What Our Users Say
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of happy users who have simplified their group expenses with SplitChat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 sm:p-8 rounded-xl shadow-sm">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="w-5 h-5 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
                <p className="font-semibold text-gray-900">{testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
            Ready to Simplify Your Group Expenses?
          </h2>
          <p className="text-lg sm:text-xl text-green-100 mb-6 sm:mb-8 max-w-3xl mx-auto">
            Join SplitChat today and experience the easiest way to manage group expenses with integrated communication.
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-white text-green-600 hover:bg-gray-100 px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-lg font-semibold transition-colors duration-200 inline-flex items-center gap-2"
          >
            Start Your Free Account
            <FaArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Enhanced Footer with Logo */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-1 md:col-span-2">
              {/* Logo in Footer */}
              <div className="flex items-center mb-4">
                <button onClick={handleClick}>
                <img
                  className="h-8 w-auto sm:h-16"
                  src={logo}
                  alt="SplitChat"
                  onError={(e) => {
                    e.target.style.display = "none"
                    e.target.nextSibling.style.display = "block"
                  }}
                />
                <span className="ml-2 text-xl sm:text-2xl font-bold text-green-400 hidden" style={{ display: "none" }}>
                  SplitChat
                </span>
                </button>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                The ultimate solution for group expense management with integrated communication. Simplify your
                financial relationships today.
              </p>
              <div className="flex space-x-4">
                <button className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </button>
                <button className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </button>
                <button className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </button>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => navigate("/about")}
                    className="text-gray-400 hover:text-white transition-colors text-left"
                  >
                    About
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/features")}
                    className="text-gray-400 hover:text-white transition-colors text-left"
                  >
                    Features
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/")}
                    className="text-gray-400 hover:text-white transition-colors text-left"
                  >
                    Pricing
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/contact")}
                    className="text-gray-400 hover:text-white transition-colors text-left"
                  >
                    Contact
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => navigate("/help")}
                    className="text-gray-400 hover:text-white transition-colors text-left"
                  >
                    Help Center
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/privacy")}
                    className="text-gray-400 hover:text-white transition-colors text-left"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/terms")}
                    className="text-gray-400 hover:text-white transition-colors text-left"
                  >
                    Terms of Service
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">© 2025 SplitChat. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
