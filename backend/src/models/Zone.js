const db = require('../config/db');

class Zone {
    static async findAll() {
        const query = 'SELECT * FROM zones ORDER BY name';
        const { rows } = await db.query(query);
        return rows;
    }

    static async create(zoneData) {
        const { name, areaDescription } = zoneData;
        const query = `
      INSERT INTO zones (name, area_description)
      VALUES ($1, $2)
      RETURNING *
    `;
        const { rows } = await db.query(query, [name, areaDescription]);
        return rows[0];
    }
}

module.exports = Zone;
