/** Hydrangea guide sections for the Plant Information Hydrangeas tab. */

export function HydrangeaBloomingGuide() {
  return (
    <div className="mb-12 overflow-hidden rounded-3xl border border-forest-100 bg-[#f4f4f2] shadow-sm">
      <img
        src="/images/plant-guides/hydrangea-blooming-guide.jpg?v=3"
        alt="Why isn't my hydrangea blooming? Troubleshooting flowchart by hydrangea type"
        className="w-full h-auto block"
        loading="eager"
        decoding="async"
      />
    </div>
  )
}

export function HydrangeaColorAndTips() {
  return (
    <div className="mt-12 grid lg:grid-cols-5 gap-5 items-start">
      <div className="lg:col-span-3 rounded-2xl border border-forest-100 bg-white p-6 sm:p-8 shadow-sm">
        <h3 className="font-display font-700 text-forest-800 text-2xl mb-4">Color</h3>
        <p className="text-sage-700 font-body text-sm leading-relaxed mb-4">
          All hydrangeas undergo some color change as their flowers age, but only bigleaf and mountain
          hydrangeas can change their color in a predictable, controllable way. It is not solely the pH
          of the soil that is responsible for this change — it is actually the presence of aluminum in the soil.
        </p>
        <ul className="space-y-3 text-sage-700 font-body text-sm leading-relaxed list-disc pl-5">
          <li>
            Certain varieties of bigleaf hydrangeas cannot change color. Rich red bigleaf blooms are a
            good example. Similarly, white varieties of bigleaf hydrangea will not change color.
          </li>
          <li>
            It is easier to change a hydrangea from pink to blue than from blue to pink, but both endeavors
            involve making chemical application in specific amounts at specific times. A soil test is
            necessary to determine the best course of action. If you decide to try to change the flower
            color, shop for products carefully and read all directions.
          </li>
          <li>Pennies, nails, aluminum foil, or coffee grounds in the soil will not change the color!</li>
        </ul>
      </div>

      <div className="lg:col-span-2 flex flex-col gap-5">
        <div className="rounded-2xl border border-forest-100 bg-white p-6 sm:p-8 shadow-sm">
          <h3 className="font-display font-700 text-forest-800 text-2xl mb-4">Tips for Success</h3>
          <ul className="space-y-3 text-sage-700 font-body text-sm leading-relaxed list-disc pl-5">
            <li>Moist but well-drained soil (hydrangeas will not tolerate wet feet — ever!)</li>
            <li>
              Some sun each day. Most people think of hydrangeas as shade plants, but they look and flower
              best with at least four hours of sun, ideally in the morning. Panicle hydrangeas are the most
              sun tolerant, and can take full sun in northern climates.
            </li>
            <li>
              Plenty of water, especially as they are getting established. Hydrangeas have shallow roots,
              so they dry out quickly. A two to three inch layer of shredded bark mulch is a useful
              addition to any hydrangea planting.
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-forest-100 bg-white p-6 shadow-sm">
          <p className="text-sage-700 font-body text-sm leading-relaxed">
            <span className="font-display font-700 text-forest-800 text-lg mr-1.5">Hydrangea Fun Fact</span>
            Hydrangeas are notoriously water-needy, but the &ldquo;hydra&rdquo; part of their name actually
            refers to the seed capsules&apos; resemblance to ancient Greek water-carrying vessels.
          </p>
        </div>
      </div>
    </div>
  )
}
