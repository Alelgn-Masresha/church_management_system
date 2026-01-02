const db = require('../config/db');

class Child {
    static async findAllByParent(parentId) {
        const query = 'SELECT * FROM children WHERE parent_id = $1';
        const { rows } = await db.query(query, [parentId]);
        return rows;
    }

    static async create(childData) {
        const { parentId, fullName, gender, birthDate, isChristian, isMember, mobileNumber } = childData;

        const val = (v) => (v === '' || v === undefined ? null : v);

        const query = `
            INSERT INTO children (
                parent_id, full_name, gender, birth_date, is_christian, is_member, mobile_number
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;

        const values = [
            parentId,
            val(fullName),
            val(gender),
            val(birthDate),
            isChristian || false,
            isMember || false,
            val(mobileNumber)
        ];

        const { rows } = await db.query(query, values);
        return rows[0];
    }

    static async update(id, childData) {
        // Dynamic update
        const allowedFields = {
            fullName: 'full_name',
            gender: 'gender',
            birthDate: 'birth_date',
            isChristian: 'is_christian',
            isMember: 'is_member',
            mobileNumber: 'mobile_number'
        };

        const updates = [];
        const values = [];
        let counter = 1;

        Object.keys(childData).forEach(key => {
            if (allowedFields[key] && childData[key] !== undefined) {
                updates.push(`${allowedFields[key]} = $${counter}`);
                values.push(childData[key]);
                counter++;
            }
        });

        if (updates.length === 0) return null;

        values.push(id);
        const query = `
            UPDATE children 
            SET ${updates.join(', ')}
            WHERE id = $${counter}
            RETURNING *
        `;

        const { rows } = await db.query(query, values);
        return rows[0];
    }

    static async delete(id) {
        const query = 'DELETE FROM children WHERE id = $1 RETURNING id';
        const { rows } = await db.query(query, [id]);
        return rows[0];
    }
}

module.exports = Child;
