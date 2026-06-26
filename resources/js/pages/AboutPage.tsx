import { motion } from 'motion/react'
import { Leaf, Award, Sprout, Heart } from 'lucide-react'
import SectionHeader from '@/components/ui/SectionHeader'

const milestones = [
  { year: '1998', title: 'Founded', desc: 'Ruth planted the first seeds in her Franklin backyard.' },
  { year: '2005', title: 'First Storefront', desc: 'Opened our first permanent nursery location on Meadowlark Lane.' },
  { year: '2012', title: 'Wholesale Launch', desc: 'Launched our wholesale program serving 15 partner businesses.' },
  { year: '2020', title: 'Online Expansion', desc: 'Grew our digital presence to serve customers statewide.' },
  { year: '2025', title: 'Today', desc: '85+ wholesale partners and 2,400+ retail customers strong.' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-cream-50 pt-20">
      {/* Header */}
      <section className="py-20 bg-forest-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1920&q=40")', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block text-xs font-sans font-700 text-forest-300 tracking-widest uppercase mb-4 px-3 py-1 bg-forest-800/80 rounded-full border border-forest-700"
          >
            Our Story
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-700 text-cream-50 text-balance mb-6"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
          >
            Growing Tennessee's Garden Heritage
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-sage-300 text-lg font-body leading-relaxed max-w-2xl mx-auto"
          >
            For over 25 years, Meadowlark Gardens TN has been rooted in the belief that the right plant, in the right place, changes everything.
          </motion.p>
        </div>
      </section>

      {/* Mission */}
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
                Our Mission
              </span>
              <h2 className="font-display font-700 text-forest-900 mb-6" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)' }}>
                Plants That Belong Here
              </h2>
              <p className="text-forest-700 font-body leading-relaxed mb-4">
                We believe in the power of native plants to restore ecosystems, feed pollinators, and create landscapes that feel naturally connected to this land we all call home.
              </p>
              <p className="text-sage-600 font-body leading-relaxed mb-6">
                Every plant we grow is chosen because it thrives in Tennessee's climate, requires less water and care, and gives back to the local ecology — from the bees that need our coneflowers to the birds that nest in our native shrubs.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Leaf, label: 'Sustainable Practices' },
                  { icon: Heart, label: 'Pollinator Friendly' },
                  { icon: Sprout, label: 'Organically Grown' },
                  { icon: Award, label: 'TN Certified Nursery' },
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
                src="https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=700&q=80"
                alt="Our nursery greenhouse"
                className="w-full h-[480px] object-cover rounded-3xl shadow-2xl"
                loading="lazy"
              />
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-xl">
                <p className="font-sans font-700 text-forest-900 text-2xl">25+</p>
                <p className="text-sage-500 text-sm">Years of Growing</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-cream-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="Our Journey" title="25 Years in the Making" />
          <div className="relative">
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-forest-200 md:-translate-x-px" />
            {milestones.map((m, i) => (
              <motion.div
                key={m.year}
                initial={{ opacity: 0, x: i % 2 === 0 ? -24 : 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className={`relative flex items-start gap-6 mb-8 ${i % 2 === 0 ? 'md:flex-row-reverse md:text-right' : ''} pl-20 md:pl-0`}
              >
                <div className="absolute left-6 md:left-1/2 w-4 h-4 bg-forest-600 rounded-full border-4 border-cream-50 md:-translate-x-2 mt-1 shrink-0" />
                <div className={`md:w-[calc(50%-2rem)] ${i % 2 === 0 ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'} bg-white p-5 rounded-2xl border border-forest-100 shadow-sm`}>
                  <span className="font-sans font-700 text-forest-600 text-sm">{m.year}</span>
                  <h3 className="font-display font-700 text-forest-900 text-lg mt-1">{m.title}</h3>
                  <p className="text-sage-600 text-sm font-body mt-1">{m.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}