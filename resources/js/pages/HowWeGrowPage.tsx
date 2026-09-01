import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Leaf, Sun, Wind, Thermometer, Sprout, Droplets, ArrowRight } from 'lucide-react'
import SectionHeader from '@/components/ui/SectionHeader'

const practices = [
  {
    icon: Wind,
    title: 'Open-Air Growing',
    desc: 'No greenhouses. Our plants grow outdoors year-round, adapting to wind, rain, and real Tennessee weather.',
  },
  {
    icon: Sun,
    title: 'Natural Hardening',
    desc: 'Exposure to sun and seasonal changes strengthens stems and roots so plants are ready for your backyard from day one.',
  },
  {
    icon: Thermometer,
    title: 'Climate-Ready Stock',
    desc: 'What thrives here in our nursery has already proven it can handle local temperatures, humidity, and soil conditions.',
  },
  {
    icon: Sprout,
    title: 'Healthy Starts',
    desc: 'We grow carefully selected varieties and give them time and space to develop strong root systems before they ever leave our nursery headed to your home.',
  },
]

const reasons = [
  {
    step: '01',
    title: 'Raised in Tennessee, Shipped from Tennessee',
    desc: 'All plants are grown and shipped from right here in Tennessee - nothing drop shipped from somewhere else.',
  },
  {
    step: '02',
    title: 'Built for Your Yard',
    desc: 'Open-air growing means plants are already used to the same kind of conditions they will at home to: the real world conditions and growing zones.',
  },
  {
    step: '03',
    title: 'Proven Before Shipping',
    desc: 'If it grows and is healthy in our yard, it will do the same in yours. That is our standard.',
  },
]

export default function HowWeGrowPage() {
  return (
    <div className="min-h-screen bg-cream-50 pt-20">
      {/* Header */}
      <section className="relative overflow-hidden min-h-[420px] md:min-h-[480px] flex items-center bg-forest-950">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1920&q=80"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-forest-950/55" />
          <div className="absolute inset-0 bg-gradient-to-b from-forest-950/50 via-transparent to-forest-950/70" />
        </div>
        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block text-xs font-sans font-700 text-forest-300 tracking-widest uppercase mb-4 px-3 py-1 bg-forest-800/80 rounded-full border border-forest-700"
          >
            How We Grow
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-700 text-cream-50 text-balance mb-6"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
          >
            Grown for Real Backyards
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-sage-200 text-lg font-body leading-relaxed max-w-2xl mx-auto"
          >
            Every plant we grow is raised outdoors in Tennessee — no greenhouses — so it arrives ready to thrive in your landscape.
          </motion.p>
        </div>
      </section>

      {/* Intro */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="inline-block text-xs font-sans font-700 text-forest-600 tracking-widest uppercase mb-4 px-3 py-1 bg-forest-50 rounded-full border border-forest-200">
                Our Approach
              </span>
              <h2
                className="font-display font-700 text-forest-900 mb-6"
                style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)' }}
              >
                Why Open Air Matters
              </h2>
              <p className="text-forest-700 font-body leading-relaxed mb-4">
                We believe plants grown under glass can look perfect — until they meet the real world. That is why we grow outdoors, in the open air, right here in Tennessee.
              </p>
              <p className="text-sage-600 font-body leading-relaxed mb-6">
                Wind, sun, and seasonal change strengthen each plant so it can settle into your backyard with less shock and more staying power. Our saying is simple: if it grows and is healthy in our backyard, it will do the same in yours.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Leaf, label: 'Open-Air Grown' },
                  { icon: Sun, label: 'Tennessee Hardened' },
                  { icon: Droplets, label: 'Stronger Roots' },
                  { icon: Sprout, label: 'Ready to Thrive' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3 p-3 bg-forest-50 rounded-xl">
                    <item.icon className="w-5 h-5 text-forest-600 shrink-0" />
                    <span className="text-forest-700 text-sm font-sans font-600">{item.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <img
                src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=700&q=80"
                alt="Outdoor nursery growing beds"
                className="w-full h-[480px] object-cover rounded-3xl shadow-2xl"
                loading="lazy"
              />
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-xl">
                <p className="font-sans font-700 text-forest-900 text-2xl">0</p>
                <p className="text-sage-500 text-sm">Greenhouses Used</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Growing practices */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Growing Practices"
            title="How Meadowlark Plants Are Raised"
            subtitle="A few simple commitments that shape every plant we send home with you."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {practices.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="w-12 h-12 rounded-xl bg-forest-50 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-forest-600" />
                </div>
                <h3 className="font-display font-700 text-forest-900 text-xl mb-3">{item.title}</h3>
                <p className="text-sage-600 text-sm font-body leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why it works */}
      <section className="py-20 bg-cream-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="The Difference"
            title="What This Means for Your Garden"
            subtitle="Stronger starts. Less transplant shock. Plants that already know how to live outdoors."
          />
          <div className="grid md:grid-cols-3 gap-8">
            {reasons.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <span
                  className="font-display font-700 text-forest-200 leading-none block mb-4"
                  style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)' }}
                >
                  {item.step}
                </span>
                <h3 className="font-display font-700 text-forest-900 text-xl mb-3">{item.title}</h3>
                <p className="text-sage-600 text-sm font-body leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-forest-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1920&q=60"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-forest-950/60" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block text-xs font-sans font-700 text-forest-300 tracking-widest uppercase mb-4 px-3 py-1 bg-forest-800/80 rounded-full border border-forest-700">
              Ready to Plant?
            </span>
            <h2
              className="font-display font-700 text-cream-50 mb-4"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}
            >
              Bring Home Plants Grown to Belong
            </h2>
            <p className="text-sage-300 text-lg font-body leading-relaxed mb-8 max-w-xl mx-auto">
              Browse our catalog, and read our plant information guide for tips on planting and aftercare.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-forest-500 hover:bg-forest-400 text-white font-sans font-700 rounded-xl transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 focus-ring"
              >
                Shop Plants <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/plant-information"
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-cream-100 font-sans font-600 rounded-xl border border-white/20 transition-colors focus-ring"
              >
                Plant Information
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
