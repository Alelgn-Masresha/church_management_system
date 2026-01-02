const db = require('../config/db');

class PastoralNote {
    static async findAllByMember(memberId) {
        // We join to get author name
        const query = `
            SELECT pn.*, 
                   u.first_name as author_first_name, u.last_name as author_last_name
            FROM pastoral_notes pn
            LEFT JOIN users u ON pn.author_id = u.id
            WHERE pn.member_id = $1
            ORDER BY pn.created_at DESC
        `;
        const { rows } = await db.query(query, [memberId]);
        return rows;
    }

    static async create(noteData) {
        const { memberId, authorId, title, content, noteType, location, category, isRedFlag, status } = noteData;

        const val = (v) => (v === '' || v === undefined ? null : v);

        const query = `
            INSERT INTO pastoral_notes (
                member_id, author_id, title, content, note_type, location, category, is_red_flag, status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `;

        const values = [
            memberId,
            authorId,
            val(title),
            val(content),
            val(noteType),
            val(location),
            val(category),
            isRedFlag || false,
            status || 'new'
        ];

        const { rows } = await db.query(query, values);
        return rows[0];
    }

    static async update(id, noteData) {
        const allowedFields = {
            title: 'title',
            content: 'content',
            noteType: 'note_type',
            location: 'location',
            category: 'category',
            isRedFlag: 'is_red_flag',
            status: 'status'
        };

        const updates = [];
        const values = [];
        let counter = 1;

        Object.keys(noteData).forEach(key => {
            if (allowedFields[key] && noteData[key] !== undefined) {
                updates.push(`${allowedFields[key]} = $${counter}`);
                values.push(noteData[key]);
                counter++;
            }
        });

        if (updates.length === 0) return null;

        values.push(id);
        const query = `
            UPDATE pastoral_notes
            SET ${updates.join(', ')}
            WHERE id = $${counter}
            RETURNING *
        `;

        const { rows } = await db.query(query, values);
        return rows[0];
    }

    static async delete(id) {
        const query = 'DELETE FROM pastoral_notes WHERE id = $1 RETURNING id';
        const { rows } = await db.query(query, [id]);
        return rows[0];
    }
}

module.exports = PastoralNote;
