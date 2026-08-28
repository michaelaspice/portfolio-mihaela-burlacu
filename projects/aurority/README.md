# Aurority — Quality Operations System

A portfolio case study designing a centralized **Quality Operations and accountability layer** across Support, Sales, Product and Operations.

> **Detect → Diagnose → Assign → Respond → Act → Recheck → Learn**

Aurority does not replace Zendesk, HubSpot, Aircall, Notion or Slack. It connects the minimum structured signals needed to detect performance changes, investigate causes, route work and make ownership visible.

## Why this project exists

Fast-growing teams often have plenty of dashboards but weak cross-functional accountability. A low CSAT score can become “an agent problem,” a Product escalation can disappear in Slack, and a Sales handover issue can be discussed repeatedly without anyone measuring whether the fix worked.

Aurority is designed around one principle:

**The system creates accountability, not micromanagement.**

## Synthetic company

62 customer-facing employees: 38 Support agents, 18 Sales reps and 6 functional/team leaders.

The dataset contains customer accounts, support tickets, calls, CSAT/NPS surveys, deals, revenue, weekly product usage, QA reviews, trigger events, Quality Issues, interdepartmental requests and actions.

## Validated scenarios

**Northstar Labs — customer risk**  
A €72k ARR account shows falling usage, CSAT 2/5 and unresolved Support cases. QA confirms the agents followed process correctly; the blocker belongs to Product. Aurority preserves one accountability trail while Support retains customer communication ownership.

**Enterprise commercial anomaly**  
Recent Enterprise win rate falls from **47.1%** historically to **22.2%**. The anomaly routes to Operations for diagnosis before being assigned to a functional team.

**Sales handover failure**  
Failure rises from **6.0%** to **20.0%** in the recent six-week window. Because the pattern is distributed rather than rep-specific, the first investigation is Process/System, not coaching.

## Repository

- `aurority.db` — SQLite analysis database
- `data/` — synthetic source tables
- `sql/` — validated business investigation queries
- `docs/architecture.md` — source → central layer → action architecture
- `docs/operating_model.md` — routing, accountability and communication model
- `docs/portfolio_case_study.md` — portfolio narrative
- `docs/validation_report.md` — scenario/data validation
- `docs/data_dictionary.csv` — field reference
- `dashboard/index.html` — static executive dashboard prototype

## Current snapshot

CSAT **3.96/5** · NPS **7.37/10** · Open Quality Issues **3**

All company names, people, accounts and operational data are synthetic and created solely for this portfolio project.
