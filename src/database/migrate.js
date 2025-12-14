import db from '../config/database.js';

const migrate = () => {
    console.log('🚀 Starting database migration...\n');

    try {
        // Create Events table
        db.exec(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        location TEXT NOT NULL,
        event_date TEXT NOT NULL,
        category TEXT,
        image_url TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ Events table created');

        // Create Packages table
        db.exec(`
      CREATE TABLE IF NOT EXISTS packages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER,
        name TEXT NOT NULL,
        description TEXT,
        base_price REAL NOT NULL,
        duration_days INTEGER NOT NULL,
        inclusions TEXT,
        max_travelers INTEGER,
        image_url TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
      );
    `);
        console.log('✅ Packages table created');

        // Create Leads table
        db.exec(`
      CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        message TEXT,
        event_id INTEGER,
        status TEXT DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Quote Sent', 'Interested', 'Closed Won', 'Closed Lost')),
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events(id)
      );
    `);
        console.log('✅ Leads table created');

        // Create Lead Status History table
        db.exec(`
      CREATE TABLE IF NOT EXISTS lead_status_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lead_id INTEGER,
        from_status TEXT,
        to_status TEXT NOT NULL,
        changed_at TEXT DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
      );
    `);
        console.log('✅ Lead Status History table created');

        // Create Quotes table
        db.exec(`
      CREATE TABLE IF NOT EXISTS quotes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lead_id INTEGER,
        package_id INTEGER,
        travelers INTEGER NOT NULL,
        travel_date TEXT NOT NULL,
        base_price REAL NOT NULL,
        seasonal_multiplier REAL DEFAULT 0,
        early_bird_discount REAL DEFAULT 0,
        last_minute_surcharge REAL DEFAULT 0,
        group_discount REAL DEFAULT 0,
        weekend_surcharge REAL DEFAULT 0,
        final_price REAL NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
        FOREIGN KEY (package_id) REFERENCES packages(id)
      );
    `);
        console.log('✅ Quotes table created');

        // Create indexes
        db.exec(`
      CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
      CREATE INDEX IF NOT EXISTS idx_leads_event ON leads(event_id);
      CREATE INDEX IF NOT EXISTS idx_packages_event ON packages(event_id);
      CREATE INDEX IF NOT EXISTS idx_quotes_lead ON quotes(lead_id);
    `);
        console.log('✅ Indexes created');

        console.log('\n🎉 Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
};

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    migrate();
    process.exit(0);
}

export default migrate;
