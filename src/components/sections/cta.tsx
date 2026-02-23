"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { ArrowRight } from "lucide-react";

export default function CTA() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            setSubmitted(true);
            setEmail("");
        }
    };

    return (
        <section id="contact" className="relative py-28 lg:py-36 bg-white" ref={ref}>
            <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
                <div className="relative p-10 sm:p-14 lg:p-20 rounded-3xl bg-green-bg overflow-hidden green-pattern">
                    {/* Decorative elements */}
                    <div className="absolute top-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-[100px]" />
                    <div className="absolute bottom-0 right-0 w-60 h-60 bg-white/5 rounded-full blur-[80px]" />

                    <div className="relative max-w-2xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5 }}
                        >
                            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60 mb-4 block">
                                Get Started
                            </span>
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-white"
                        >
                            Ready to become the
                            <br />
                            infrastructure?
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: 0.15 }}
                            className="text-lg text-white/60 max-w-lg mx-auto mb-10 leading-relaxed"
                        >
                            Join the retailers and suppliers building the future of traditional
                            retail in ASEAN.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            {submitted ? (
                                <div className="inline-flex items-center gap-2 px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white">
                                    <span className="text-sm font-medium">
                                        Thank you! We&apos;ll be in touch soon.
                                    </span>
                                </div>
                            ) : (
                                <form
                                    onSubmit={handleSubmit}
                                    className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                                >
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your work email"
                                        required
                                        className="flex-1 px-5 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 transition-all backdrop-blur-sm"
                                    />
                                    <button
                                        type="submit"
                                        className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-primary bg-white rounded-xl hover:bg-white/90 transition-all duration-200 whitespace-nowrap cursor-pointer"
                                    >
                                        Get Early Access
                                        <ArrowRight
                                            size={14}
                                            className="group-hover:translate-x-0.5 transition-transform"
                                        />
                                    </button>
                                </form>
                            )}
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={isInView ? { opacity: 1 } : {}}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="mt-6 text-xs text-white/40"
                        >
                            No credit card required · Free pilot program available
                        </motion.p>
                    </div>
                </div>
            </div>
        </section>
    );
}
