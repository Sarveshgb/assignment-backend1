import migrate from './migrate.js';
import seed from './seed.js';

const reset = async () => {
    console.log('🔄 Resetting database...\n');

    try {
        await migrate();
        console.log('');
        await seed();
        console.log('\n✅ Database reset complete!');
    } catch (error) {
        console.error('❌ Reset failed:', error);
        process.exit(1);
    }
};

reset().then(() => process.exit(0));
