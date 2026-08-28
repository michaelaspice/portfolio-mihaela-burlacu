-- Aurority — validated business investigations
-- Reference date for the synthetic scenario: 2026-08-27

-- 01. Executive customer metric snapshot
SELECT
  ROUND(AVG(CASE WHEN survey_type='CSAT' THEN score END),2) AS avg_csat,
  ROUND(AVG(CASE WHEN survey_type='NPS' THEN score END),2) AS avg_nps
FROM surveys;

-- 02. Open Quality Issues: who currently owes the next step?
SELECT current_owner_department, severity, COUNT(*) AS open_issues
FROM quality_issues
WHERE status <> 'Closed'
GROUP BY current_owner_department, severity
ORDER BY open_issues DESC;

-- 03. Northstar accountability trail
SELECT q.quality_issue_id, q.summary, q.current_owner_department,
       r.from_department, r.to_department, r.status AS request_status,
       r.response_text
FROM quality_issues q
LEFT JOIN interdepartmental_requests r
  ON q.quality_issue_id = r.quality_issue_id
WHERE q.account_id='AC0150';

-- 04. Low CSAT is a signal, not automatic agent blame.
-- Only QA-reviewed low-CSAT interactions are included so the comparison is meaningful.
SELECT s.account_id, s.score AS csat, t.ticket_id, t.resolution_status,
       q.overall_score, q.agent_controlled
FROM surveys s
JOIN tickets t ON s.linked_interaction_id=t.ticket_id
JOIN qa_reviews q ON t.ticket_id=q.ticket_id
WHERE s.survey_type='CSAT' AND s.score<=2
ORDER BY q.agent_controlled, q.overall_score DESC;

-- 05. Sales handover failure: baseline vs recent six weeks
WITH x AS (
  SELECT
    CASE WHEN date(created_at) >= date('2026-08-27','-42 day')
         THEN 'recent_6w' ELSE 'baseline' END AS period,
    COUNT(*) AS won_deals,
    SUM(CASE WHEN CAST(handover_complete AS INTEGER)=0 THEN 1 ELSE 0 END) AS failed
  FROM deals
  WHERE stage='Closed Won'
  GROUP BY period
)
SELECT period, won_deals, failed,
       ROUND(100.0*failed/NULLIF(won_deals,0),1) AS failure_rate_pct
FROM x;

-- 06. Enterprise conversion deterioration: historical vs recent six weeks
WITH x AS (
  SELECT
    CASE WHEN date(created_at) >= date('2026-08-27','-42 day')
         THEN 'recent_6w' ELSE 'baseline' END AS period,
    SUM(CASE WHEN stage='Closed Won' THEN 1 ELSE 0 END) AS won,
    SUM(CASE WHEN stage IN ('Closed Won','Closed Lost') THEN 1 ELSE 0 END) AS closed
  FROM deals
  WHERE segment='Enterprise'
  GROUP BY period
)
SELECT period, won, closed,
       ROUND(100.0*won/NULLIF(closed,0),1) AS win_rate_pct
FROM x;

-- 07. Recent Enterprise loss reasons
SELECT loss_reason, COUNT(*) AS lost_deals, SUM(amount) AS pipeline_value
FROM deals
WHERE stage='Closed Lost'
  AND segment='Enterprise'
  AND date(created_at) >= date('2026-08-27','-42 day')
GROUP BY loss_reason
ORDER BY lost_deals DESC, pipeline_value DESC;

-- 08. Accountability: interdepartmental response status
SELECT to_department, status, COUNT(*) AS requests
FROM interdepartmental_requests
GROUP BY to_department, status
ORDER BY requests DESC;
