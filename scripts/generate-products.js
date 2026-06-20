const fs = require('fs');
const path = require('path');

const CATEGORIES = [
  'Tools',
  'Electrical',
  'Plumbing',
  'Paint',
  'Fasteners',
  'Safety Equipment'
];

const BRANDS = {
  'Tools': ['Bosch', 'Stanley', 'Makita', 'DeWalt', 'Black & Decker', 'Taparia', 'Hitachi', 'Ingco'],
  'Electrical': ['Havells', 'Finolex', 'Anchor', 'Syska', 'Philips', 'Wipro', 'Polycab', 'Legrand'],
  'Plumbing': ['Supreme', 'Astral', 'Prince', 'Ashirvad', 'Parryware', 'Hindware', 'Jaquar', 'Cera'],
  'Paint': ['Asian Paints', 'Berger Paints', 'Nerolac', 'Dulux', 'Indigo', 'Shalimar', 'Dr. Fixit', 'Pidilite'],
  'Fasteners': ['Tork', 'Apex', 'Hilti', 'Fischer', 'Unbrako', 'TVS', 'LPS', 'Sterling'],
  'Safety Equipment': ['3M', 'Karam', 'Honeywell', 'Hillson', 'Liberty', 'Udyogi', 'Mallcom', 'Safeguard']
};

