-- Demo Data Migration
-- Run this script to populate the database with initial demo data.

-- -----------------------------------------------------------------------------
-- 1. Create Zones
-- -----------------------------------------------------------------------------
INSERT INTO zones (id, name, area_description) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'North District', 'Suburbs and residential areas in the North.'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Central District', 'Downtown and business district areas.'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'East District', 'Eastern expansion zones.')
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- 2. Create Users (Leaders first to assign to groups)
-- -----------------------------------------------------------------------------

-- Pastor (Head)
INSERT INTO users (id, first_name, last_name, primary_email, role, status, mobile_phone, gender, birth_date) VALUES
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b01', 'Abraham', 'Tekle', 'abraham.tekle@summit.org', 'Pastor', 'Active', '+251911000001', 'Male', '1975-05-15');

-- Zone Leader (North)
INSERT INTO users (id, first_name, last_name, primary_email, role, status, mobile_phone, gender) VALUES
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', 'Sarah', 'Kebede', 'sarah.k@summit.org', 'Zone Leader', 'Active', '+251911000002', 'Female');

-- Zone Leader (Central)
INSERT INTO users (id, first_name, last_name, primary_email, role, status, mobile_phone, gender) VALUES
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b03', 'Dawit', 'Alemu', 'dawit.a@summit.org', 'Zone Leader', 'Active', '+251911000003', 'Male');

-- Cell Leaders
INSERT INTO users (id, first_name, last_name, primary_email, role, status, mobile_phone, gender) VALUES
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b04', 'Yonas', 'Bekele', 'yonas.b@summit.org', 'Cell Leader', 'Active', '+251911000004', 'Male'), -- North Cell Leader
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', 'Marta', 'Girma', 'marta.g@summit.org', 'Cell Leader', 'Active', '+251911000005', 'Female'); -- Central Cell Leader

-- Members
INSERT INTO users (id, first_name, last_name, primary_email, role, status, mobile_phone, gender, assigned_counselor_id) VALUES
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b06', 'Hanna', 'Tesfaye', 'hanna.t@gm.com', 'Member', 'Active', '+251911000006', 'Female', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b04'), -- Counseled by Yonas
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b07', 'Robel', 'Assefa', 'robel.a@gm.com', 'Member', 'Active', '+251911000007', 'Male', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b04'), -- Counseled by Yonas
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b08', 'Tigist', 'Hailu', 'tigist.h@gm.com', 'Member', 'Active', '+251911000008', 'Female', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b05'); -- Counseled by Marta


-- -----------------------------------------------------------------------------
-- 3. Create Groups (Cells)
-- -----------------------------------------------------------------------------

INSERT INTO groups (id, name, zone_id, leader_id, location, meeting_day, status) VALUES
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c01', 'Grace Fellowship', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b04', 'Bole Area', 'Wednesday', 'Active'),
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c02', 'Shalom Cell', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', 'Piassa Area', 'Friday', 'Active');


-- -----------------------------------------------------------------------------
-- 4. Update Users with Group Assignments (Circular Link)
-- -----------------------------------------------------------------------------

-- Assign Yonas & Members to Grace Fellowship
UPDATE users SET assigned_group_id = 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c01' 
WHERE id IN ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b04', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b06', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b07');

-- Assign Marta & Members to Shalom Cell
UPDATE users SET assigned_group_id = 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c02' 
WHERE id IN ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b08');

