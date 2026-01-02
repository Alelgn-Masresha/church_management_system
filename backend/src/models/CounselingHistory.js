const db = require('../config/db');

class CounselingHistory {
    static async findAllByCounselee(counseleeId) {
        const query = `
            SELECT ch.*, 
                   u.first_name as counselor_first_name, u.last_name as counselor_last_name
            FROM counseling_history ch
            LEFT JOIN users u ON ch.counselor_id = u.id
            WHERE ch.counselee_id = $1
            ORDER BY ch.start_date DESC
        `;
        const { rows } = await db.query(query, [counseleeId]);
        return rows;
    }

    static async create(historyData) {
        const { counselorId, counseleeId, startDate, endDate, status, notes } = historyData;

        const val = (v) => (v === '' || v === undefined ? null : v);

        const query = `
            INSERT INTO counseling_history (
                counselor_id, counselee_id, start_date, end_date, status, notes
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;

        const values = [
            counselorId,
            counseleeId,
            val(startDate),
            val(endDate),
            status || 'Active',
            val(notes)
        ];

        const { rows } = await db.query(query, values);
        return rows[0];
    }

    static async update(id, historyData) {
        const allowedFields = {
            endDate: 'end_date',
            status: 'status',
            notes: 'notes'
        };

        const updates = [];
        const values = [];
        let counter = 1;

        Object.keys(historyData).forEach(key => {
            if (allowedFields[key] && historyData[key] !== undefined) {
                updates.push(`${allowedFields[key]} = $${counter}`);
                values.push(historyData[key]);
                counter++;
            }
        });

        if (updates.length === 0) return null;

        values.push(id);
        const query = `
            UPDATE counseling_history
            SET ${updates.join(', ')}
            WHERE id = $${counter}
            RETURNING *
        `;

        const { rows } = await db.query(query, values);
        return rows[0];
    }

    static async delete(id) {
        const query = 'DELETE FROM counseling_history WHERE id = $1 RETURNING id';
        const { rows } = await db.query(query, [id]);
        return rows[0];
    }
}

module.exports = CounselingHistory;
