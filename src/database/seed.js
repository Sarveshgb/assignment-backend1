import connectDB from '../config/database.js';
import Event from '../models/Event.js';
import Package from '../models/Package.js';
import Lead from '../models/Lead.js';
import LeadStatusHistory from '../models/LeadStatusHistory.js';
import Quote from '../models/Quote.js';

const seed = async () => {
  try {
    await connectDB();
    console.log('🌱 Starting database seeding...\n');

    // Clear existing data
    await Quote.deleteMany({});
    await LeadStatusHistory.deleteMany({});
    await Lead.deleteMany({});
    await Package.deleteMany({});
    await Event.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Insert Events
    const events = await Event.insertMany([
      {
        name: 'F1 Japan Grand Prix',
        description: 'Experience the thrill of Formula 1 racing at the iconic Suzuka Circuit',
        location: 'Suzuka, Japan',
        event_date: new Date('2025-10-18'),
        category: 'Motorsport',
        image_url: '/images/f1-japan.png'
      },
      {
        name: 'Wimbledon Championships',
        description: 'Witness tennis excellence at the most prestigious Grand Slam tournament',
        location: 'London, UK',
        event_date: new Date('2025-06-30'),
        category: 'Tennis',
        image_url: '/images/wimbledon.png'
      },
      {
        name: 'NBA Finals',
        description: 'The pinnacle of professional basketball - witness history in the making',
        location: 'Various, USA',
        event_date: new Date('2025-06-05'),
        category: 'Basketball',
        image_url: '/images/nba.png'
      }
    ]);
    console.log(`✅ Inserted ${events.length} events`);

    // Insert Packages
    const packages = await Package.insertMany([
      {
        event_id: events[0]._id,
        name: 'F1 Japan - Premium Package',
        description: 'VIP access to all race days with hospitality passes',
        base_price: 89999.00,
        duration_days: 4,
        inclusions: ['Race tickets (3 days)', 'VIP hospitality', 'Hotel accommodation', 'Airport transfers', 'City tour'],
        max_travelers: 10,
        image_url: '/images/f1-japan.png'
      },
      {
        event_id: events[0]._id,
        name: 'F1 Japan - Standard Package',
        description: 'General admission for all race days',
        base_price: 45999.00,
        duration_days: 3,
        inclusions: ['Race tickets (3 days)', 'Hotel accommodation', 'Airport transfers'],
        max_travelers: 20,
        image_url: '/images/f1-japan.png'
      },
      {
        event_id: events[1]._id,
        name: 'Wimbledon - Centre Court Package',
        description: 'Premium Centre Court tickets for finals weekend',
        base_price: 75900.00,
        duration_days: 5,
        inclusions: ['Centre Court tickets', 'Luxury hotel', 'Welcome dinner', 'London city tour'],
        max_travelers: 8,
        image_url: '/images/wimbledon.png'
      },
      {
        event_id: events[1]._id,
        name: 'Wimbledon - All Coverage Package',
        description: 'Access to all courts throughout the tournament',
        base_price: 52000.00,
        duration_days: 7,
        inclusions: ['Ground pass tickets', 'Hotel accommodation', 'Breakfast included', 'Transport'],
        max_travelers: 15,
        image_url: '/images/wimbledon.png'
      },
      {
        event_id: events[2]._id,
        name: 'NBA Finals - Courtside Experience',
        description: 'Courtside seats for the championship series',
        base_price: 125000.00,
        duration_days: 6,
        inclusions: ['Courtside tickets (2 games)', '5-star hotel', 'Meet & greet opportunity', 'VIP lounge access'],
        max_travelers: 6,
        image_url: '/images/nba.png'
      },
      {
        event_id: events[2]._id,
        name: 'NBA Finals - Premium Package',
        description: 'Lower bowl seating for NBA Finals games',
        base_price: 68000.00,
        duration_days: 5,
        inclusions: ['Premium tickets (2 games)', 'Hotel accommodation', 'Pre-game hospitality', 'City tour'],
        max_travelers: 12,
        image_url: '/images/nba.png'
      }
    ]);
    console.log(`✅ Inserted ${packages.length} packages`);

    // Insert Sample Leads
    const leads = await Lead.insertMany([
      {
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '1234567890',
        message: 'Interested in F1 Japan package for 2 people',
        event_id: events[0]._id,
        status: 'New'
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.j@email.com',
        phone: '9876543210',
        message: 'Looking for Wimbledon tickets',
        event_id: events[1]._id,
        status: 'Contacted'
      },
      {
        name: 'Michael Chen',
        email: 'mchen@email.com',
        phone: '5551234567',
        message: 'NBA Finals group booking inquiry',
        event_id: events[2]._id,
        status: 'Quote Sent'
      }
    ]);
    console.log(`✅ Inserted ${leads.length} sample leads`);

    // Insert Status History
    await LeadStatusHistory.insertMany([
      { lead_id: leads[0]._id, from_status: null, to_status: 'New', notes: 'Lead created' },
      { lead_id: leads[1]._id, from_status: null, to_status: 'New', notes: 'Lead created' },
      { lead_id: leads[1]._id, from_status: 'New', to_status: 'Contacted', notes: 'Initial contact made via email' },
      { lead_id: leads[2]._id, from_status: null, to_status: 'New', notes: 'Lead created' },
      { lead_id: leads[2]._id, from_status: 'New', to_status: 'Contacted', notes: 'Phone call completed' },
      { lead_id: leads[2]._id, from_status: 'Contacted', to_status: 'Quote Sent', notes: 'Quote generated and sent' }
    ]);
    console.log('✅ Inserted lead status history');

    // Insert Sample Quote
    await Quote.create({
      lead_id: leads[2]._id,
      package_id: packages[0]._id,
      travelers: 4,
      travel_date: new Date('2025-10-18'),
      base_price: 89999.00,
      seasonal_multiplier: 0,
      early_bird_discount: -0.10,
      group_discount: -0.08,
      final_price: 73799.18
    });
    console.log('✅ Inserted sample quote');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Events: ${events.length}`);
    console.log(`   - Packages: ${packages.length}`);
    console.log(`   - Leads: ${leads.length}`);
    console.log(`   - Status History: 6 records`);
    console.log(`   - Quotes: 1 record`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seed();
