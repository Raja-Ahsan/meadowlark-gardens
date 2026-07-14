import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Leaf, Sun, Droplets, Sprout, CloudSun, Mountain, Waves, ArrowRight } from 'lucide-react'
import SectionHeader from '@/components/ui/SectionHeader'

const tips = [
  {
    step: '01',
    title: 'Choose the Right Plant',
    desc: 'Consider your light, soil, and moisture conditions. Native and regionally adapted plants need less water and care once established, and they support local pollinators.',
  },
  {
    step: '02',
    title: 'Plant With Care',
    desc: 'Dig a hole roughly twice as wide as the root ball and just as deep. Gently loosen the roots, set the crown at soil level, backfill, and water thoroughly.',
  },
  {
    step: '03',
    title: 'Mulch & Protect',
    desc: 'Mulch around the base to retain moisture and regulate soil temperature. Keep mulch clear of the stem so the plant can breathe and stay healthy.',
  },
  {
    step: '04',
    title: 'Aftercare',
    desc: 'Water regularly for the first few weeks while roots establish. Avoid overwatering — most plants prefer soil that drains well. Check each product page for sun, water, and hardiness tips.',
  },
]

const conditions = [
  {
    icon: CloudSun,
    title: 'Sunlight',
    items: [
      'Full sun: 6+ hours of direct light',
      'Part shade: morning sun or filtered light',
      'Full shade: little to no direct sun',
    ],
  },
  {
    icon: Mountain,
    title: 'Soil',
    items: [
      'Well-drained soil prevents root rot',
      'Amend heavy clay with compost',
      'Match plant preferences to your soil type',
    ],
  },
  {
    icon: Waves,
    title: 'Water',
    items: [
      'Water deeply, then let soil dry slightly',
      'New plantings need steady moisture',
      'Established plants prefer less frequent watering',
    ],
  },
]

export default function PlantInformationPage() {
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
            Growing Guide
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-700 text-cream-50 text-balance mb-6"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
          >
            Plant Information
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-sage-200 text-lg font-body leading-relaxed max-w-2xl mx-auto"
          >
            Everything you need to help your Meadowlark plants thrive — from choosing the right variety to planting and aftercare.
          </motion.p>
        </div>
      </section>

      {/* Intro / how we grow */}
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
                How We Grow
              </span>
              <h2
                className="font-display font-700 text-forest-900 mb-6"
                style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)' }}
              >
                Grown for Real Backyards
              </h2>
              <p className="text-forest-700 font-body leading-relaxed mb-4">
                Every plant we grow is raised outdoors in Tennessee — no greenhouses. That means our plants are hardened for real backyard conditions.
              </p>
              <p className="text-sage-600 font-body leading-relaxed mb-6">
                Our saying is simple: if it grows and is healthy in our backyard, it will do the same in yours. Use the guide below to plant with confidence and give each variety the best start.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { icon: Leaf, label: 'Open-Air Grown' },
                  { icon: Sun, label: 'Tennessee Hardened' },
                  { icon: Droplets, label: 'Water-Wise Tips' },
                  { icon: Sprout, label: 'Rooted to Thrive' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3 p-3 bg-forest-50 rounded-xl">
                    <item.icon className="w-5 h-5 text-forest-600 shrink-0" />
                    <span className="text-forest-700 text-sm font-sans font-600">{item.label}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/how-we-grow"
                className="inline-flex items-center gap-2 text-forest-700 hover:text-forest-900 font-sans font-700 text-sm transition-colors focus-ring rounded"
              >
                Learn how we grow <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <img
                src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=700&q=80"
                alt="Healthy outdoor plants growing in a garden"
                className="w-full h-[480px] object-cover rounded-3xl shadow-2xl"
                loading="lazy"
              />
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-xl">
                <p className="font-sans font-700 text-forest-900 text-2xl">TN</p>
                <p className="text-sage-500 text-sm">Open-Air Nursery</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Care Guide — numbered process grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Care Guide"
            title="From Planting to Thriving"
            subtitle="Four simple steps to help your plants settle in and grow strong."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {tips.map((tip, i) => (
              <motion.div
                key={tip.step}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                {i < tips.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(100%-0.5rem)] w-[calc(100%-2rem)] h-px bg-forest-100 pointer-events-none" />
                )}
                <span
                  className="font-display font-700 text-forest-200 leading-none block mb-4"
                  style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)' }}
                >
                  {tip.step}
                </span>
                <h3 className="font-display font-700 text-forest-900 text-xl mb-3">{tip.title}</h3>
                <p className="text-sage-600 text-sm font-body leading-relaxed">{tip.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Site conditions */}
      <section className="py-20 bg-cream-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative order-2 lg:order-1"
            >
              <img
                src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=700&q=80"
                alt="Healthy garden landscape"
                className="w-full h-[420px] object-cover rounded-3xl shadow-2xl"
                loading="lazy"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="order-1 lg:order-2"
            >
              <span className="inline-block text-xs font-sans font-700 text-forest-600 tracking-widest uppercase mb-4 px-3 py-1 bg-forest-50 rounded-full border border-forest-200">
                Right Plant, Right Place
              </span>
              <h2
                className="font-display font-700 text-forest-900 mb-6"
                style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)' }}
              >
                Match Plants to Your Site
              </h2>
              <p className="text-sage-600 font-body leading-relaxed mb-8">
                Before you dig, take stock of light, soil, and moisture. Choosing a plant that fits your yard is the surest path to a low-maintenance, thriving garden.
              </p>
              <div className="space-y-6">
                {conditions.map((group, i) => (
                  <motion.div
                    key={group.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.45 }}
                    className="flex gap-4"
                  >
                    <div className="w-11 h-11 rounded-xl bg-forest-50 flex items-center justify-center shrink-0">
                      <group.icon className="w-5 h-5 text-forest-600" />
                    </div>
                    <div>
                      <h3 className="font-display font-700 text-forest-900 text-lg mb-1.5">{group.title}</h3>
                      <ul className="space-y-1">
                        {group.items.map(item => (
                          <li key={item} className="text-sage-600 text-sm font-body leading-relaxed">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Help / next steps CTA */}
      <section className="py-20 bg-forest-900 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1920&q=40")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block text-xs font-sans font-700 text-forest-300 tracking-widest uppercase mb-4 px-3 py-1 bg-forest-800/80 rounded-full border border-forest-700">
              Still Have Questions?
            </span>
            <h2
              className="font-display font-700 text-cream-50 mb-4"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}
            >
              We&apos;re Happy to Help You Grow
            </h2>
            <p className="text-sage-300 text-lg font-body leading-relaxed mb-8 max-w-xl mx-auto">
              Browse our catalog for sun, water, and hardiness notes on every plant — or reach out and we&apos;ll help you pick varieties that belong in your landscape.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-forest-500 hover:bg-forest-400 text-white font-sans font-700 rounded-xl transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 focus-ring"
              >
                Shop Plants <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-cream-100 font-sans font-600 rounded-xl border border-white/20 transition-colors focus-ring"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
