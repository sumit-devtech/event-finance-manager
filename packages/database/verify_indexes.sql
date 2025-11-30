-- SQL queries to verify indexes were created
-- Run these in your database (via Prisma Studio, psql, or Neon dashboard)

-- Check indexes on Event table
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'Event'
ORDER BY indexname;

-- Check indexes on Expense table
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'Expense'
ORDER BY indexname;

-- Check indexes on BudgetItem table
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'BudgetItem'
ORDER BY indexname;

-- Count all indexes
SELECT 
    schemaname, 
    tablename, 
    COUNT(indexname) as index_count
FROM pg_indexes 
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;

-- List all indexes (summary)
SELECT 
    tablename,
    indexname,
    CASE 
        WHEN indexdef LIKE '%CREATE UNIQUE%' THEN 'UNIQUE'
        WHEN indexdef LIKE '%CREATE INDEX%' THEN 'INDEX'
        ELSE 'OTHER'
    END as index_type
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

