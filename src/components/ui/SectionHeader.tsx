import { motion } from 'motion/react'

interface Props {
  eyebrow?: string
  title: string
  subtitle?: string
  centered?: boolean
}

export default function SectionHeader({ eyebrow, title, subtitle, centered = true }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`mb-12 ${centered ? 'text-center' : ''}`}
    >
      {eyebrow && (
        <span className="inline-block text-xs font-sans font-700 text-forest-600 tracking-widest uppercase mb-3 px-3 py-1 bg-forest-50 rounded-full border border-forest-200">
          {eyebrow}
        </span>
      )}
      <h2 className="font-display font-700 text-forest-900 text-balance" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', lineHeight: 1.15 }}>
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-sage-600 font-body text-lg leading-relaxed max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </motion.div>
  )
}