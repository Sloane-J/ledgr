import { supabase } from '@/src/lib/supabase';
import { subDays } from 'date-fns';

export const seedProducts = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // 1. Create Categories
  const categoriesToSeed = [
    { name: 'Car Parts', description: 'Automotive replacement parts and accessories' },
    { name: 'Gym Equipments', description: 'Fitness and exercise equipment' }
  ];

  const seededCategories = [];
  for (const cat of categoriesToSeed) {
    const { data: existingCat } = await supabase
      .from('categories')
      .select('*')
      .eq('name', cat.name)
      .single();

    if (existingCat) {
      seededCategories.push(existingCat);
    } else {
      const { data: newCat, error: catError } = await supabase
        .from('categories')
        .insert([cat])
        .select()
        .single();
      if (catError) throw catError;
      seededCategories.push(newCat);
    }
  }

  const carPartsCat = seededCategories.find(c => c.name === 'Car Parts');
  const gymEquipCat = seededCategories.find(c => c.name === 'Gym Equipments');

  if (!carPartsCat || !gymEquipCat) throw new Error('Failed to create categories');

  // 2. Create Products
  const productsToSeed = [
    // Car Parts
    { name: 'Brake Pads', price: 45.99, stock_quantity: 50, category_id: carPartsCat.id, description: 'High-performance ceramic brake pads', image_url: 'https://images.unsplash.com/photo-1599256621730-535171e28e50?auto=format&fit=crop&w=300&q=80' },
    { name: 'Spark Plugs', price: 8.50, stock_quantity: 100, category_id: carPartsCat.id, description: 'Iridium spark plugs for better fuel efficiency', image_url: 'https://images.unsplash.com/photo-1621905252507-b35222028781?auto=format&fit=crop&w=300&q=80' },
    { name: 'Oil Filter', price: 12.99, stock_quantity: 80, category_id: carPartsCat.id, description: 'Premium oil filter for engine protection', image_url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=300&q=80' },
    { name: 'Alternator', price: 120.00, stock_quantity: 15, category_id: carPartsCat.id, description: 'Heavy-duty alternator for reliable charging', image_url: 'https://images.unsplash.com/photo-1597766353939-9568019391c1?auto=format&fit=crop&w=300&q=80' },
    { name: 'Radiator', price: 85.00, stock_quantity: 10, category_id: carPartsCat.id, description: 'Aluminum radiator for optimal cooling', image_url: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=300&q=80' },
    { name: 'Headlight Bulb', price: 15.75, stock_quantity: 60, category_id: carPartsCat.id, description: 'Bright LED headlight replacement bulb', image_url: 'https://images.unsplash.com/photo-1547038577-da80abbc4f19?auto=format&fit=crop&w=300&q=80' },
    { name: 'Wiper Blades', price: 22.00, stock_quantity: 40, category_id: carPartsCat.id, description: 'All-season silicone wiper blades', image_url: 'https://images.unsplash.com/photo-1632823471565-1ec2c63db7f5?auto=format&fit=crop&w=300&q=80' },
    { name: 'Car Battery', price: 110.00, stock_quantity: 20, category_id: carPartsCat.id, description: 'Maintenance-free 12V car battery', image_url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=300&q=80' },
    { name: 'Shock Absorber', price: 65.00, stock_quantity: 24, category_id: carPartsCat.id, description: 'Gas-charged shock absorber for smooth ride', image_url: 'https://images.unsplash.com/photo-1612544448332-b6750543b241?auto=format&fit=crop&w=300&q=80' },
    { name: 'Air Filter', price: 18.50, stock_quantity: 45, category_id: carPartsCat.id, description: 'High-flow engine air filter', image_url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=300&q=80' },
    { name: 'Turbocharger', price: 450.00, stock_quantity: 5, category_id: carPartsCat.id, description: 'High-boost turbocharger for performance', image_url: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=300&q=80' },
    { name: 'Clutch Kit', price: 210.00, stock_quantity: 12, category_id: carPartsCat.id, description: 'Complete clutch replacement kit', image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=300&q=80' },
    { name: 'Fuel Pump', price: 89.99, stock_quantity: 18, category_id: carPartsCat.id, description: 'Electric fuel pump for consistent pressure', image_url: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=300&q=80' },
    { name: 'Exhaust Manifold', price: 155.00, stock_quantity: 8, category_id: carPartsCat.id, description: 'Stainless steel exhaust manifold', image_url: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=300&q=80' },
    { name: 'Timing Belt', price: 35.00, stock_quantity: 30, category_id: carPartsCat.id, description: 'Reinforced rubber timing belt', image_url: 'https://images.unsplash.com/photo-1625047509168-a7026f36de04?auto=format&fit=crop&w=300&q=80' },
    { name: 'Fuel Injector', price: 75.00, stock_quantity: 25, category_id: carPartsCat.id, description: 'Precision fuel injector for better combustion', image_url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=300&q=80' },
    { name: 'Water Pump', price: 55.00, stock_quantity: 15, category_id: carPartsCat.id, description: 'Engine cooling water pump', image_url: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=300&q=80' },
    { name: 'Control Arm', price: 95.00, stock_quantity: 10, category_id: carPartsCat.id, description: 'Suspension control arm for stability', image_url: 'https://images.unsplash.com/photo-1612544448332-b6750543b241?auto=format&fit=crop&w=300&q=80' },
    { name: 'Wheel Bearing', price: 40.00, stock_quantity: 40, category_id: carPartsCat.id, description: 'Durable wheel bearing for smooth rotation', image_url: 'https://images.unsplash.com/photo-1625047509168-a7026f36de04?auto=format&fit=crop&w=300&q=80' },
    { name: 'Ignition Coil', price: 60.00, stock_quantity: 20, category_id: carPartsCat.id, description: 'High-voltage ignition coil', image_url: 'https://images.unsplash.com/photo-1621905252507-b35222028781?auto=format&fit=crop&w=300&q=80' },
    
    // Gym Equipments
    { name: 'Dumbbells (Set of 2)', price: 55.00, stock_quantity: 30, category_id: gymEquipCat.id, description: 'Rubber-coated hex dumbbells', image_url: 'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?auto=format&fit=crop&w=300&q=80' },
    { name: 'Kettlebell (16kg)', price: 42.00, stock_quantity: 25, category_id: gymEquipCat.id, description: 'Cast iron kettlebell for strength training', image_url: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=300&q=80' },
    { name: 'Yoga Mat', price: 25.00, stock_quantity: 50, category_id: gymEquipCat.id, description: 'Non-slip eco-friendly yoga mat', image_url: 'https://images.unsplash.com/photo-1592432676556-2693bc883b21?auto=format&fit=crop&w=300&q=80' },
    { name: 'Treadmill', price: 850.00, stock_quantity: 5, category_id: gymEquipCat.id, description: 'Foldable electric treadmill with LCD display', image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=300&q=80' },
    { name: 'Exercise Bike', price: 320.00, stock_quantity: 8, category_id: gymEquipCat.id, description: 'Magnetic resistance stationary bike', image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=300&q=80' },
    { name: 'Resistance Bands', price: 15.99, stock_quantity: 100, category_id: gymEquipCat.id, description: 'Set of 5 latex resistance bands', image_url: 'https://images.unsplash.com/photo-1598289431512-b97b0917a63e?auto=format&fit=crop&w=300&q=80' },
    { name: 'Pull-up Bar', price: 35.00, stock_quantity: 20, category_id: gymEquipCat.id, description: 'Doorway mounted heavy-duty pull-up bar', image_url: 'https://images.unsplash.com/photo-1598971639058-fab3c32f850c?auto=format&fit=crop&w=300&q=80' },
    { name: 'Bench Press', price: 180.00, stock_quantity: 12, category_id: gymEquipCat.id, description: 'Adjustable weight bench for home gym', image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=300&q=80' },
    { name: 'Medicine Ball', price: 28.50, stock_quantity: 35, category_id: gymEquipCat.id, description: 'Textured grip medicine ball (5kg)', image_url: 'https://images.unsplash.com/photo-1637666062717-1c6bcfa4a4df?auto=format&fit=crop&w=300&q=80' },
    { name: 'Foam Roller', price: 19.99, stock_quantity: 40, category_id: gymEquipCat.id, description: 'High-density foam roller for muscle recovery', image_url: 'https://images.unsplash.com/photo-1600881333168-2ed4992125e0?auto=format&fit=crop&w=300&q=80' },
    { name: 'Punching Bag', price: 125.00, stock_quantity: 10, category_id: gymEquipCat.id, description: 'Heavy-duty hanging punching bag', image_url: 'https://images.unsplash.com/photo-1599058917233-57c0e88047bb?auto=format&fit=crop&w=300&q=80' },
    { name: 'Jump Rope', price: 12.00, stock_quantity: 60, category_id: gymEquipCat.id, description: 'Speed jump rope with adjustable length', image_url: 'https://images.unsplash.com/photo-1544033527-b192daee1f5b?auto=format&fit=crop&w=300&q=80' },
    { name: 'Weight Plates (20kg)', price: 45.00, stock_quantity: 40, category_id: gymEquipCat.id, description: 'Olympic rubber-coated weight plates', image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=300&q=80' },
    { name: 'Gym Gloves', price: 18.00, stock_quantity: 50, category_id: gymEquipCat.id, description: 'Padded leather gym gloves for grip', image_url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=300&q=80' },
    { name: 'Water Bottle', price: 15.00, stock_quantity: 100, category_id: gymEquipCat.id, description: 'Insulated stainless steel water bottle', image_url: 'https://images.unsplash.com/photo-1602143393494-721d002d3405?auto=format&fit=crop&w=300&q=80' },
    { name: 'Gym Bag', price: 45.00, stock_quantity: 25, category_id: gymEquipCat.id, description: 'Large capacity gym bag with shoe compartment', image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=300&q=80' },
    { name: 'Weight Lifting Belt', price: 35.00, stock_quantity: 30, category_id: gymEquipCat.id, description: 'Leather weight lifting belt for back support', image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=300&q=80' },
    { name: 'Wrist Wraps', price: 12.50, stock_quantity: 50, category_id: gymEquipCat.id, description: 'Elastic wrist wraps for joint stability', image_url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=300&q=80' },
    { name: 'Ab Roller', price: 22.00, stock_quantity: 35, category_id: gymEquipCat.id, description: 'Dual-wheel ab roller for core strength', image_url: 'https://images.unsplash.com/photo-1637666062717-1c6bcfa4a4df?auto=format&fit=crop&w=300&q=80' },
    { name: 'Hand Gripper', price: 10.00, stock_quantity: 80, category_id: gymEquipCat.id, description: 'Adjustable hand gripper for forearm strength', image_url: 'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?auto=format&fit=crop&w=300&q=80' }
  ];

  for (const prod of productsToSeed) {
    const { data: existingProd } = await supabase
      .from('products')
      .select('*')
      .eq('name', prod.name)
      .single();

    if (!existingProd) {
      const { error: prodError } = await supabase
        .from('products')
        .insert([prod]);
      if (prodError) throw prodError;
    }
  }
};

export const seedSampleOrders = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: products } = await supabase.from('products').select('*').limit(20);
  if (!products || products.length === 0) {
    throw new Error('Please seed products first');
  }

  const sampleItems = [];
  const now = new Date();

  // Create 20 sample orders over the last 30 days
  for (let i = 0; i < 20; i++) {
    const orderDate = subDays(now, Math.floor(Math.random() * 30));
    const orderTotal = Math.floor(Math.random() * 200) + 50;
    
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_id: user.id,
        total_amount: orderTotal,
        status: 'completed',
        created_at: orderDate.toISOString()
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    // Add 1-3 items per order
    const numItems = Math.floor(Math.random() * 3) + 1;
    for (let j = 0; j < numItems; j++) {
      const product = products[Math.floor(Math.random() * products.length)];
      sampleItems.push({
        order_id: order.id,
        product_id: product.id,
        quantity: Math.floor(Math.random() * 3) + 1,
        unit_price: product.price
      });
    }
  }

  const { error: itemsError } = await supabase.from('order_items').insert(sampleItems);
  if (itemsError) throw itemsError;
};
