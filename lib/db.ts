import { Pool, type QueryResultRow } from "pg";

declare global {
  var pool: Pool | undefined;
}

function getPool(): Pool {
  if (!globalThis.pool) {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error("DATABASE_URL is required");
    }

    globalThis.pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 5, // prevent too many connections
    });
  }

  return globalThis.pool;
}

// 🔹 Generic query
export async function query<T extends QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  const pool = getPool();
  const result = await pool.query<T>(text, params);
  return result.rows;
}

// 🔹 Get single numeric value
export async function queryValue(
  text: string,
  params: unknown[] = []
): Promise<number> {
  const rows = await query<{ value: string | number | null }>(text, params);
  const raw = rows[0]?.value;
  if (raw === null || raw === undefined) return 0;
  return Number(raw) || 0;
}

// 🔹 Ensure schema (auto-create tables)
let schemaReady = false;

export async function ensureSchema(): Promise<void> {
  if (schemaReady) return;

  const pool = getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS suppliers (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(100) NOT NULL UNIQUE,
      area VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS purchases (
      id BIGSERIAL PRIMARY KEY,
      supplier_id BIGINT REFERENCES suppliers(id),
      chain_type VARCHAR(20) NOT NULL,
      kilograms NUMERIC(10,3),
      packet_count INT,
      price_per_kg NUMERIC(12,2),
      total_cost NUMERIC(14,2),
      purchase_date DATE,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS labours (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(255),
      phone VARCHAR(100) UNIQUE,
      rate_ot NUMERIC(10,2),
      rate_medium NUMERIC(10,2),
      active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS labour_transactions (
      id BIGSERIAL PRIMARY KEY,
      labour_id BIGINT REFERENCES labours(id),
      chain_type VARCHAR(20),
      packets_given INT,
      chains_received INT,
      rate_per_piece NUMERIC(10,2),
      amount_given NUMERIC(14,2),
      transaction_date DATE,
      notes VARCHAR(500),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS finishing_workers (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(255),
      phone VARCHAR(100) UNIQUE,
      area VARCHAR(255),
      rate_ot NUMERIC(10,2),
      rate_medium NUMERIC(10,2),
      active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS finishing_transactions (
      id BIGSERIAL PRIMARY KEY,
      finishing_worker_id BIGINT REFERENCES finishing_workers(id),
      chain_type VARCHAR(20),
      chains_given INT,
      finished_chains_received INT,
      rate_per_piece NUMERIC(10,2),
      transaction_date DATE,
      notes VARCHAR(500),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sales (
      id BIGSERIAL PRIMARY KEY,
      shop_name VARCHAR(255),
      shop_phone VARCHAR(100),
      shop_area VARCHAR(255),
      rate_ot NUMERIC(10,2),
      rate_medium NUMERIC(10,2),
      chain_type VARCHAR(20),
      chain_count INT,
      price_per_chain NUMERIC(12,2),
      total_amount NUMERIC(14,2),
      sale_date DATE,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS shops (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(100) UNIQUE,
      area VARCHAR(255),
      rate_ot NUMERIC(10,2),
      rate_medium NUMERIC(10,2),
      active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  schemaReady = true;
}