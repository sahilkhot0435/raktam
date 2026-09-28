const BloodBank = require('../models/BloodBank');
const User = require('../models/User');

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const generateStock = () =>
  BLOOD_TYPES.map((bt) => ({ bloodType: bt, units: Math.floor(Math.random() * 50) }));

const seedDatabase = async () => {
  console.log('🌱 Seeding database...');

  const banks = [
    { name: 'Sanjeevani Blood Bank & Transfusion Centre', address: '12, MG Road, Fort', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', phone: '022-22001234', email: 'sanjeevani@raktam.in', operatingHours: '24/7', isVerified: true, location: { type: 'Point', coordinates: [72.8347, 18.9322] } },
    { name: 'Avishhkar Lifeline Blood Centre', address: '45, Bandra West', city: 'Mumbai', state: 'Maharashtra', pincode: '400050', phone: '022-26001234', isVerified: true, location: { type: 'Point', coordinates: [72.8266, 19.0596] } },
    { name: 'Delhi Blood Services', address: '23, Connaught Place', city: 'Delhi', state: 'Delhi', pincode: '110001', phone: '011-23401234', isVerified: true, location: { type: 'Point', coordinates: [77.2167, 28.6319] } },
    { name: 'Red Cross Blood Bank Delhi', address: '1, Red Cross Road', city: 'Delhi', state: 'Delhi', pincode: '110002', phone: '011-23711234', isVerified: true, location: { type: 'Point', coordinates: [77.2090, 28.6280] } },
    { name: 'Bengaluru Blood Centre', address: '78, MG Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560001', phone: '080-22201234', isVerified: true, location: { type: 'Point', coordinates: [77.6064, 12.9762] } },
    { name: 'Chennai City Blood Bank', address: '34, Anna Salai', city: 'Chennai', state: 'Tamil Nadu', pincode: '600002', phone: '044-28521234', isVerified: true, location: { type: 'Point', coordinates: [80.2707, 13.0570] } },
    { name: 'Pune Rakt Seva Kendra', address: '56, FC Road', city: 'Pune', state: 'Maharashtra', pincode: '411004', phone: '020-25671234', isVerified: true, location: { type: 'Point', coordinates: [73.8397, 18.5236] } },
    { name: 'Kolkata Blood Donation Centre', address: '90, Park Street', city: 'Kolkata', state: 'West Bengal', pincode: '700016', phone: '033-22801234', isVerified: true, location: { type: 'Point', coordinates: [88.3639, 22.5448] } },
    { name: 'Hyderabad LifeBlood Bank', address: '12, Banjara Hills', city: 'Hyderabad', state: 'Telangana', pincode: '500034', phone: '040-23451234', isVerified: true, location: { type: 'Point', coordinates: [78.4483, 17.4124] } },
    { name: 'Ahmedabad Rakt Kosh', address: '23, CG Road', city: 'Ahmedabad', state: 'Gujarat', pincode: '380006', phone: '079-26561234', isVerified: true, location: { type: 'Point', coordinates: [72.5619, 23.0395] } },
  ];

  for (const bankData of banks) {
    bankData.stock = generateStock();
    await BloodBank.create(bankData);
  }

  // Create admin user
  await User.create({
    name: 'Raktam Admin',
    email: 'admin@raktam.in',
    password: 'Raktam@2024',
    phone: '9999999999',
    bloodType: 'O+',
    role: 'admin',
    location: { city: 'Mumbai', state: 'Maharashtra', coordinates: { type: 'Point', coordinates: [72.8347, 18.9322] } },
  });

  console.log('✅ Database seeded with 10 blood banks and admin user');
  console.log('   Admin: admin@raktam.in / Raktam@2024');
};

module.exports = { seedDatabase };
