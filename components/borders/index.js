// Border Components Index
export { default as Classic } from './Classic';
export { default as DatabaseBorder } from './DatabaseBorder';
export { default as Galaxy } from './Galaxy';
export { default as Metro } from './Metro';
export { default as Neon } from './Neon';
export { default as Simple } from './Simple';

// Border registry for easy access
export const BORDER_REGISTRY = {
  // Code-based borders (React components)
  metro: {
    name: 'Metro Glitch',
    component: 'Metro',
    description: 'Cyberpunk glitch effect dengan animasi',
    category: 'modern',
    premium: true,
    type: 'component',
    source: 'local'
  },
  classic: {
    name: 'Classic Elegant',
    component: 'Classic',
    description: 'Border klasik dengan sentuhan elegan',
    category: 'classic',
    premium: false,
    type: 'component',
    source: 'local'
  },
  neon: {
    name: 'Neon Electric',
    component: 'Neon',
    description: 'Efek neon dengan kilatan listrik',
    category: 'modern',
    premium: true,
    type: 'component',
    source: 'local'
  },
  simple: {
    name: 'Simple Clean',
    component: 'Simple',
    description: 'Border sederhana dan bersih',
    category: 'basic',
    premium: false,
    type: 'component',
    source: 'local'
  },
  galaxy: {
    name: 'Galaxy Space',
    component: 'Galaxy',
    description: 'Tema luar angkasa dengan bintang-bintang',
    category: 'fantasy',
    premium: true,
    type: 'component',
    source: 'local'
  }
};

// Database border mapping (will be populated from API)
export const DATABASE_BORDERS = {
  216: {
    name: 'Mystic Moon',
    description: 'Dengan border bulan penuh misteri, cocok untuk kamu yang suka keajaiban malam!',
    price: 1800,
    image: 'https://your-cdn.com/borders/mystic_moon.png',
    type: 'database',
    source: 'database',
    category: 'fantasy',
    premium: true
  },
  215: {
    name: 'Bumble Bee',
    description: 'Tampil lucu dengan border bertema lebah yang riang dan penuh energi!',
    price: 1750,
    image: 'https://your-cdn.com/borders/bumble_bee.png',
    type: 'database',
    source: 'database',
    category: 'nature',
    premium: true
  },
  218: {
    name: 'Butterfly Garden',
    description: 'Tambahkan keindahan dengan border penuh kupu-kupu cantik di taman bunga!',
    price: 1900,
    image: 'https://your-cdn.com/borders/butterfly_garden.png',
    type: 'database',
    source: 'database',
    category: 'nature',
    premium: true
  },
  220: {
    name: 'Robot Friends',
    description: 'Dengan border robot lucu, ini adalah pilihan sempurna untuk penggemar teknologi!',
    price: 2000,
    image: 'https://your-cdn.com/borders/robot_friends.png',
    type: 'database',
    source: 'database',
    category: 'modern',
    premium: true
  },
  221: {
    name: 'Chocolate Bliss',
    description: 'Untuk pecinta coklat, border ini memancarkan kelezatan dan keceriaan!',
    price: 2050,
    image: 'https://your-cdn.com/borders/chocolate_bliss.png',
    type: 'database',
    source: 'database',
    category: 'food',
    premium: true
  }
};

// Helper function to get border component
export const getBorderComponent = (borderType) => {
  const borderInfo = BORDER_REGISTRY[borderType];
  if (!borderInfo) return null;
  
  switch (borderInfo.component) {
    case 'Metro':
      return require('./Metro').default;
    case 'Classic':
      return require('./Classic').default;
    case 'Neon':
      return require('./Neon').default;
    case 'Simple':
      return require('./Simple').default;
    case 'Galaxy':
      return require('./Galaxy').default;
    default:
      return null;
  }
};

// Helper function to get database border info
export const getDatabaseBorder = (borderId) => {
  return DATABASE_BORDERS[borderId] || null;
};

// Helper function to merge all borders
export const getAllBorders = (userInventoryBorders = []) => {
  const componentBorders = Object.keys(BORDER_REGISTRY).map(key => ({
    id: key,
    ...BORDER_REGISTRY[key],
    owned: !BORDER_REGISTRY[key].premium, // Free borders owned by default
    equipped: false
  }));

  const databaseBorders = userInventoryBorders.map(item => ({
    id: `db_${item.item_id}`,
    name: item.shop_items?.name || `Border ${item.item_id}`,
    description: item.shop_items?.description || 'Border dari inventory',
    image: item.shop_items?.image,
    thumbnail: item.shop_items?.thumbnail,
    type: 'database',
    source: 'database',
    category: 'inventory',
    premium: false,
    owned: true,
    equipped: item.is_equipped || false,
    inventoryId: item.id
  }));

  return [...componentBorders, ...databaseBorders];
};
