<?php

namespace Database\Seeders;

use App\Models\PlantType;
use App\Models\PlantTypeCategory;
use Illuminate\Database\Seeder;

class PlantTypeSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(PlantTypeCategorySeeder::class);

        $categoryId = fn (string $slug) => PlantTypeCategory::where('slug', $slug)->value('id');

        // Remove former top-level pages that are now categories (or category overview types)
        PlantType::whereIn('slug', [
            'roses', 'hydrangeas', 'japanese-maples', 'coneflowers', 'hostas', 'azaleas',
            'daylilies', 'boxwoods', 'lavender', 'ferns', 'flowering-trees', 'perennial-borders',
        ])->delete();

        $types = [
            // Roses
            [
                'category' => 'roses',
                'title' => 'Climbing Roses',
                'slug' => 'climbing-roses',
                'excerpt' => 'Rambling canes for trellises, fences, arbors, and pergolas — best bloomed when grown horizontally.',
                'content' => '<h2>Climbing Roses</h2><p>Climbing roses are not a class, but more of a description. In other words, you may find grandiflora or floribunda climbing roses. Despite the name, climbing roses can’t quite climb as efficiently as vines. Also referred to as “rambling” roses, they have sturdy and upright (sometimes arching) canes, which can be trained when provided support. However, these canes can grow up to 15 feet, which reach great heights along a trellis wall, garden fences, and arbors and pergolas. In general, climbing roses tend to produce more flowers when grown horizontally rather than vertically like most rose varieties. Producing large blooms, almost all climbing roses are repeat bloomers.</p>',
                'image' => 'https://images.unsplash.com/photo-1455659817273-f96807779a8a?auto=format&fit=crop&w=800&q=80',
                'sort_order' => 1,
            ],
            [
                'category' => 'roses',
                'title' => 'Hybrid Tea Roses',
                'slug' => 'hybrid-tea-roses',
                'excerpt' => 'Classic long-stemmed blooms with 30–50 petals — one of the most popular rose classes.',
                'content' => '<h2>Hybrid Tea Roses</h2><p>Hybrid tea roses are one of the most popular classes of roses, and it’s not hard to understand why. With bountiful, ornate blooms that sprout from long stems and reach anywhere from 30–50 petals, the hybrid tea rose creates a dazzling display in any garden. And horticulturists have had quite the field day with them, breeding thousands of hybrid varieties. Outdated hybrids make way for the new on a constant basis.</p>',
                'image' => 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
                'sort_order' => 2,
            ],
            [
                'category' => 'roses',
                'title' => 'Grandiflora Roses',
                'slug' => 'grandiflora-roses',
                'excerpt' => 'Tall shrubs with elegant clustered blooms — a hardy blend of hybrid tea and floribunda traits.',
                'content' => '<h2>Grandiflora Roses</h2><p>Regarded as a subgroup class of hybrid tea roses with floribunda features, the grandiflora rose was created in the last century. The perfect combination between the two, grandifloras present elegant showy blooms that appear in clusters like the hybrid tea rose, and a constant growth cycle like that of the floribunda. Each cluster also consists of three to five blooms. Overall, their shrubs are larger and stand taller than hybrid teas. While not as popular as its close cousins, the grandiflora is still quite hardy and vigorous, so don’t overlook it for your garden and landscaping.</p>',
                'image' => 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=800&q=80',
                'sort_order' => 3,
            ],
            [
                'category' => 'roses',
                'title' => 'Floribunda Roses',
                'slug' => 'floribunda-roses',
                'excerpt' => 'Large flower clusters with a long continuous bloom cycle and easier care.',
                'content' => '<h2>Floribunda Roses</h2><p>Floribunda roses are another favorite rose class. Similar to grandifloras, a floribunda rose presents a large cluster of flowers. With a continuous bloom, it will last much longer than the six- to seven-week cycle of hybrid tea roses or grandiflora roses. Floribundas are also much easier to care for and offer practically a hands-free experience.</p>',
                'image' => 'https://images.unsplash.com/photo-1468327768560-75b778cbb551?auto=format&fit=crop&w=800&q=80',
                'sort_order' => 4,
            ],
            [
                'category' => 'roses',
                'title' => 'Miniature Roses',
                'slug' => 'miniature-roses',
                'excerpt' => 'Compact hybrid tea or grandiflora forms, typically 15–30 inches tall.',
                'content' => '<h2>Miniature Roses</h2><p>A form of the hybrid tea or grandiflora rose, miniature roses and miniflora roses are typically shorter and a bit more compact. Miniature roses can grow anywhere between 15–30 inches, whereas a miniflora rose offers intermediate-sized blooms closer to the size of a floribunda.</p>',
                'image' => 'https://images.unsplash.com/photo-1446071103084-c257b5f70672?auto=format&fit=crop&w=800&q=80',
                'sort_order' => 5,
            ],
            [
                'category' => 'roses',
                'title' => 'Shrub Roses',
                'slug' => 'shrub-roses',
                'excerpt' => 'Wide, cold-hardy shrubs with bountiful bloom clusters — often 5–15 feet across.',
                'content' => '<h2>Shrub Roses</h2><p>Shrub roses tend to sprawl wide and large, anywhere between five and 15 feet in every direction. Able to withstand harsh winters, shrub roses are notable for their cold hardiness. In addition, their blooms are produced in bountiful clusters.</p>',
                'image' => 'https://images.unsplash.com/photo-1470058869958-2a77ade41c02?auto=format&fit=crop&w=800&q=80',
                'sort_order' => 6,
            ],
            [
                'category' => 'roses',
                'title' => 'Groundcover Roses',
                'slug' => 'groundcover-roses',
                'excerpt' => 'Low-maintenance landscape roses with vibrant color, form, and fragrance.',
                'content' => '<h2>Groundcover Roses</h2><p>Groundcover roses, also known as “landscape” roses, are a rose variety bred to have the best of all worlds: a beautiful garden rose with a vibrant color, graceful formation and lovely fragrance, as well as a low-maintenance benefit.</p>',
                'image' => 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80',
                'sort_order' => 7,
            ],

            // Hydrangeas
            [
                'category' => 'hydrangeas',
                'title' => 'Bigleaf Hydrangea',
                'slug' => 'bigleaf-hydrangea',
                'excerpt' => 'Also known as florist’s, mophead, or lacecap — hardy to zone 5; blooms on old wood.',
                'content' => '<h2>Bigleaf <em>(also known as florist’s hydrangea, hortensia, mophead, or lacecap)</em></h2><p><em>Hydrangea macrophylla</em></p><ul><li>Hardy to USDA zone 5</li><li>Bloom on old wood: do not prune; protect in winter</li></ul><h3>Color note</h3><p>Only bigleaf and mountain hydrangeas can change flower color in a predictable way — driven by aluminum in the soil, not pH alone. White and some red varieties will not change color. Pennies, nails, foil, or coffee grounds will not change color.</p>',
                'image' => 'https://images.unsplash.com/photo-1468327768560-75b778cbb551?auto=format&fit=crop&w=800&q=80',
                'sort_order' => 1,
            ],
            [
                'category' => 'hydrangeas',
                'title' => 'Panicle Hydrangea',
                'slug' => 'panicle-hydrangea',
                'excerpt' => 'Also known as peegee — hardy to zone 3; blooms on new wood; most sun-tolerant type.',
                'content' => '<h2>Panicle <em>(also known as peegee hydrangea)</em></h2><p><em>Hydrangea paniculata</em></p><ul><li>Hardy to USDA zone 3</li><li>Bloom on new wood: prune in late winter / early spring</li></ul><p>Panicle hydrangeas are the most sun tolerant and can take full sun in northern climates.</p>',
                'image' => 'https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&w=800&q=80',
                'sort_order' => 2,
            ],
            [
                'category' => 'hydrangeas',
                'title' => 'Smooth Hydrangea',
                'slug' => 'smooth-hydrangea',
                'excerpt' => 'Also known as Annabelle — hardy to zone 3; blooms on new wood.',
                'content' => '<h2>Smooth <em>(also known as Annabelle hydrangea)</em></h2><p><em>Hydrangea arborescens</em></p><ul><li>Hardy to USDA zone 3</li><li>Bloom on new wood: prune in late winter / early spring</li></ul>',
                'image' => 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=800&q=80',
                'sort_order' => 3,
            ],
            [
                'category' => 'hydrangeas',
                'title' => 'Climbing Hydrangea',
                'slug' => 'climbing-hydrangea',
                'excerpt' => 'Hydrangea petiolaris — hardy to zone 4; blooms on old wood; do not prune.',
                'content' => '<h2>Climbing</h2><p><em>Hydrangea petiolaris</em></p><ul><li>Hardy to USDA zone 4</li><li>Bloom on old wood: do not prune</li></ul>',
                'image' => 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80',
                'sort_order' => 4,
            ],
            [
                'category' => 'hydrangeas',
                'title' => 'Mountain Hydrangea',
                'slug' => 'mountain-hydrangea',
                'excerpt' => 'Hydrangea serrata — hardy to zone 5; blooms on old wood; do not prune.',
                'content' => '<h2>Mountain</h2><p><em>Hydrangea serrata</em></p><ul><li>Hardy to USDA zone 5</li><li>Bloom on old wood: do not prune</li></ul><p>Like bigleaf hydrangeas, mountain types can change color based on aluminum availability in the soil.</p>',
                'image' => 'https://images.unsplash.com/photo-1446071103084-c257b5f70672?auto=format&fit=crop&w=800&q=80',
                'sort_order' => 5,
            ],
            [
                'category' => 'hydrangeas',
                'title' => 'Oakleaf Hydrangea',
                'slug' => 'oakleaf-hydrangea',
                'excerpt' => 'Hydrangea quercifolia — hardy to zone 5; blooms on old wood; protect in winter.',
                'content' => '<h2>Oakleaf</h2><p><em>Hydrangea quercifolia</em></p><ul><li>Hardy to USDA zone 5</li><li>Bloom on old wood: do not prune; protect in winter</li></ul>',
                'image' => 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=800&q=80',
                'sort_order' => 6,
            ],

            // Other categories — one overview type each
            [
                'category' => 'japanese-maples',
                'title' => 'Japanese Maples Overview',
                'slug' => 'japanese-maples-overview',
                'excerpt' => 'Elegant foliage trees prized for color, form, and year-round interest in Tennessee landscapes.',
                'content' => '<h2>About Japanese Maples</h2><p>Japanese Maples bring graceful structure and seasonal color to gardens. We grow outdoor-hardened stock suited to real backyard conditions.</p><h2>Planting Tips</h2><p>Choose a site with morning sun or filtered light and well-drained soil. Dig a wide planting hole, set the root flare at soil level, and water deeply after planting.</p><h2>Care</h2><p>Mulch to keep roots cool, water during dry spells in the first seasons, and prune lightly to maintain shape.</p>',
                'image' => 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=800&q=80',
                'sort_order' => 1,
            ],
            [
                'category' => 'coneflowers',
                'title' => 'Coneflowers Overview',
                'slug' => 'coneflowers-overview',
                'excerpt' => 'Pollinator favorites with sturdy blooms that thrive in sunny Tennessee gardens.',
                'content' => '<h2>About Coneflowers</h2><p>Coneflowers (Echinacea) are tough, colorful perennials that feed bees and butterflies while brightening borders and meadows.</p><h2>Planting Tips</h2><p>Plant in full sun with well-drained soil. Space plants for airflow and water deeply after planting.</p><h2>Care</h2><p>Once established, coneflowers are drought-tolerant. Deadhead for continuous blooms or leave seed heads for winter interest and birds.</p>',
                'image' => 'https://images.unsplash.com/photo-1470058869958-2a77ade41c02?auto=format&fit=crop&w=800&q=80',
                'sort_order' => 1,
            ],
            [
                'category' => 'hostas',
                'title' => 'Hostas Overview',
                'slug' => 'hostas-overview',
                'excerpt' => 'Shade-loving foliage plants that add texture and calm color beneath trees and along borders.',
                'content' => '<h2>About Hostas</h2><p>Hostas are dependable shade performers with bold leaves in greens, blues, and variegated patterns.</p><h2>Planting Tips</h2><p>Choose a shaded or partly shaded spot with moist, well-drained soil. Dig a wide hole and keep the crown at soil level.</p><h2>Care</h2><p>Water during dry spells, mulch lightly, and watch for slugs. Divide clumps every few years to keep plants vigorous.</p>',
                'image' => 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=800&q=80',
                'sort_order' => 1,
            ],
            [
                'category' => 'azaleas',
                'title' => 'Azaleas Overview',
                'slug' => 'azaleas-overview',
                'excerpt' => 'Spring showstoppers for woodland edges and foundation plantings across the Southeast.',
                'content' => '<h2>About Azaleas</h2><p>Azaleas bring a burst of spring color and thrive in filtered light with acidic, well-drained soil.</p><h2>Planting Tips</h2><p>Plant slightly high in the hole, amend with organic matter, and water thoroughly. Avoid deep planting.</p><h2>Care</h2><p>Mulch to keep roots cool and moist. Prune lightly after flowering if shaping is needed.</p>',
                'image' => 'https://images.unsplash.com/photo-1446071103084-c257b5f70672?auto=format&fit=crop&w=800&q=80',
                'sort_order' => 1,
            ],
            [
                'category' => 'daylilies',
                'title' => 'Daylilies Overview',
                'slug' => 'daylilies-overview',
                'excerpt' => 'Easy, colorful perennials that return year after year with minimal fuss.',
                'content' => '<h2>About Daylilies</h2><p>Daylilies are reliable bloomers for sunny borders, slopes, and mixed perennial beds.</p><h2>Planting Tips</h2><p>Plant in full sun to light shade with average, well-drained soil. Keep the crown just below the soil surface.</p><h2>Care</h2><p>Water while establishing, remove spent scapes, and divide crowded clumps every few seasons.</p>',
                'image' => 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
                'sort_order' => 1,
            ],
            [
                'category' => 'boxwoods',
                'title' => 'Boxwoods Overview',
                'slug' => 'boxwoods-overview',
                'excerpt' => 'Evergreen structure for hedges, borders, and formal garden accents.',
                'content' => '<h2>About Boxwoods</h2><p>Boxwoods provide year-round green structure and work well as hedges, foundation plants, and container specimens.</p><h2>Planting Tips</h2><p>Plant in well-drained soil with morning sun or partial shade. Avoid wet feet and leave room for mature size.</p><h2>Care</h2><p>Water consistently the first year, mulch lightly, and prune to shape after the spring flush of growth.</p>',
                'image' => 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80',
                'sort_order' => 1,
            ],
            [
                'category' => 'lavender',
                'title' => 'Lavender Overview',
                'slug' => 'lavender-overview',
                'excerpt' => 'Fragrant, sun-loving plants for borders, pathways, and pollinator gardens.',
                'content' => '<h2>About Lavender</h2><p>Lavender brings scent, color, and pollinators to sunny, well-drained garden spots.</p><h2>Planting Tips</h2><p>Give lavender full sun and lean, fast-draining soil. Avoid rich, wet ground that can cause root problems.</p><h2>Care</h2><p>Water sparingly once established. Shear lightly after bloom to keep plants compact and productive.</p>',
                'image' => 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80',
                'sort_order' => 1,
            ],
            [
                'category' => 'ferns',
                'title' => 'Ferns Overview',
                'slug' => 'ferns-overview',
                'excerpt' => 'Lush texture for shade gardens, woodland edges, and moist planting beds.',
                'content' => '<h2>About Ferns</h2><p>Ferns soften shady spaces with graceful fronds and thrive where many flowering plants struggle.</p><h2>Planting Tips</h2><p>Plant in shade to part shade with consistently moist, organic-rich soil. Water well after planting.</p><h2>Care</h2><p>Keep soil evenly moist the first season. Cut back spent fronds in late winter before new growth emerges.</p>',
                'image' => 'https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&w=800&q=80',
                'sort_order' => 1,
            ],
            [
                'category' => 'flowering-trees',
                'title' => 'Flowering Trees Overview',
                'slug' => 'flowering-trees-overview',
                'excerpt' => 'Seasonal bloom and lasting structure for landscapes that need a strong focal point.',
                'content' => '<h2>About Flowering Trees</h2><p>Flowering trees add spring drama, summer shade, and landscape structure when chosen for the right site.</p><h2>Planting Tips</h2><p>Match the tree to your sun and soil. Dig a wide hole, set the root flare at grade, and water deeply after planting.</p><h2>Care</h2><p>Mulch the root zone, water through the first two seasons, and prune for structure while the tree is young.</p>',
                'image' => 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80',
                'sort_order' => 1,
            ],
            [
                'category' => 'perennial-borders',
                'title' => 'Perennial Borders Overview',
                'slug' => 'perennial-borders-overview',
                'excerpt' => 'Mixed perennial plantings that return each year with color, texture, and pollinator support.',
                'content' => '<h2>About Perennial Borders</h2><p>A well-planned perennial border layers bloom times, heights, and textures for a garden that changes with the seasons.</p><h2>Planting Tips</h2><p>Group plants by light and water needs. Place taller plants toward the back and leave room for mature spread.</p><h2>Care</h2><p>Water new plantings regularly, mulch to suppress weeds, and cut back spent growth as seasons change.</p>',
                'image' => 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=900&q=80',
                'sort_order' => 1,
            ],
        ];

        foreach ($types as $type) {
            $catSlug = $type['category'];
            unset($type['category']);

            PlantType::updateOrCreate(
                ['slug' => $type['slug']],
                array_merge($type, [
                    'plant_type_category_id' => $categoryId($catSlug),
                    'is_published' => true,
                    'meta_title' => $type['title'].' | Meadowlark Gardens',
                    'meta_description' => $type['excerpt'],
                ])
            );
        }
    }
}
