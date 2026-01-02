const db = require('../config/db');

class Zone {
    static async findAll() {
        const query = 'SELECT * FROM zones ORDER BY name';
        const { rows } = await db.query(query);
        return rows;
    }

    static async findById(id) {
        const query = 'SELECT * FROM zones WHERE id = $1';
        const { rows } = await db.query(query, [id]);
        return rows[0];
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

    static async update(id, zoneData) {
        const { name, areaDescription } = zoneData;
        const query = `
            UPDATE zones 
            SET name = COALESCE($1, name), 
                area_description = COALESCE($2, area_description),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
            RETURNING *
        `;
        const { rows } = await db.query(query, [name, areaDescription, id]);
        return rows[0];
    }

    static async delete(id) {
        const query = 'DELETE FROM zones WHERE id = $1 RETURNING id';
        const { rows } = await db.query(query, [id]);
        return rows[0];
    }
}

module.exports = Zone;
