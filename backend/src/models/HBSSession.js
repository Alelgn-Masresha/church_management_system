const db = require('../config/db');

class HBSSession {
    static mapRow(r) {
        if (!r) return null;
        let sDate = r.session_date;
        if (sDate instanceof Date) {
            // Format as YYYY-MM-DD locally to avoid UTC shifts
            sDate = `${sDate.getFullYear()}-${String(sDate.getMonth() + 1).padStart(2, '0')}-${String(sDate.getDate()).padStart(2, '0')}`;
        }
        return {
            ...r,
            id: r.id.toString(),
            startTime: r.start_time ? r.start_time.toString().substring(0, 5) : null,
            endTime: r.end_time ? r.end_time.toString().substring(0, 5) : null,
            sessionDate: sDate,
            discussionLeaderId: r.discussion_leader_id ? r.discussion_leader_id.toString() : null,
            groupId: r.group_id ? r.group_id.toString() : null,
            leaderFirstName: r.leader_first_name || r.first_name,
            leaderLastName: r.leader_last_name || r.last_name
        };
    }

    static async findAllByGroup(groupId) {
        const query = `
            SELECT s.id, s.group_id, s.topic, s.discussion_leader_id, s.status, s.start_time, s.end_time, s.created_at,
                   TO_CHAR(s.session_date, 'YYYY-MM-DD') as session_date,
                   u.first_name as leader_first_name, u.last_name as leader_last_name,
                   COALESCE((
                       SELECT jsonb_object_agg(member_id::text, is_present)
                       FROM session_attendance
                       WHERE session_id = s.id
                   ), '{}'::jsonb) as attendance
            FROM hbs_sessions s
            LEFT JOIN users u ON s.discussion_leader_id = u.id
            WHERE s.group_id = $1
            ORDER BY s.session_date DESC
        `;
        const { rows } = await db.query(query, [groupId]);
        return rows.map(r => this.mapRow(r));
    }

    static async create(sessionData) {
        const { groupId, sessionDate, topic, discussionLeaderId, status, startTime, endTime } = sessionData;

        const val = (v) => (v === '' || v === undefined ? null : v);

        const query = `
            INSERT INTO hbs_sessions (
                group_id, session_date, topic, discussion_leader_id, status, start_time, end_time
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;

        const values = [
            groupId,
            val(sessionDate),
            val(topic),
            val(discussionLeaderId),
            status || 'Scheduled',
            val(startTime),
            val(endTime)
        ];

        const { rows } = await db.query(query, values);
        return this.mapRow(rows[0]);
    }

    static async update(id, sessionData) {
        const allowedFields = {
            sessionDate: 'session_date',
            topic: 'topic',
            discussionLeaderId: 'discussion_leader_id',
            status: 'status',
            startTime: 'start_time',
            endTime: 'end_time'
        };

        const updates = [];
        const values = [];
        let counter = 1;

        Object.keys(sessionData).forEach(key => {
            if (allowedFields[key] && sessionData[key] !== undefined) {
                updates.push(`${allowedFields[key]} = $${counter}`);
                values.push(sessionData[key]);
                counter++;
            }
        });

        if (updates.length === 0) return null;

        values.push(id);
        const query = `
            UPDATE hbs_sessions
            SET ${updates.join(', ')}
            WHERE id = $${counter}
            RETURNING *
        `;

        const { rows } = await db.query(query, values);
        return this.mapRow(rows[0]);
    }

    static async delete(id) {
        const query = 'DELETE FROM hbs_sessions WHERE id = $1 RETURNING id';
        const { rows } = await db.query(query, [id]);
        return rows[0];
    }

    // Attendance Methods
    static async getAttendance(sessionId) {
        const query = `
            SELECT sa.*, u.first_name, u.last_name, u.mobile_phone
            FROM session_attendance sa
            JOIN users u ON sa.member_id = u.id
            WHERE sa.session_id = $1
        `;
        const { rows } = await db.query(query, [sessionId]);
        return rows;
    }

    static async recordAttendance(sessionId, attendanceData) {
        // attendanceData is array of { memberId, isPresent }
        // We will do this in a transaction if possible, or simple loop

        // First delete existing for this session (simpler "replace" logic)
        // Or upsert. Let's use upsert.

        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            for (const record of attendanceData) {
                const query = `
                    INSERT INTO session_attendance (session_id, member_id, is_present)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (session_id, member_id) 
                    DO UPDATE SET is_present = EXCLUDED.is_present
                `;
                await client.query(query, [sessionId, record.memberId, record.isPresent]);
            }

            await client.query('COMMIT');
            return { message: 'Attendance recorded' };
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }
}

module.exports = HBSSession;