const PRODUCT_TEMPLATES = {
  'Tools': [
    { type: 'Hammer', size: ['450g', '500g', '800g', '1.5kg'], adjective: ['Claw', 'Sledge', 'Ball Pein', 'Machinist'] },
    { type: 'Screwdriver', size: ['4-inch', '6-inch', '8-inch', 'Set of 6', 'Set of 12'], adjective: ['Flat Head', 'Phillips Head', 'Precision', 'Magnetic'] },
    { type: 'Drill Machine', size: ['13mm 650W', '10mm 450W', 'Cordless 12V', 'Cordless 18V', 'Rotary 800W'], adjective: ['Impact', 'Reversible', 'Professional', 'Brushless'] },
    { type: 'Wrench', size: ['8-inch', '10-inch', '12-inch', 'Set of 8', 'Set of 12'], adjective: ['Adjustable', 'Pipe', 'Combination', 'Ring'] },
    { type: 'Plier', size: ['6-inch', '8-inch', 'Set of 3'], adjective: ['Combination', 'Long Nose', 'Side Cutting', 'Circlip'] },
    { type: 'Angle Grinder', size: ['4-inch 850W', '5-inch 1000W', '7-inch 2000W'], adjective: ['Heavy Duty', 'Professional', 'Slim Body'] },
    { type: 'Hand Saw', size: ['12-inch', '18-inch', '20-inch'], adjective: ['Wood Cutting', 'Hacksaw Frame', 'Tenon Saw'] },
    { type: 'Tool Box', size: ['Small 13"', 'Medium 16"', 'Large 19"', 'Organizer Chest'], adjective: ['Plastic', 'Metal Cantilever', 'Heavy Duty Organizer'] }
  ],
  'Electrical': [
    { type: 'Copper Wire Roll', size: ['1.0 sq mm 90m', '1.5 sq mm 90m', '2.5 sq mm 90m', '4.0 sq mm 90m', '6.0 sq mm 90m'], adjective: ['FR (Flame Retardant)', 'FRLS (Flame Retardant Low Smoke)', 'ZHFR (Zero Halogen)'] },
    { type: 'Modular Switch', size: ['6A 1-Way', '16A 1-Way', '6A 2-Way', 'Bell Push Switch'], adjective: ['Classic White', 'Sleek Silver', 'Matte Black', 'Wood Finish'] },
    { type: 'Modular Socket', size: ['6A 3-Pin', '6/16A Combined', '25A Power'], adjective: ['Shuttered Safety', 'Indicator Switch Socket'] },
    { type: 'LED Bulb', size: ['9W', '12W', '15W', '20W', '30W'], adjective: ['Cool Day Light', 'Warm White', 'Natural White', 'Smart Wi-Fi'] },
    { type: 'Extension Board', size: ['4 Socket 1.5m', '4 Socket 3m', '6 Socket 4m'], adjective: ['Surge Protector', 'Heavy Duty Multi-Plug'] },
    { type: 'MCB Single Pole', size: ['10A C-Curve', '16A C-Curve', '25A C-Curve', '32A C-Curve', '63A C-Curve'], adjective: ['Miniature Circuit Breaker', 'High Breaking Capacity'] },
    { type: 'Ceiling Fan', size: ['1200mm', '1400mm', '900mm'], adjective: ['High Speed Decorative', 'Energy Efficient BLDC', 'Classic Glossy'] },
    { type: 'Electrical PVC Tape', size: ['7m Roll', '10m Roll', 'Pack of 5 Colors'], adjective: ['Insulation', 'Heavy Duty Adhesive'] }
  ],
  'Plumbing': [
    { type: 'PVC Pipe', size: ['1-inch x 10ft', '1.5-inch x 10ft', '2-inch x 10ft', '4-inch x 10ft'], adjective: ['Schedule 40', 'Schedule 80', 'Rigid Conduit', 'SWR Drainage'] },
    { type: 'CPVC Pipe', size: ['0.5-inch x 10ft', '0.75-inch x 10ft', '1-inch x 10ft'], adjective: ['Hot & Cold Water', 'SDR 11 Class 1'] },
    { type: 'Elbow 90 Degree', size: ['0.5-inch', '0.75-inch', '1-inch', '2-inch'], adjective: ['Threaded CPVC', 'Solvent Joint PVC', 'Brass Threaded'] },
    { type: 'Tee Joint', size: ['0.5-inch', '0.75-inch', '1-inch', '2-inch'], adjective: ['CPVC Equal', 'PVC Reducing', 'Brass Threaded Female'] },
    { type: 'Water Tap', size: ['Short Body', 'Long Body', 'Angle Valve', 'Sink Mixer'], adjective: ['Brass Chrome Plated', 'PTFE Polymer Leak-Free', 'Quarter Turn Luxury'] },
    { type: 'Ball Valve', size: ['0.5-inch Threaded', '0.75-inch', '1-inch', '2-inch Slip'], adjective: ['Full Port Brass', 'UPVC Double Union', 'Standard Flow Control'] },
    { type: 'Solvent Cement', size: ['50ml Tube', '100ml Can', '250ml Can with Brush', '500ml Can'], adjective: ['UPVC Fast Setting', 'CPVC Yellow Medium', 'PVC Pipe Adhesive'] },
    { type: 'Teflon Tape', size: ['10m Roll', '12m Roll', 'Pack of 10'], adjective: ['Thread Sealant', 'High Density Professional'] }
  ],
  'Paint': [
    { type: 'Wall Primer', size: ['1 Litre', '4 Litre', '10 Litre', '20 Litre'], adjective: ['Water Based Exterior', 'Solvent Based Wood', 'Interior Acrylic'] },
    { type: 'Acrylic Emulsion', size: ['1 Litre', '4 Litre', '10 Litre', '20 Litre'], adjective: ['Super White Matte', 'Luxury Silk Sheen', 'Weatherproof Exterior', 'Easy Clean Stain Resistant'] },
    { type: 'Waterproofing Compound', size: ['1kg', '5kg', '10kg', '20kg'], adjective: ['Roof Leak Guard', 'Damp-Proof Coating', 'Latex Shield additive'] },
    { type: 'Paint Brush', size: ['1-inch', '2-inch', '3-inch', '4-inch'], adjective: ['Synthetic Bristle', 'Natural Hog Bristle', 'Angle Sash Professional'] },
    { type: 'Paint Roller', size: ['4-inch', '7-inch', '9-inch'], adjective: ['Woven Polyester Nap', 'Microfiber Anti-Drip', 'Textured Design Pattern'] },
    { type: 'Spray Paint Can', size: ['400ml'], adjective: ['Glossy Black Aerosol', 'Metallic Gold High Shine', 'Primer Grey Rust-Oleum', 'Cherry Red Gloss'] },
    { type: 'Sandpaper Sheet', size: ['80 Grit Rough', '120 Grit Medium', '220 Grit Fine', '400 Grit Ultra-Fine'], adjective: ['Waterproof Silicon Carbide', 'Aluminum Oxide Sanding'] },
    { type: 'Paint Thinner', size: ['500ml', '1 Litre', '5 Litre'], adjective: ['Mineral Turpentine oil', 'NC Thinner Premium Quick Dry'] }
  ],
  'Fasteners': [
    { type: 'Self Tapping Screws', size: ['#6 x 0.5"', '#8 x 1"', '#10 x 1.5"', '#12 x 2"'], adjective: ['Zinc Plated Star Head', 'Stainless Steel Phil', 'Black Phosphate Drywall'] },
    { type: 'Hex Bolt & Nut', size: ['M6 x 25mm', 'M8 x 40mm', 'M10 x 50mm', 'M12 x 75mm'], adjective: ['Grade 8.8 Carbon Steel', 'Stainless Steel SS304', 'Hot Dip Galvanized'] },
    { type: 'Nylon Wall Plugs', size: ['6mm (Pack of 100)', '8mm (Pack of 100)', '10mm (Pack of 50)', '12mm (Pack of 20)'], adjective: ['Ribbed Expansion Grip', 'Fischer Type Anchor plugs'] },
    { type: 'Concrete Anchor Bolt', size: ['M8 x 75mm', 'M10 x 100mm', 'M12 x 120mm'], adjective: ['Heavy Duty Expansion Shield', 'Sleeve Anchor Zinc'] },
    { type: 'Flat Metal Washers', size: ['M6 (Pack of 200)', 'M8 (Pack of 100)', 'M10 (Pack of 100)', 'M12 (Pack of 50)'], adjective: ['Stainless Steel SS304 Flat', 'Spring Lock Split Steel'] },
    { type: 'Wood Screws', size: ['1-inch (Pack of 100)', '1.5-inch', '2-inch', '3-inch'], adjective: ['Brass Countersunk Slotted', 'Yellow Zinc Star Drive'] }
  ],
  'Safety Equipment': [
    { type: 'Safety Gloves', size: ['Medium', 'Large', 'Extra Large'], adjective: ['Nitrile Coated Work', 'Split Cowhide Leather Welding', 'Cut Resistant Level 5 Polyurethane'] },
    { type: 'Safety Goggles', size: ['One Size Adjustable'], adjective: ['Anti-Scratch Anti-Fog Clear', 'Tinted UV Protection', 'Splash Resistant Chemical Goggle'] },
    { type: 'Hard Hat Helmet', size: ['Ratchet Suspension Adjustable'], adjective: ['Industrial Safety Yellow', 'Construction Safety White', 'Electrical Hazard Blue'] },
    { type: 'Steel Toe Safety Shoes', size: ['UK Size 7', 'UK Size 8', 'UK Size 9', 'UK Size 10'], adjective: ['Anti-Skid Oil Resistant Leather', 'Lightweight Breathable Steel-Toe'] },
    { type: 'Reflective Safety Vest', size: ['Medium', 'Large', 'XL'], adjective: ['High Visibility Neon Green', 'Fluorescent Orange Security'] },
    { type: 'Dust Mask', size: ['Pack of 5', 'Pack of 10', 'Pack of 50'], adjective: ['N95 Particulate Respirator', 'Active Carbon Anti-Pollution'] },
    { type: 'Safety Harness', size: ['Full Body Universal'], adjective: ['Double Lanyard Fall Protection', 'Full Body Harness with D-Ring'] },
    { type: 'Ear Muffs/Plugs', size: ['Universal SNR 30dB', 'Pack of 50 Pairs'], adjective: ['Hearing Protection Ear Defender', 'Soft Foam Corded Earplugs'] }
  ]
};

