CREATE INDEX IF NOT EXISTS idx_tickets_account ON tickets(account_id);
CREATE INDEX IF NOT EXISTS idx_surveys_account ON surveys(account_id);
CREATE INDEX IF NOT EXISTS idx_deals_account ON deals(account_id);
CREATE INDEX IF NOT EXISTS idx_usage_account_week ON product_usage(account_id, week_start);
CREATE INDEX IF NOT EXISTS idx_qi_owner ON quality_issues(current_owner_department, status);
