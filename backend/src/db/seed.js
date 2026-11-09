/**
 * Seed script — creates the initial admin account.
 * Run once: node src/db/seed.js
 * Uses ADMIN_EMAIL and ADMIN_PASSWORD from .env
 */
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { getDB } from "./database.js";

dotenv.config();

const email    = process.env.ADMIN_EMAIL    || "admin@learnmate.com";
const password = process.env.ADMIN_PASSWORD || "Admin@1234";
const fullName = process.env.ADMIN_NAME     || "LearnMate Admin";

const db = getDB();

const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
if (existing) {
  console.log(`✅ Admin already exists: ${email}`);
  process.exit(0);
}

const hash = bcrypt.hashSync(password, 12);

db.prepare(`
  INSERT INTO users (full_name, email, password_hash, role, account_status)
  VALUES (?, ?, ?, 'admin', 'active')
`).run(fullName, email.toLowerCase(), hash);

const admin = db.prepare("SELECT id FROM users WHERE email = ?").get(email.toLowerCase());
db.prepare(`
  INSERT INTO student_profiles (user_id) VALUES (?)
`).run(admin.id);

console.log(`✅ Admin account created`);
console.log(`   Email   : ${email}`);
console.log(`   Password: ${password}`);
console.log(`   ⚠️  Change the password immediately after first login!`);
process.exit(0);
