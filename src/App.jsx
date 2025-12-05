import { useState, useRef } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { Zap, Activity, Brain, Heart, Shield, Check, X } from 'lucide-react'
import './App.css'

// Scroll reveal animation component
function ScrollReveal({ children, delay = 0 }) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-100px" })

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] }}
        >
            {children}
        </motion.div>
    )
}

function App() {
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const heroRef = useRef(null)
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"]
    })

    const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0])
    const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        setStatus('')

        try {
            await fetch('https://script.google.com/macros/s/AKfycbzxK9ODcgxUgFElQCbVlFYqg2VcuXLe4pMfnTkmmOC_SX61z_8xEQebRSK7QRCR6w8/exec', {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })

            setStatus('success')
            setEmail('')
        } catch (error) {
            setStatus('error')
        } finally {
            setIsSubmitting(false)
        }
    }

    const pillars = [
        {
            icon: Zap,
            title: "Metabolic",
            subtitle: "The Engine",
            description: "Mitochondrial efficiency and visceral fat control."
        },
        {
            icon: Activity,
            title: "Physical",
            subtitle: "The Chassis",
            description: "Muscle density and structural integrity."
        },
        {
            icon: Brain,
            title: "Cognitive",
            subtitle: "The Processor",
            description: "Neuroplasticity and focus."
        },
        {
            icon: Heart,
            title: "Hormonal",
            subtitle: "The Chemistry",
            description: "Cortisol regulation and drive."
        },
        {
            icon: Shield,
            title: "Immunity",
            subtitle: "The Shield",
            description: "Inflammation control and defense."
        }
    ]

    return (
        <div className="bg-ice-grey relative">
            {/* Grain Overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay z-50"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' /%3E%3C/svg%3E")' }} />

            {/* HERO SECTION */}
            <section ref={heroRef} className="min-h-screen relative overflow-hidden">
                {/* Parallax Background */}
                <motion.div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: 'url(/hero-bg.jpg)',
                        opacity: heroOpacity,
                        scale: heroScale
                    }}
                />

                {/* Dark overlay for better text contrast */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-ice-grey" />

                {/* HUD Elements */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute top-8 left-8 font-space text-xs text-charcoal/60 tracking-wider z-20"
                >
                    SYSTEM_ONLINE
                </motion.div>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="absolute top-8 right-8 font-space text-xs text-charcoal/60 tracking-wider z-20"
                >
                    v2.0.1_BETA
                </motion.div>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="absolute bottom-8 left-8 font-space text-xs text-charcoal/60 tracking-wider z-20"
                >
                    SECURE_CONNECTION
                </motion.div>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="absolute bottom-8 right-8 font-space text-xs text-charcoal/60 tracking-wider z-20"
                >
                    ENCRYPTED
                </motion.div>

                {/* Main Content */}
                <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-2xl w-full"
                    >
                        {/* Glassmorphism Card */}
                        <div className="backdrop-blur-xl bg-white/40 rounded-3xl p-12 shadow-2xl border border-white/50">
                            {/* Logo/Brand */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-center mb-8"
                            >
                                <h1 className="font-playfair text-6xl md:text-7xl font-bold text-charcoal mb-4">
                                    Luvo
                                </h1>
                                <div className="h-1 w-24 bg-holo-blue mx-auto rounded-full" />
                            </motion.div>

                            {/* Headline */}
                            <motion.h2
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="font-playfair text-4xl md:text-5xl text-charcoal text-center mb-4"
                            >
                                Biological Clarity.
                            </motion.h2>

                            {/* Subhead */}
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="font-inter text-xl text-charcoal/90 text-center mb-10 leading-relaxed"
                            >
                                The Operating System for your Biology.
                            </motion.p>

                            {/* Description */}
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="font-inter text-lg text-charcoal/80 text-center mb-10 leading-relaxed"
                            >
                                Your Digital Twin is coming. Be among the first to experience
                                personalized health insights powered by advanced AI and real-time
                                biological data.
                            </motion.p>

                            {/* Email Form */}
                            <motion.form
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                onSubmit={handleSubmit}
                                className="space-y-4"
                            >
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    required
                                    className="w-full px-6 py-4 rounded-xl bg-white/60 border-2 border-holo-blue/30 
                           focus:border-holo-blue focus:outline-none font-inter text-charcoal
                           placeholder:text-charcoal/40 transition-all duration-300"
                                />

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full px-6 py-4 rounded-xl bg-holo-blue hover:bg-holo-blue/90 
                           text-charcoal font-space font-bold tracking-wider uppercase
                           transition-all duration-300 transform hover:scale-[1.02]
                           disabled:opacity-50 disabled:cursor-not-allowed
                           shadow-lg hover:shadow-xl"
                                >
                                    {isSubmitting ? 'Joining...' : 'Request Access'}
                                </button>

                                {status === 'success' && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-center text-green-600 font-inter"
                                    >
                                        ✓ You're on the list! Check your email.
                                    </motion.p>
                                )}

                                {status === 'error' && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-center text-red-600 font-inter"
                                    >
                                        Something went wrong. Please try again.
                                    </motion.p>
                                )}
                            </motion.form>

                            {/* Footer Note */}
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                className="text-center text-charcoal/50 text-sm font-inter mt-8"
                            >
                                Limited beta spots available • Launching Q1 2026
                            </motion.p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* THE PROBLEM SECTION */}
            <section className="min-h-screen flex items-center justify-center px-4 py-24 relative">
                <div className="max-w-6xl w-full">
                    <ScrollReveal>
                        <h2 className="font-playfair text-5xl md:text-7xl text-charcoal text-center mb-12 leading-tight">
                            Medicine creates a file.<br />
                            We create a simulation.
                        </h2>
                    </ScrollReveal>

                    <ScrollReveal delay={0.2}>
                        <p className="font-inter text-xl md:text-2xl text-charcoal/80 text-center mb-16 max-w-4xl mx-auto leading-relaxed">
                            Traditional medicine waits for you to break. Luvo predicts the fracture.
                            We use your bloodwork, wearables, and DNA to build a living digital model of your health.
                        </p>
                    </ScrollReveal>

                    <ScrollReveal delay={0.4}>
                        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            {/* Standard Care Card */}
                            <div className="backdrop-blur-xl bg-white/30 rounded-2xl p-8 border border-white/40 relative overflow-hidden">
                                <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                                    <X className="w-5 h-5 text-red-600" />
                                </div>
                                <h3 className="font-space text-sm tracking-wider text-charcoal/60 mb-2 uppercase">Standard Care</h3>
                                <h4 className="font-playfair text-3xl text-charcoal mb-4">Reactive</h4>
                                <ul className="space-y-3 font-inter text-charcoal/70">
                                    <li>• Annual checkups</li>
                                    <li>• Symptom-based treatment</li>
                                    <li>• Generic protocols</li>
                                    <li>• Waiting for problems</li>
                                </ul>
                            </div>

                            {/* Luma Twin Card */}
                            <div className="backdrop-blur-xl bg-white/50 rounded-2xl p-8 border-2 border-holo-blue/50 relative overflow-hidden shadow-xl">
                                <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-holo-blue/30 flex items-center justify-center">
                                    <Check className="w-5 h-5 text-holo-blue" />
                                </div>
                                <h3 className="font-space text-sm tracking-wider text-charcoal/60 mb-2 uppercase">Luvo Twin</h3>
                                <h4 className="font-playfair text-3xl text-charcoal mb-4">Predictive</h4>
                                <ul className="space-y-3 font-inter text-charcoal/90 font-medium">
                                    <li>• Continuous monitoring</li>
                                    <li>• Predictive modeling</li>
                                    <li>• Personalized protocols</li>
                                    <li>• Preventing problems</li>
                                </ul>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* THE 5 PILLARS SECTION */}
            <section className="min-h-screen flex items-center justify-center px-4 py-24">
                <div className="max-w-7xl w-full">
                    <ScrollReveal>
                        <h2 className="font-playfair text-5xl md:text-7xl text-charcoal text-center mb-6">
                            Total System Optimization.
                        </h2>
                    </ScrollReveal>

                    <ScrollReveal delay={0.2}>
                        <p className="font-inter text-xl text-charcoal/70 text-center mb-16 max-w-3xl mx-auto">
                            Your body is a complex system. We optimize all five pillars simultaneously.
                        </p>
                    </ScrollReveal>

                    {/* Bento Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pillars.map((pillar, index) => {
                            const Icon = pillar.icon
                            return (
                                <ScrollReveal key={pillar.title} delay={0.1 * index}>
                                    <motion.div
                                        whileHover={{ scale: 1.02, borderColor: 'rgba(160, 196, 255, 0.8)' }}
                                        transition={{ duration: 0.3 }}
                                        className="backdrop-blur-xl bg-white/40 rounded-2xl p-8 border border-white/40 
                             hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                                    >
                                        <div className="w-14 h-14 rounded-xl bg-holo-blue/20 flex items-center justify-center mb-6 
                                  group-hover:bg-holo-blue/30 transition-colors duration-300">
                                            <Icon className="w-7 h-7 text-holo-blue" />
                                        </div>

                                        <h4 className="font-space text-xs tracking-wider text-charcoal/60 mb-2 uppercase">
                                            {pillar.subtitle}
                                        </h4>

                                        <h3 className="font-playfair text-3xl text-charcoal mb-4">
                                            {pillar.title}
                                        </h3>

                                        <p className="font-inter text-charcoal/70 leading-relaxed">
                                            {pillar.description}
                                        </p>
                                    </motion.div>
                                </ScrollReveal>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* THE SIMULATION LOGIC SECTION */}
            <section className="min-h-screen flex items-center justify-center px-4 py-24">
                <div className="max-w-6xl w-full">
                    <ScrollReveal>
                        <h2 className="font-playfair text-5xl md:text-7xl text-charcoal text-center mb-12">
                            We test on your Twin,<br />not you.
                        </h2>
                    </ScrollReveal>

                    <ScrollReveal delay={0.2}>
                        <p className="font-inter text-xl md:text-2xl text-charcoal/80 text-center mb-16 max-w-4xl mx-auto leading-relaxed">
                            Stop guessing with supplements. We simulate how your body reacts to peptides
                            before you take a single dose.
                        </p>
                    </ScrollReveal>

                    {/* Flow Diagram */}
                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <ScrollReveal delay={0.3}>
                            <div className="backdrop-blur-xl bg-white/40 rounded-2xl p-8 border border-white/40 text-center">
                                <div className="w-16 h-16 rounded-full bg-holo-blue/20 flex items-center justify-center mx-auto mb-6">
                                    <span className="font-space text-2xl font-bold text-holo-blue">01</span>
                                </div>
                                <h3 className="font-playfair text-2xl text-charcoal mb-4">Ingest Data</h3>
                                <p className="font-inter text-charcoal/70">
                                    Blood biomarkers, wearable metrics, genetic data, and lifestyle inputs.
                                </p>
                            </div>
                        </ScrollReveal>

                        <ScrollReveal delay={0.4}>
                            <div className="backdrop-blur-xl bg-white/40 rounded-2xl p-8 border border-white/40 text-center">
                                <div className="w-16 h-16 rounded-full bg-holo-blue/20 flex items-center justify-center mx-auto mb-6">
                                    <span className="font-space text-2xl font-bold text-holo-blue">02</span>
                                </div>
                                <h3 className="font-playfair text-2xl text-charcoal mb-4">Run Simulations</h3>
                                <p className="font-inter text-charcoal/70">
                                    10,000+ scenarios tested against your unique biological model.
                                </p>
                            </div>
                        </ScrollReveal>

                        <ScrollReveal delay={0.5}>
                            <div className="backdrop-blur-xl bg-white/40 rounded-2xl p-8 border border-white/40 text-center">
                                <div className="w-16 h-16 rounded-full bg-holo-blue/20 flex items-center justify-center mx-auto mb-6">
                                    <span className="font-space text-2xl font-bold text-holo-blue">03</span>
                                </div>
                                <h3 className="font-playfair text-2xl text-charcoal mb-4">Deploy Protocol</h3>
                                <p className="font-inter text-charcoal/70">
                                    Highest probability interventions, personalized to your biology.
                                </p>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            {/* TRUST / FOOTER SECTION */}
            <section className="py-24 px-4">
                <div className="max-w-6xl mx-auto">
                    <ScrollReveal>
                        <div className="backdrop-blur-xl bg-white/40 rounded-3xl p-12 border border-white/50 text-center">
                            {/* Trust Badges */}
                            <div className="flex flex-wrap justify-center gap-8 mb-12">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-holo-blue/20 flex items-center justify-center">
                                        <Shield className="w-6 h-6 text-holo-blue" />
                                    </div>
                                    <span className="font-space text-sm tracking-wider text-charcoal/70">HIPAA COMPLIANT</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-holo-blue/20 flex items-center justify-center">
                                        <Check className="w-6 h-6 text-holo-blue" />
                                    </div>
                                    <span className="font-space text-sm tracking-wider text-charcoal/70">CLIA CERTIFIED LABS</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-holo-blue/20 flex items-center justify-center">
                                        <Heart className="w-6 h-6 text-holo-blue" />
                                    </div>
                                    <span className="font-space text-sm tracking-wider text-charcoal/70">DOCTOR LED</span>
                                </div>
                            </div>

                            {/* Final CTA */}
                            <h2 className="font-playfair text-5xl md:text-6xl text-charcoal mb-8">
                                Build your Twin.
                            </h2>

                            <button
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                className="px-12 py-5 rounded-xl bg-holo-blue hover:bg-holo-blue/90 
                         text-charcoal font-space font-bold tracking-wider uppercase text-lg
                         transition-all duration-300 transform hover:scale-105
                         shadow-2xl hover:shadow-3xl"
                            >
                                Join the Waitlist
                            </button>

                            {/* Footer */}
                            <p className="font-inter text-charcoal/50 text-sm mt-12">
                                © 2025 Luvo Health. All rights reserved.
                            </p>
                        </div>
                    </ScrollReveal>
                </div>
            </section>
        </div>
    )
}

export default App