// Curated pool of Unsplash images for each category to look nice and load fast.
const IMAGES_POOL = {
  'Tools': [
    'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1534224039826-c7a0eda0e6b3?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1426927308491-6380b6a9936f?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1530124560072-aae70411b9a1?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1610979624899-defb8e622b10?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80'
  ],
  'Electrical': [
    'https://images.unsplash.com/photo-1558244661-d248897f7bc4?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1621905252507-b354bc25edac?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1606206591513-adbf85a37175?auto=format&fit=crop&w=600&q=80'
  ],
  'Plumbing': [
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1608613304899-ea8098577e38?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1521207418485-99c705420785?auto=format&fit=crop&w=600&q=80'
  ],
  'Paint': [
    'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1595853035070-59a39fe84de3?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1541535881962-e668f2247aa4?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1525909002-1b057f39dd82?auto=format&fit=crop&w=600&q=80'
  ],
  'Fasteners': [
    'https://images.unsplash.com/photo-1609148013627-ef3d76e737c0?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1541535881962-e668f2247aa4?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1618944913480-b67ee16d7b77?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80'
  ],
  'Safety Equipment': [
    'https://images.unsplash.com/photo-1590487988256-9ed24133863e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1531287333318-62d29486c4f7?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1585250482596-f0fcd6cc84ff?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=600&q=80'
  ]
};

