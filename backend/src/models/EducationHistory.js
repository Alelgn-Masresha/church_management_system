const db = require('../config/db');

class EducationHistory {
    static async findAllByUser(userId) {
        const query = 'SELECT * FROM education_history WHERE user_id = $1';
        const { rows } = await db.query(query, [userId]);
        return rows;
    }

    static async create(eduData) {
        const { userId, institution, level, type, startYear, endYear } = eduData;

        const val = (v) => (v === '' || v === undefined ? null : v);

        const query = `
            INSERT INTO education_history (
                user_id, institution, level, type, start_year, end_year
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;

        const values = [
            userId,
            val(institution),
            val(level),
            val(type),
            val(startYear),
            val(endYear)
        ];

        const { rows } = await db.query(query, values);
        return rows[0];
    }

    static async update(id, eduData) {
        const allowedFields = {
            institution: 'institution',
            level: 'level',
            type: 'type',
            startYear: 'start_year',
            endYear: 'end_year'
        };

        const updates = [];
        const values = [];
        let counter = 1;

        Object.keys(eduData).forEach(key => {
            if (allowedFields[key] && eduData[key] !== undefined) {
                updates.push(`${allowedFields[key]} = $${counter}`);
                values.push(eduData[key]);
                counter++;
            }
        });

        if (updates.length === 0) return null;

        values.push(id);
        const query = `
            UPDATE education_history
            SET ${updates.join(', ')}
            WHERE id = $${counter}
            RETURNING *
        `;

        const { rows } = await db.query(query, values);
        return rows[0];
    }

    static async delete(id) {
        const query = 'DELETE FROM education_history WHERE id = $1 RETURNING id';
        const { rows } = await db.query(query, [id]);
        return rows[0];
    }
}

module.exports = EducationHistory;
