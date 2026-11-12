
import React, { useState } from 'react';
import { useFitness } from '../context/FitnessContext';

import {
  HelpCircle,
  Send,
  MessageSquare,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  LifeBuoy,
} from 'lucide-react';

import {
  motion,
  AnimatePresence,
} from 'motion/react';

import { submitSupport } from '../services/supportService';

export const SupportPage: React.FC = () => {
  const { user, showToast } = useFitness();

  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');

  const [category, setCategory] = useState('Support');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does PulseFit calculate my daily calorie and macro targets?',
      a: 'Daily calorie targets are based on your selected fitness goal and target weight. Protein and calorie targets help support your fitness progress.',
    },
    {
      q: 'How does the PDF and CSV report export work?',
      a: 'In the Reports tab, Export as CSV generates an Excel-compatible spreadsheet. Export as PDF uses the browser print engine.',
    },
    {
      q: 'Can I switch between Light and Dark themes?',
      a: 'Yes! PulseFit supports Light and Dark themes through Settings.',
    },
    {
      q: 'Can I toggle between Metric and Imperial?',
      a: 'Yes! Go to Settings and select your preferred measurement system.',
    },
    {
      q: 'Is my fitness data preserved?',
      a: 'Your account and activity data are stored using the application persistence system and backend storage.',
    },
  ];

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!subject.trim() || !message.trim()) {
      showToast('Please fill in subject and message.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await submitSupport({
        subject: subject.trim(),
        message: message.trim(),
        type: category,
      });

      if (response?.status === 'success') {
        setSubmitted(true);

        setSubject('');
        setMessage('');

        showToast(
          'Message Submitted Successfully!',
          'success'
        );
      } else {
        showToast(
          response?.message || 'Failed to submit support message.',
          'error'
        );
      }
    } catch (error: any) {
      console.error('Support submission error:', error);

      const errorMessage =
        error?.response?.data?.message ||
        'Something went wrong. Please try again.';

      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewInquiry = () => {
    setSubmitted(false);
    setSubject('');
    setMessage('');
    setCategory('Support');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">

      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <LifeBuoy className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          Support & Athletic Helpdesk
        </h1>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Submit technical inquiries, report feedback, or explore our knowledge base.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

        {/* Support Form */}
        <div className="md:col-span-7">

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">

            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />

              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Send Us a Message
              </h2>
            </div>

            {submitted ? (

              /* Success Screen */
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/40 text-center space-y-4"
              >
                <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto" />

                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Message Submitted Successfully!
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Your inquiry has been saved successfully.
                  Our support team will review your message shortly.
                </p>

                <button
                  type="button"
                  onClick={handleNewInquiry}
                  className="px-5 py-2 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors"
                >
                  Send Another Inquiry
                </button>
              </motion.div>

            ) : (

              /* Form */
              <form
                onSubmit={handleSubmit}
                className="space-y-4 text-xs"
              >

                {/* Name and Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                      Your Name
                    </label>

                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                      Email Address
                    </label>

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                    />
                  </div>

                </div>

                {/* Category and Subject */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                      Inquiry Category
                    </label>

                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                    >
                      <option value="Support">General Support</option>
                      <option value="Feedback">Feature / Feedback</option>
                      <option value="Bug Report">Technical Bug / Issue</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                      Subject
                    </label>

                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Enter subject"
                      required
                      maxLength={150}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                    />
                  </div>

                </div>

                {/* Message */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Detailed Message
                  </label>

                  <textarea
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your question or feedback..."
                    required
                    maxLength={5000}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-500 resize-y"
                  />
                </div>

                {/* Submit */}
                <motion.button
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Submit Support Request
                    </>
                  )}
                </motion.button>

              </form>
            )}

          </div>
        </div>

        {/* FAQ Section */}
        <div className="md:col-span-5 space-y-4">

          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-cyan-600" />

            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">

            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;

              return (
                <div
                  key={idx}
                  className="rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
                >

                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    <span>{faq.q}</span>

                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-4 pb-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              );
            })}

          </div>
        </div>

      </div>
    </div>
  );
};
