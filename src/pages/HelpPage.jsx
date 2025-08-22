// src/pages/HelpPage.jsx
import {
  Mail,
  MessageSquare,
  Phone,
  LifeBuoy,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    q: "What is NexEmbed?",
    a: "NexEmbed is a browser-based platform for embedded systems development and simulation.",
  },
  {
    q: "Do I need to install software?",
    a: "No installation required. NexEmbed runs entirely in your browser.",
  },
  {
    q: "Can I use NexEmbed offline?",
    a: "Yes, an offline mode is supported once resources are cached.",
  },
  {
    q: "Is my project data saved?",
    a: "All project data is saved securely with cloud sync options.",
  },
];

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="min-h-screen pt-28 pb-16 bg-black text-gray-100">
      <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* LEFT SIDE */}
        <div className="space-y-10">
          {/* How can we help */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-emerald-800/50 backdrop-blur-xl rounded-2xl border border-emerald-400/20 shadow-lg shadow-emerald-900/30 p-8"
          >
            <h2 className="text-3xl font-bold text-emerald-400 mb-4">
              How can we help?
            </h2>
            <p className="text-gray-300 leading-relaxed">
              Whether you’re just getting started or need advanced guidance,
              we’re here to support your journey with NexEmbed. Explore our
              resources or reach out directly.
            </p>
          </motion.div>

          {/* FAQ */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-emerald-800/50 backdrop-blur-xl rounded-2xl border border-emerald-400/20 shadow-lg shadow-emerald-900/30 p-8"
          >
            <h3 className="text-2xl font-semibold text-emerald-400 mb-6">
              Frequently Asked Questions
            </h3>

            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="border-b border-emerald-400/20 pb-4">
                  <button
                    onClick={() =>
                      setOpenIndex(openIndex === i ? null : i)
                    }
                    className="flex justify-between items-center w-full text-left text-gray-200 hover:text-emerald-400 transition"
                  >
                    <span className="font-medium">{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 transform transition-transform ${
                        openIndex === i ? "rotate-180 text-emerald-400" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {openIndex === i && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-2 text-gray-400 text-sm"
                      >
                        {faq.a}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-10">
          {/* Contact Options */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="bg-emerald-800/50 backdrop-blur-xl rounded-2xl border border-emerald-400/20 shadow-lg shadow-emerald-900/30 p-8"
          >
            <h3 className="text-2xl font-semibold text-emerald-400 mb-6">
              Get in Touch
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { icon: Mail, text: "Email Support" },
                { icon: MessageSquare, text: "Live Chat" },
                { icon: Phone, text: "Call Us" },
                { icon: LifeBuoy, text: "Community Forum" },
              ].map(({ icon: Icon, text }, i) => (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  key={i}
                  className="flex items-center gap-3 p-4 rounded-xl border border-emerald-400/20 bg-[#1a2234]/60 hover:bg-[#1f2a3d]/70 transition cursor-pointer"
                >
                  <Icon className="text-emerald-400 w-6 h-6" />
                  <span className="text-gray-200">{text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Resources */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-emerald-800/50 backdrop-blur-xl rounded-2xl border border-emerald-400/20 shadow-lg shadow-emerald-900/30 p-8"
          >
            <h3 className="text-2xl font-semibold text-emerald-400 mb-6">
              Resources
            </h3>
            <ul className="space-y-3 text-gray-300">
              <li className="hover:text-emerald-400 transition">
                Getting Started Guide
              </li>
              <li className="hover:text-emerald-400 transition">
                Documentation
              </li>
              <li className="hover:text-emerald-400 transition">
                Tutorials & Examples
              </li>
              <li className="hover:text-emerald-400 transition">
                Troubleshooting
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
