import pkg from 'pg';
import fs from 'fs';
import path from 'path';

const { Client } = pkg;

// Load .env file
const envPath = path.resolve(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
    console.error('.env file not found!');
    process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const parts = trimmed.split('=');
    if (parts.length >= 2) {
        const key = parts[0].trim();
        // Remove quotes if present
        let val = parts.slice(1).join('=').trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
        }
        env[key] = val;
    }
});

const connectionString = env.DIRECT_URL || env.DATABASE_URL;

if (!connectionString) {
    console.error('No DIRECT_URL or DATABASE_URL found in .env');
    process.exit(1);
}

console.log('Connecting to database...');
const client = new Client({
    connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

async function main() {
    try {
        await client.connect();
        console.log('Connected successfully.\n');

        console.log('--- Auth Users (from auth.users) ---');
        const res = await client.query('SELECT id, email, raw_user_meta_data, created_at FROM auth.users');
        if (res.rows.length === 0) {
            console.log('No users found in auth.users.');
        } else {
            res.rows.forEach(row => {
                console.log(`ID: ${row.id}`);
                console.log(`Email: ${row.email}`);
                console.log(`Meta: ${JSON.stringify(row.raw_user_meta_data)}`);
                console.log(`Created: ${row.created_at}`);
                console.log('-----------------------------------');
            });
        }

        console.log('\n--- Public Users (from public.users) ---');
        const publicRes = await client.query('SELECT id, email, name, role FROM public.users');
        if (publicRes.rows.length === 0) {
            console.log('No users found in public.users.');
        } else {
            publicRes.rows.forEach(row => {
                console.log(`ID: ${row.id}`);
                console.log(`Email: ${row.email}`);
                console.log(`Name: ${row.name}`);
                console.log(`Role: ${row.role}`);
                console.log('-----------------------------------');
            });
        }

    } catch (err) {
        console.error('Error querying database:', err);
    } finally {
        await client.end();
    }
}

main();
