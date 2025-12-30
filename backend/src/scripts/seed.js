const fs = require('fs');
const path = require('path');
const db = require('../config/db');

const seedDatabase = async () => {
    try {
        const sqlPath = path.join(__dirname, '../../../demo_data.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Running seed script...');
        await db.query(sql);
        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
};

seedDatabase();
