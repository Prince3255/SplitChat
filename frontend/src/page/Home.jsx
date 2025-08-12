import {
  FaUsers,
  FaCalculator,
  FaComments,
  FaVideo,
  FaMobile,
  FaCheckCircle,
  FaArrowRight,
  FaStar,
} from "react-icons/fa";
import {
  HiOutlineUsers,
  HiOutlineCurrencyDollar,
  HiOutlineChat,
} from "react-icons/hi";
import { useNavigate } from "react-router-dom";

const Home = () => {
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
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Create a Group",
      description:
        "Start by creating a group and inviting your friends for your trip or shared expenses.",
    },
    {
      step: "2",
      title: "Add Expenses",
      description:
        "Simply add any expense and SplitChat will automatically calculate each person's share.",
    },
    {
      step: "3",
      title: "Track Balances",
      description:
        "See who owes what at a glance. All balances are updated in real-time.",
    },
    {
      step: "4",
      title: "Settle Up",
      description:
        "When payments are made, mark them as settled and watch the balances adjust automatically.",
    },
  ];

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
  ];

  const navigate = useNavigate()

  const handleGetStarted = () => {
    navigate('/signup')
  };

  const handleSignIn = () => {
    navigate('/login')
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
              Split Expenses,
              <span className="text-green-600"> Stay Connected</span>
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto">
              Imagine you're on a trip with friends and you want to avoid the
              hassle of manually tracking who paid what. With SplitChat, you
              just add your expense and the app automatically splits the cost
              among your group.
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
              SplitChat is the ultimate solution for group expense management
              with integrated communication. When payments are made, it adjusts
              the overall balance seamlessly, making group financial management
              effortless.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center p-6 sm:p-8 bg-green-50 rounded-xl">
              <HiOutlineCurrencyDollar className="w-12 h-12 sm:w-16 sm:h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                Smart Splitting
              </h3>
              <p className="text-gray-600">
                Automatically calculate and split expenses among group members
                with precision.
              </p>
            </div>
            <div className="text-center p-6 sm:p-8 bg-blue-50 rounded-xl">
              <HiOutlineChat className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                Stay Connected
              </h3>
              <p className="text-gray-600">
                Chat, share media, and make video calls without leaving the app.
              </p>
            </div>
            <div className="text-center p-6 sm:p-8 bg-purple-50 rounded-xl">
              <HiOutlineUsers className="w-12 h-12 sm:w-16 sm:h-16 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                Group Management
              </h3>
              <p className="text-gray-600">
                Organize multiple groups for different occasions and track
                everything separately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
              Key Features
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage group expenses and stay connected
              with your friends.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 sm:p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="text-green-600 mb-4">{feature.icon}</div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
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
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
              How It Works
            </h2>
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
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>
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
              Join thousands of happy users who have simplified their group
              expenses with SplitChat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-6 sm:p-8 rounded-xl shadow-sm"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="w-5 h-5 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "{testimonial.text}"
                </p>
                <p className="font-semibold text-gray-900">
                  {testimonial.name}
                </p>
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
            Join SplitChat today and experience the easiest way to manage group
            expenses with integrated communication.
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

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-xl sm:text-2xl font-bold mb-4">SplitChat</h3>
              <p className="text-gray-400 mb-4">
                The ultimate solution for group expense management with
                integrated communication.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <button className="text-gray-400 hover:text-white transition-colors text-left">
                    About
                  </button>
                </li>
                <li>
                  <button className="text-gray-400 hover:text-white transition-colors text-left">
                    Features
                  </button>
                </li>
                <li>
                  <button className="text-gray-400 hover:text-white transition-colors text-left">
                    Pricing
                  </button>
                </li>
                <li>
                  <button className="text-gray-400 hover:text-white transition-colors text-left">
                    Contact
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li>
                  <button className="text-gray-400 hover:text-white transition-colors text-left">
                    Help Center
                  </button>
                </li>
                <li>
                  <button className="text-gray-400 hover:text-white transition-colors text-left">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button className="text-gray-400 hover:text-white transition-colors text-left">
                    Terms of Service
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 SplitChat. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
