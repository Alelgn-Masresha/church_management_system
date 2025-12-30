const db = require('../config/db');

class Group {
    static async findAll() {
        const query = `
      SELECT g.*, z.name as zone_name, 
             u.first_name as leader_first_name, u.last_name as leader_last_name
      FROM groups g
      LEFT JOIN zones z ON g.zone_id = z.id
      LEFT JOIN users u ON g.leader_id = u.id
    `;
        const { rows } = await db.query(query);
        return rows;
    }

    static async create(groupData) {
        const { name, zoneId, leaderId, location } = groupData;
        const query = `
      INSERT INTO groups (name, zone_id, leader_id, location)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
        const { rows } = await db.query(query, [name, zoneId, leaderId, location]);
        return rows[0];
    }
}

module.exports = Group;
