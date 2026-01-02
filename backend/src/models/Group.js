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

  static async findById(id) {
    const query = `
            SELECT g.*, z.name as zone_name, 
                   u.first_name as leader_first_name, u.last_name as leader_last_name
            FROM groups g
            LEFT JOIN zones z ON g.zone_id = z.id
            LEFT JOIN users u ON g.leader_id = u.id
            WHERE g.id = $1
        `;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }

  static async create(groupData) {
    const { name, zoneId, leaderId, location, meetingDay, meetingTime, status } = groupData;
    const query = `
            INSERT INTO groups (name, zone_id, leader_id, location, meeting_day, meeting_time, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
    const { rows } = await db.query(query, [
      name, zoneId, leaderId, location, meetingDay, meetingTime, status || 'Active'
    ]);
    return rows[0];
  }

  static async update(id, groupData) {
    const allowedFields = {
      name: 'name',
      zoneId: 'zone_id',
      leaderId: 'leader_id',
      location: 'location',
      meetingDay: 'meeting_day',
      meetingTime: 'meeting_time',
      status: 'status'
    };

    const updates = [];
    const values = [];
    let counter = 1;

    Object.keys(groupData).forEach(key => {
      if (allowedFields[key] && groupData[key] !== undefined) {
        updates.push(`${allowedFields[key]} = $${counter}`);
        values.push(groupData[key]);
        counter++;
      }
    });

    if (updates.length === 0) return null;

    values.push(id);
    const query = `
            UPDATE groups 
            SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $${counter}
            RETURNING *
        `;

    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM groups WHERE id = $1 RETURNING id';
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }
}

module.exports = Group;
