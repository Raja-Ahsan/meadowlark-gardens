<?php

namespace Database\Seeders;

use App\Models\PlantType;
use Illuminate\Database\Seeder;

class PlantTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            [
                'title' => 'Japanese Maples',
                'slug' => 'japanese-maples',
                'excerpt' => 'Elegant foliage trees prized for color, form, and year-round interest in Tennessee landscapes.',
                'content' => '<h2>About Japanese Maples</h2><p>Japanese Maples bring graceful structure and seasonal color to gardens. We grow outdoor-hardened stock suited to real backyard conditions.</p><h2>Planting Tips</h2><p>Choose a site with morning sun or filtered light and well-drained soil. Dig a wide planting hole, set the root flare at soil level, and water deeply after planting.</p><h2>Care</h2><p>Mulch to keep roots cool, water during dry spells in the first seasons, and prune lightly to maintain shape.</p>',
                'image' => 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=800&q=80',
                'sort_order' => 1,
            ],
            [
                'title' => 'Hydrangeas',
                'slug' => 'hydrangeas',
                'excerpt' => 'Show-stopping blooms for borders, foundations, and cut flowers — grown open-air for backyard strength.',
                'content' => '<h2>About Hydrangeas</h2><p>Hydrangeas deliver big seasonal blooms and lush foliage. Our plants are raised outdoors so they settle in with less transplant shock.</p><h2>Planting Tips</h2><p>Most hydrangeas prefer morning sun and afternoon shade with moist, well-drained soil. Water regularly while establishing.</p><h2>Care</h2><p>Mulch to retain moisture, deadhead spent blooms as needed, and follow variety-specific pruning timing for best flower displays.</p>',
                'image' => 'https://images.unsplash.com/photo-1468327768560-75b778cbb551?auto=format&fit=crop&w=800&q=80',
                'sort_order' => 2,
            ],
            [
                'title' => 'Roses',
                'slug' => 'roses',
                'excerpt' => 'Classic fragrance and color for gardens that want lasting beauty and strong outdoor-grown plants.',
                'content' => '<h2>About Roses</h2><p>Roses reward sunny spots with fragrance and color. We grow them outdoors so they are ready for Tennessee backyards.</p><h2>Planting Tips</h2><p>Plant in full sun with rich, well-drained soil. Space plants for airflow, water at the base, and mulch carefully away from canes.</p><h2>Care</h2><p>Feed during the growing season, prune for structure, and monitor for pests so blooms stay healthy and abundant.</p>',
                'image' => 'https://images.unsplash.com/photo-1455659817273-f96807779a8a?auto=format&fit=crop&w=800&q=80',
                'sort_order' => 3,
            ],
            [
                'title' => 'Coneflowers',
                'slug' => 'coneflowers',
                'excerpt' => 'Pollinator favorites with sturdy blooms that thrive in sunny Tennessee gardens.',
                'content' => '<h2>About Coneflowers</h2><p>Coneflowers (Echinacea) are tough, colorful perennials that feed bees and butterflies while brightening borders and meadows.</p><h2>Planting Tips</h2><p>Plant in full sun with well-drained soil. Space plants for airflow and water deeply after planting.</p><h2>Care</h2><p>Once established, coneflowers are drought-tolerant. Deadhead for continuous blooms or leave seed heads for winter interest and birds.</p>',
                'image' => 'https://images.unsplash.com/photo-1470058869958-2a77ade41c02?auto=format&fit=crop&w=800&q=80',
                'sort_order' => 4,
            ],
            [
                'title' => 'Hostas',
                'slug' => 'hostas',
                'excerpt' => 'Shade-loving foliage plants that add texture and calm color beneath trees and along borders.',
                'content' => '<h2>About Hostas</h2><p>Hostas are dependable shade performers with bold leaves in greens, blues, and variegated patterns.</p><h2>Planting Tips</h2><p>Choose a shaded or partly shaded spot with moist, well-drained soil. Dig a wide hole and keep the crown at soil level.</p><h2>Care</h2><p>Water during dry spells, mulch lightly, and watch for slugs. Divide clumps every few years to keep plants vigorous.</p>',
                'image' => 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=800&q=80',
                'sort_order' => 5,
            ],
            [
                'title' => 'Azaleas',
                'slug' => 'azaleas',
                'excerpt' => 'Spring showstoppers for woodland edges and foundation plantings across the Southeast.',
                'content' => '<h2>About Azaleas</h2><p>Azaleas bring a burst of spring color and thrive in filtered light with acidic, well-drained soil.</p><h2>Planting Tips</h2><p>Plant slightly high in the hole, amend with organic matter, and water thoroughly. Avoid deep planting.</p><h2>Care</h2><p>Mulch to keep roots cool and moist. Prune lightly after flowering if shaping is needed.</p>',
                'image' => 'https://images.unsplash.com/photo-1446071103084-c257b5f70672?auto=format&fit=crop&w=800&q=80',
                'sort_order' => 6,
            ],
            [
                'title' => 'Daylilies',
                'slug' => 'daylilies',
                'excerpt' => 'Easy, colorful perennials that return year after year with minimal fuss.',
                'content' => '<h2>About Daylilies</h2><p>Daylilies are reliable bloomers for sunny borders, slopes, and mixed perennial beds.</p><h2>Planting Tips</h2><p>Plant in full sun to light shade with average, well-drained soil. Keep the crown just below the soil surface.</p><h2>Care</h2><p>Water while establishing, remove spent scapes, and divide crowded clumps every few seasons.</p>',
                'image' => 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
                'sort_order' => 7,
            ],
            [
                'title' => 'Boxwoods',
                'slug' => 'boxwoods',
                'excerpt' => 'Evergreen structure for hedges, borders, and formal garden accents.',
                'content' => '<h2>About Boxwoods</h2><p>Boxwoods provide year-round green structure and work well as hedges, foundation plants, and container specimens.</p><h2>Planting Tips</h2><p>Plant in well-drained soil with morning sun or partial shade. Avoid wet feet and leave room for mature size.</p><h2>Care</h2><p>Water consistently the first year, mulch lightly, and prune to shape after the spring flush of growth.</p>',
                'image' => 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80',
                'sort_order' => 8,
            ],
            [
                'title' => 'Lavender',
                'slug' => 'lavender',
                'excerpt' => 'Fragrant, sun-loving plants for borders, pathways, and pollinator gardens.',
                'content' => '<h2>About Lavender</h2><p>Lavender brings scent, color, and pollinators to sunny, well-drained garden spots.</p><h2>Planting Tips</h2><p>Give lavender full sun and lean, fast-draining soil. Avoid rich, wet ground that can cause root problems.</p><h2>Care</h2><p>Water sparingly once established. Shear lightly after bloom to keep plants compact and productive.</p>',
                'image' => 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80',
                'sort_order' => 9,
            ],
            [
                'title' => 'Ferns',
                'slug' => 'ferns',
                'excerpt' => 'Lush texture for shade gardens, woodland edges, and moist planting beds.',
                'content' => '<h2>About Ferns</h2><p>Ferns soften shady spaces with graceful fronds and thrive where many flowering plants struggle.</p><h2>Planting Tips</h2><p>Plant in shade to part shade with consistently moist, organic-rich soil. Water well after planting.</p><h2>Care</h2><p>Keep soil evenly moist the first season. Cut back spent fronds in late winter before new growth emerges.</p>',
                'image' => 'https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&w=800&q=80',
                'sort_order' => 10,
            ],
            [
                'title' => 'Flowering Trees',
                'slug' => 'flowering-trees',
                'excerpt' => 'Seasonal bloom and lasting structure for landscapes that need a strong focal point.',
                'content' => '<h2>About Flowering Trees</h2><p>Flowering trees add spring drama, summer shade, and landscape structure when chosen for the right site.</p><h2>Planting Tips</h2><p>Match the tree to your sun and soil. Dig a wide hole, set the root flare at grade, and water deeply after planting.</p><h2>Care</h2><p>Mulch the root zone, water through the first two seasons, and prune for structure while the tree is young.</p>',
                'image' => 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80',
                'sort_order' => 11,
            ],
            [
                'title' => 'Perennial Borders',
                'slug' => 'perennial-borders',
                'excerpt' => 'Mixed perennial plantings that return each year with color, texture, and pollinator support.',
                'content' => '<h2>About Perennial Borders</h2><p>A well-planned perennial border layers bloom times, heights, and textures for a garden that changes with the seasons.</p><h2>Planting Tips</h2><p>Group plants by light and water needs. Place taller plants toward the back and leave room for mature spread.</p><h2>Care</h2><p>Water new plantings regularly, mulch to suppress weeds, and cut back spent growth as seasons change.</p>',
                'image' => 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=900&q=80',
                'sort_order' => 12,
            ],
        ];

        foreach ($types as $type) {
            PlantType::updateOrCreate(
                ['slug' => $type['slug']],
                array_merge($type, [
                    'is_published' => true,
                    'meta_title' => $type['title'].' | Meadowlark Gardens',
                    'meta_description' => $type['excerpt'],
                ])
            );
        }
    }
}
