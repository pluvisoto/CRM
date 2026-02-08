CREATE TABLE IF NOT EXISTS finance_monthly_tax_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    month TEXT NOT NULL, -- Format 'YYYY-MM'
    rate DECIMAL(5, 2) NOT NULL, -- E.g. 16.00
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(month, user_id)
);

ALTER TABLE finance_monthly_tax_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their tax rates" ON finance_monthly_tax_rates
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
