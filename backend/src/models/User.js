const db = require('../config/db');

class User {
    static async findAll() {
        const query = `
      SELECT u.*, 
             z.name as group_name,
             c.first_name as counselor_first_name, c.last_name as counselor_last_name
      FROM users u
      LEFT JOIN groups g ON u.assigned_group_id = g.id
      LEFT JOIN zones z ON g.zone_id = z.id
      LEFT JOIN users c ON u.assigned_counselor_id = c.id
    `;
        const { rows } = await db.query(query);
        return rows;
    }

    static async findById(id) {
        const query = 'SELECT * FROM users WHERE id = $1';
        const { rows } = await db.query(query, [id]);
        return rows[0];
    }

    static async create(userData) {
        // Map helper to handle empty strings/undefined for dates/numbers
        const val = (v) => (v === '' || v === undefined ? null : v);
        const dateVal = (v) => (v === '' || v === undefined ? null : v);

        const {
            firstName, middleName, lastName,
            gender, birthDate, nationality,
            mobilePhone, extraMobile, homePhone, workPhone,
            primaryEmail, secondaryEmail,
            subCity, suburb, district, houseNumber, city, country,
            religiousBackground, dateOfSalvation, isBaptized, baptismDate, previousChurchName,
            maritalStatus, spouseName, marriageDate,
            occupation, professionalStatus,
            role, assignedGroupId, assignedCounselorId
        } = userData;

        const query = `
      INSERT INTO users (
        first_name, middle_name, last_name,
        gender, birth_date, nationality,
        mobile_phone, extra_mobile, home_phone, work_phone,
        primary_email, secondary_email,
        sub_city, suburb, district, house_number, city, country,
        religious_background, date_of_salvation, is_baptized, baptism_date, previous_church_name,
        marital_status, spouse_name, marriage_date,
        occupation, professional_status,
        role, assigned_group_id, assigned_counselor_id
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18,
        $19, $20, $21, $22, $23, $24, $25, $26,
        $27, $28, $29, $30, $31
      )
      RETURNING *
    `;

        const isBaptizedBool = isBaptized === 'Yes' || isBaptized === true;

        const values = [
            val(firstName), val(middleName), val(lastName),
            val(gender), dateVal(birthDate), val(nationality),
            val(mobilePhone), val(extraMobile), val(homePhone), val(workPhone),
            val(primaryEmail), val(secondaryEmail),
            val(subCity), val(suburb), val(district), val(houseNumber), val(city), val(country),
            val(religiousBackground), dateVal(dateOfSalvation), isBaptizedBool, dateVal(baptismDate), val(previousChurchName),
            val(maritalStatus), val(spouseName), dateVal(marriageDate),
            val(occupation), val(professionalStatus),
            val(role) || 'Member', val(assignedGroupId), val(assignedCounselorId)
        ];

        try {
            const { rows } = await db.query(query, values);
            return rows[0];
        } catch (error) {
            console.error("Error creating user:", error);
            throw error;
        }
    }

    static async update(id, userData) {
        // Dynamic update builder
        const allowedFields = {
            firstName: 'first_name',
            lastName: 'last_name',
            mobilePhone: 'mobile_phone',
            role: 'role',
            assignedCounselId: 'assigned_counselor_id',
            assignedGroupId: 'assigned_group_id',
            status: 'status'
        };

        const updates = [];
        const values = [];
        let counter = 1;

        Object.keys(userData).forEach(key => {
            console.log(`Processing key: ${key}, Value: ${userData[key]}, Allowed: ${allowedFields[key]}`);
            if (allowedFields[key] && userData[key] !== undefined) {
                updates.push(`${allowedFields[key]} = $${counter}`);
                values.push(userData[key]);
                counter++;
            }
        });

        if (updates.length === 0) return null;

        values.push(id);
        const query = `
            UPDATE users 
            SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $${counter}
            RETURNING *
        `;

        try {
            const { rows } = await db.query(query, values);
            return rows[0];
        } catch (err) {
            console.error('Update error:', err);
            throw err;
        }
    }

    static async delete(id) {
        const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
        const { rows } = await db.query(query, [id]);
        return rows[0];
    }

    static async findCounselees(counselorId) {
        const query = 'SELECT * FROM users WHERE assigned_counselor_id = $1';
        const { rows } = await db.query(query, [counselorId]);
        return rows;
    }
}

module.exports = User;
