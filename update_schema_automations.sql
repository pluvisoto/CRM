-- Create table for Finance Automation Rules
CREATE TABLE IF NOT EXISTS finance_automation_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    percentage DECIMAL(10, 2) NOT NULL, -- Percentage to calculate (e.g., 6.00 for 6%)
    target_category_id UUID REFERENCES transaction_categories(id) ON DELETE SET NULL, -- Expense category to assign
    description_template TEXT, -- Template for the expense description
    trigger_source TEXT DEFAULT 'income', -- 'income' or 'expense' (currently only income supported)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE -- Optional, if per-user, otherwise system-wide
);

-- Enable RLS
ALTER TABLE finance_automation_rules ENABLE ROW LEVEL SECURITY;

-- Create policies (modify based on your auth setup, assuming authenticated users can manage their own or system rules)
CREATE POLICY "Users can manage their rules" ON finance_automation_rules
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- E.g. Seed some rules if needed, or leave empty.
-- INSERT INTO finance_automation_rules (name, percentage, trigger_source) VALUES ('Imposto Padrão', 6.0, 'income');