const products = [];

// Generate around 510 products per category to exceed 3000 products.
const TARGET_PER_CATEGORY = 510;

let globalId = 1;

for (const category of CATEGORIES) {
  const brands = BRANDS[category];
  const templates = PRODUCT_TEMPLATES[category];
  const images = IMAGES_POOL[category];

  for (let i = 0; i < TARGET_PER_CATEGORY; i++) {
    // Select deterministic but variable elements
    const brandIndex = i % brands.length;
    const brand = brands[brandIndex];

    const templateIndex = i % templates.length;
    const template = templates[templateIndex];

    const sizeIndex = Math.floor(i / templates.length) % template.size.length;
    const size = template.size[sizeIndex];

    const adjectiveIndex = Math.floor(i / (templates.length * template.size.length)) % template.adjective.length;
    const adjective = template.adjective[adjectiveIndex];

    const imageIndex = i % images.length;
    const image = images[imageIndex];

    // Build the name
    // Brand + Adjective + Type + Size (e.g. Bosch Impact Drill Machine 13mm 650W)
    const name = `${brand} ${adjective} ${template.type} (${size})`;

    // Generate random but realistic price: Tools (500 to 12000), Electrical (20 to 5000), etc.
    let basePrice = 500;
    if (category === 'Tools') basePrice = 800 + (i % 15) * 800;
    else if (category === 'Electrical') basePrice = 50 + (i % 15) * 350;
    else if (category === 'Plumbing') basePrice = 40 + (i % 15) * 280;
    else if (category === 'Paint') basePrice = 120 + (i % 15) * 600;
    else if (category === 'Fasteners') basePrice = 80 + (i % 15) * 60;
    else if (category === 'Safety Equipment') basePrice = 150 + (i % 15) * 450;

    // Apply variance based on brand prestige
    if (['Bosch', 'DeWalt', '3M', 'Jaquar', 'Asian Paints', 'Legrand'].includes(brand)) {
      basePrice = Math.round(basePrice * 1.35);
    }

    const price = Math.max(10, basePrice);
    const stock = 10 + (i % 49) * 5; // Stock ranges from 10 to 250

    // Description text variation
    const descVariations = [
      `The ${brand} ${template.type} is designed for high durability and performance. It is perfect for both professional industrial use and daily home repairs. Built with superior craftsmanship and high-grade materials.`,
      `Engineered for optimal efficiency and long service life. This ${brand} ${template.type} meets rigid standards of safety and function. Features an ergonomic design to reduce fatigue during extended usage.`,
      `A premium choice from ${brand}, this product delivers exceptional value. Recommended for heavy-duty applications. Simple installation and low maintenance requirements make it highly cost-effective.`,
      `Trusted by professionals worldwide, the ${brand} ${template.type} offers unmatched precision and power. Compact size for tight spaces while providing maximum output. Ideal for your next project.`
    ];
    const description = descVariations[i % descVariations.length];

    const id = `PROD-${String(globalId).padStart(5, '0')}`;
    globalId++;

    products.push({
      id,
      name,
      category,
      brand,
      price,
      description,
      image,
      stock
    });
  }
}

// Write to products.json
const outputDir = path.join(__dirname, '..', 'src', 'data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(
  path.join(outputDir, 'products.json'),
  JSON.stringify(products, null, 2),
  'utf-8'
);

console.log(`Generated ${products.length} products successfully!`);
