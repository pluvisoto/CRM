-- Count total records
SELECT COUNT(*) FROM financial_baseline;

-- Check for suspicious categories (numeric)
SELECT DISTINCT categoria 
FROM financial_baseline 
WHERE categoria ~ '^[0-9.]+$'
LIMIT 10;

-- correct valid categories
SELECT categoria, count(*) 
FROM financial_baseline 
GROUP BY categoria 
ORDER BY count(*) DESC 
LIMIT 10;
