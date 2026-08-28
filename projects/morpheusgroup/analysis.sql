-- MorpheusGroup — Customer Health & Churn Analysis
-- Import your original analyzed CSV as: morpheusgroup_customer_data
-- SQLite-compatible

-- Churn by plan
SELECT
    plan,
    COUNT(*) AS total_customers,
    SUM(CASE WHEN churned = 'Yes' THEN 1 ELSE 0 END) AS churned_customers,
    ROUND(
        100.0 * SUM(CASE WHEN churned = 'Yes' THEN 1 ELSE 0 END) / COUNT(*),
        1
    ) AS churn_rate_pct
FROM morpheusgroup_customer_data
GROUP BY plan
ORDER BY churn_rate_pct DESC;

-- Feature adoption bands
SELECT
    CASE
        WHEN feature_adoption < 40 THEN 'Under 40%'
        WHEN feature_adoption < 60 THEN '40-59%'
        WHEN feature_adoption < 80 THEN '60-79%'
        ELSE '80%+'
    END AS feature_adoption_band,
    COUNT(*) AS customers,
    ROUND(
        100.0 * SUM(CASE WHEN churned = 'Yes' THEN 1 ELSE 0 END) / COUNT(*),
        1
    ) AS churn_rate_pct
FROM morpheusgroup_customer_data
GROUP BY feature_adoption_band
ORDER BY churn_rate_pct DESC;

-- Seat utilization bands
SELECT
    CASE
        WHEN 100.0 * active_users_30d / seats_purchased < 40 THEN 'Under 40%'
        WHEN 100.0 * active_users_30d / seats_purchased < 60 THEN '40-59%'
        WHEN 100.0 * active_users_30d / seats_purchased < 80 THEN '60-79%'
        ELSE '80%+'
    END AS seat_utilization_band,
    COUNT(*) AS customers,
    ROUND(
        100.0 * SUM(CASE WHEN churned = 'Yes' THEN 1 ELSE 0 END) / COUNT(*),
        1
    ) AS churn_rate_pct
FROM morpheusgroup_customer_data
GROUP BY seat_utilization_band
ORDER BY churn_rate_pct DESC;

-- Unresolved-ticket bands
SELECT
    CASE
        WHEN unresolved_ticke = 0 THEN '0'
        WHEN unresolved_ticke = 1 THEN '1'
        WHEN unresolved_ticke = 2 THEN '2'
        ELSE '3+'
    END AS unresolved_ticket_band,
    COUNT(*) AS customers,
    ROUND(
        100.0 * SUM(CASE WHEN churned = 'Yes' THEN 1 ELSE 0 END) / COUNT(*),
        1
    ) AS churn_rate_pct
FROM morpheusgroup_customer_data
GROUP BY unresolved_ticket_band
ORDER BY churn_rate_pct DESC;

-- Combined risk profile
SELECT
    CASE
        WHEN feature_adoption < 60 THEN 'Low'
        WHEN feature_adoption < 80 THEN 'Medium'
        ELSE 'High'
    END AS adoption_level,
    CASE
        WHEN 100.0 * active_users_30d / seats_purchased < 60 THEN 'Low'
        WHEN 100.0 * active_users_30d / seats_purchased < 80 THEN 'Medium'
        ELSE 'High'
    END AS seat_utilization_level,
    CASE
        WHEN unresolved_ticke = 0 THEN 'None'
        WHEN unresolved_ticke = 1 THEN 'One'
        ELSE 'Multiple'
    END AS unresolved_ticket_level,
    COUNT(*) AS customers,
    ROUND(
        100.0 * SUM(CASE WHEN churned = 'Yes' THEN 1 ELSE 0 END) / COUNT(*),
        1
    ) AS churn_rate_pct
FROM morpheusgroup_customer_data
GROUP BY adoption_level, seat_utilization_level, unresolved_ticket_level
ORDER BY churn_rate_pct DESC;
