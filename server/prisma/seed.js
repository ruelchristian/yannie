const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Categories
  const categoriesData = [
    {
      name: 'Student ID & Documents',
      icon: 'id-card',
      description: 'Campus IDs, CORs, library cards, driver licenses, certificates, and notebooks.',
    },
    {
      name: 'Electronics & Gadgets',
      icon: 'laptop',
      description: 'Laptops, mobile phones, earphones, chargers, power banks, and flash drives.',
    },
    {
      name: 'Books & Stationery',
      icon: 'book',
      description: 'Textbooks, course modules, calculators, art supplies, and pencil cases.',
    },
    {
      name: 'Bags & Wallets',
      icon: 'briefcase',
      description: 'Backpacks, sling bags, tote bags, wallets, coin purses, and pouches.',
    },
    {
      name: 'Personal Accessories',
      icon: 'watch',
      description: 'Keys, eyeglasses, wristwatches, umbrellas, water tumblers, and jewelry.',
    },
    {
      name: 'Clothing & Uniforms',
      icon: 'shirt',
      description: 'ICCT corporate uniforms, PE uniforms, laboratory coats, jackets, and caps.',
    },
    {
      name: 'Other Items',
      icon: 'tag',
      description: 'Miscellaneous personal belongings not covered in other categories.',
    },
  ];

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: cat,
      create: cat,
    });
  }
  console.log('✅ Categories seeded.');

  // 2. Users
  const passwordHashAdmin = await bcrypt.hash('admin123', 10);
  const passwordHashStudent = await bcrypt.hash('student123', 10);
  const passwordHashStaff = await bcrypt.hash('staff123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@icct.edu.ph' },
    update: {},
    create: {
      email: 'admin@icct.edu.ph',
      studentId: 'ADMIN-001',
      fullName: 'ICCT Cainta Administrator',
      phoneNumber: '09171234567',
      role: 'ADMIN',
      password: passwordHashAdmin,
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'yeinnee@icct.edu.ph' },
    update: {},
    create: {
      email: 'yeinnee@icct.edu.ph',
      studentId: '2023-01042',
      fullName: 'Yeinnee Ruby Lavado',
      phoneNumber: '09189876543',
      role: 'STUDENT',
      password: passwordHashStudent,
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: 'security@icct.edu.ph' },
    update: {},
    create: {
      email: 'security@icct.edu.ph',
      studentId: 'STAFF-020',
      fullName: 'Campus Security Office',
      phoneNumber: '09205551234',
      role: 'STAFF',
      password: passwordHashStaff,
    },
  });

  console.log('✅ Default users seeded (admin@icct.edu.ph, yeinnee@icct.edu.ph, security@icct.edu.ph).');

  // Fetch categories for foreign keys
  const idCategory = await prisma.category.findUnique({ where: { name: 'Student ID & Documents' } });
  const electronicsCategory = await prisma.category.findUnique({ where: { name: 'Electronics & Gadgets' } });
  const accessoriesCategory = await prisma.category.findUnique({ where: { name: 'Personal Accessories' } });
  const bagsCategory = await prisma.category.findUnique({ where: { name: 'Bags & Wallets' } });

  // 3. Sample Item Reports
  // Base coordinates for ICCT Colleges Cainta: 14.5802, 121.1218
  const reportsCount = await prisma.itemReport.count();
  if (reportsCount === 0) {
    const report1 = await prisma.itemReport.create({
      data: {
        userId: student.id,
        categoryId: electronicsCategory.id,
        type: 'LOST',
        title: 'Lost Black Logitech Wireless Mouse',
        description: 'Left my black Logitech M185 wireless mouse on table 4 during IPT2 class. It has a small ICCT sticker on the battery cover.',
        status: 'ACTIVE',
        locationName: 'Main Building 2nd Floor, Computer Lab 2',
        latitude: 14.58045,
        longitude: 121.12192,
        dateIncident: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        contactInfo: 'yeinnee@icct.edu.ph or contact 09189876543',
        images: {
          create: [
            { imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=60' }
          ]
        }
      }
    });

    const report2 = await prisma.itemReport.create({
      data: {
        userId: staff.id,
        categoryId: idCategory.id,
        type: 'FOUND',
        title: 'Found Student ID Card - BSIT 3rd Year',
        description: 'Found an ICCT Student ID under the canteen bench near the drink station. Turned over to Security Office at Main Gate.',
        status: 'ACTIVE',
        locationName: 'Campus Canteen, Near Beverage Stall',
        latitude: 14.58012,
        longitude: 121.12165,
        dateIncident: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        contactInfo: 'Claim at Campus Security Guard House - Main Gate with proof of enrollment.',
        images: {
          create: [
            { imageUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=600&auto=format&fit=crop&q=60' }
          ]
        }
      }
    });

    const report3 = await prisma.itemReport.create({
      data: {
        userId: student.id,
        categoryId: accessoriesCategory.id,
        type: 'LOST',
        title: 'Stainless AquaFlask Tumbler (Cobalt Blue 32oz)',
        description: 'AquaFlask tumbler left at the bench near the College Library entrance. Has subtle scratches on the bottom base.',
        status: 'ACTIVE',
        locationName: '3rd Floor Library Hallway Bench',
        latitude: 14.58031,
        longitude: 121.12210,
        dateIncident: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
        contactInfo: 'Contact via message or 09189876543',
        images: {
          create: [
            { imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=60' }
          ]
        }
      }
    });

    const report4 = await prisma.itemReport.create({
      data: {
        userId: staff.id,
        categoryId: bagsCategory.id,
        type: 'FOUND',
        title: 'Brown Leather Bi-fold Wallet',
        description: 'Found inside Room 301 after afternoon dismissal. Contains several discount cards and coins. No direct ID found.',
        status: 'CLAIMED',
        locationName: 'Room 301, Academic Building',
        latitude: 14.57995,
        longitude: 121.12150,
        dateIncident: new Date(Date.now() - 72 * 60 * 60 * 1000),
        contactInfo: 'Stored at Security Desk. Inquire directly.',
        images: {
          create: [
            { imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=60' }
          ]
        }
      }
    });

    console.log('✅ Sample item reports created.');
  }

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
