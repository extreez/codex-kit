> Часть скилла stakeholder-comms (см. SKILL.md). Синтез phuryn/pm-skills
> (pm-execution/stakeholder-map) + Owl-Listener/ux-pgm-skills
> (stakeholder-comms/stakeholder-map), оба MIT. Было два почти
> одинаковых скилла на одну задачу в разных источниках — вместо
> дубля собран один: детальная grid+таблица первого источника плюс
> измерения stance/currency и правило re-map второго.

---
name: stakeholder-map
description: "Build a stakeholder map using a power/interest grid plus stance and currency, and generate a tailored communication plan per quadrant. Use when managing stakeholders, preparing for a launch, aligning cross-functional teams, or planning stakeholder engagement."
---

## Stakeholder Mapping & Communication Plan

Map stakeholders on a Power × Interest grid, note their stance and
currency, and create a tailored communication plan for each group.

### Context

You are helping build a stakeholder map for **$ARGUMENTS**.

If the user provides files (org charts, project briefs, team rosters), read them first. If they describe the product or initiative, use that context to infer likely stakeholders.

### Instructions

1. **Identify stakeholders**: List everyone who can accelerate or block the work — executives, engineering leads, designers, marketing, sales, support, legal, finance, external partners, end users.

2. **Classify each stakeholder** on four dimensions:
   - **Power/Influence** (High/Low): Their ability to influence decisions, resources, or outcomes
   - **Interest** (High/Low): How much the project affects them or how engaged they are
   - **Stance**: champion, supporter, neutral, sceptic, or blocker
   - **Currency**: what they actually value — speed, certainty, credit, risk reduction

3. **Place stakeholders in the Power × Interest grid**:

   | | High Interest | Low Interest |
   |---|---|---|
   | **High Power** | **Manage Closely** — regular 1:1s, involve in decisions, seek input early | **Keep Satisfied** — periodic updates, escalate only critical issues |
   | **Low Power** | **Keep Informed** — regular status updates, invite to demos, gather feedback | **Monitor** — light-touch updates, available on request |

4. **For each quadrant**, recommend communication frequency, format (1:1/email/Slack/meeting/dashboard), key messages, and the risk of neglecting this stakeholder.

5. **Create a communication plan table**:

   | Stakeholder | Role | Power | Interest | Stance | Currency | Strategy | Frequency | Channel |
   |---|---|---|---|---|---|---|---|---|

6. **Flag conflicts and sceptics**: stakeholders with competing interests, and for each sceptic/blocker — what would move their stance, framed in their currency, not yours.

7. **Identify who can influence the blockers** — a direct pitch to a blocker often works worse than routing through someone they trust.

Think step by step. Save the stakeholder map as a markdown document.

### Best Practices

- Stances shift — re-map at every major milestone, not once at kickoff
- Never surprise a high-influence stakeholder in public
- Win sceptics with their currency, not yours

---

### Further Reading

- [The Product Management Frameworks Compendium + Templates](https://www.productcompass.pm/p/the-product-frameworks-compendium)
- [Team Topologies: A Handbook to Set and Scale Product Teams](https://www.productcompass.pm/p/team-topologies-a-handbook-to-set)

