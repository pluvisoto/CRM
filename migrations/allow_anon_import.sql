-- Allow anonymous access for data import
DROP POLICY IF EXISTS "Allow anon full access" ON financial_baseline;

CREATE POLICY "Allow anon full access"
ON financial_baseline FOR ALL
TO anon
USING (true)
WITH CHECK (true);
