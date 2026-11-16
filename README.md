# Merchant Opportunity Scoring Studio

An independent, offline HTML/CSS/JavaScript prototype for the **Heureka Group / Árukereső Key Account Manager case study**. The interface uses Árukereső-inspired colors (`#0196ff` blue and `#fe660a` orange). It is **not** an official Árukereső product or internal scoring standard.

## Getting started

Open `index.html` in a modern browser (Chrome, Safari, Firefox). Keep `index.html`, `styles.css`, and `app.js` in the same folder. No installation, account, or internet connection is required. Alternatively, open the included standalone file `Merchant_Opportunity_Standalone.html` (provided alongside the ZIP), which contains all code in a single file.

Use the **Score calculator** to enter merchant inputs, check feature flags, and see the score update live. Click **Add to ranking** to save a merchant in this browser. Under **Merchant ranking**, load all 20 sample merchants, compare scores, edit/remove entries, or export the list as CSV. Under **Scoring methodology**, adjust the two benchmark thresholds.

Saved merchants and benchmark settings are stored only in this browser's `localStorage`; they are not sent anywhere. In some browser configurations (especially opening local files), localStorage may not persist after restart; the calculator still works.

## Where do the points cap out?

The case study normalized monetary metrics to the maximum among the **20 fictional merchants**:

- **PPC budget potential**: **€4,000/month** → **35/35** PPC points. Formula: `min(PPC / PPC benchmark, 1) * 35`.
- **Estimated webshop monthly revenue**: **€300,000/month** → **10/10** revenue points. Formula: `min(revenue / revenue benchmark, 1) * 10`.

With this web app, those values become **fixed, editable thresholds** so individual merchants are assessed consistently, even when other merchants are added or removed. For instance, €8,000 PPC budget potential still produces 35 points if the benchmark is €4,000. Change thresholds on the Methodology page if necessary, and score results will recalculate accordingly.

## Original six weights

| Criterion | Max points | Case-study rules |
| --- | ---: | --- |
| PPC Budget Potential | 35 | `min(budget / benchmark, 1) * 35` |
| Current Activity Status | 25 | Base score + feature bonuses, capped at 25 |
| Price Index Position | 15 | Cheaper = 15, Average = 9, More expensive = 2 |
| Estimated Monthly Revenue | 10 | `min(revenue / benchmark, 1) * 10` |
| Competition Presence | 10 | High = 10, Medium = 6⅔, Low = 3⅓ |
| Product Category | 5 | Neutral +5 for every category |

Activity base scores: Not on Heureka **11**, Feed submitted **14** (plus **+1** for prepared feed), FREE **12**, Active PPC **12**, Active PPC (low spend) **15**. Additional scores: Bidding **+2**, Marketplace **+2**, VBC **+1**, OCM implemented **+1**, OCM OK data **+3** (OCM states mutually exclusive). For consistency, Bidding and Marketplace require an active PPC lifecycle. A blocked merchant has activity score **0** and is excluded from outreach ranking, but its other criteria are still calculated and displayed, matching the workbook.

**Important practical ceiling**: although Activity Status has a theoretical cap of 25, the maximum attainable under the model's current compatible base + bonus combinations is **23**. The maximum attainable overall score is therefore **98/100**, not 100. This is preserved from the case-study model rather than silently adjusted.

## Verification

The scoring engine was regression-tested against **all 20 rows** of `Arukereso_KAM_Opportunity_Scoring_Model.xlsx`, with **zero mismatches**. Examples:

- SmartHomeX: **93.00 / 100**
- FreshAir Appliances: **77.625 / 100**
- CyclePro Shop: **76.9167 / 100**
- FitZonePro: **68.875 / 100**

## Scope and caveats

This is a *merchant opportunity-prioritization score*, **not** a validated measure of profit, merchant health, marketing effectiveness, or incremental Heureka revenue. Estimated PPC budget is **potential**, not necessarily incremental platform spend. Weights and micro-point values are analyst assumptions for the fictional case study. A real internal rollout would require historical validation, observable spend and margin data, stakeholder review, security controls, and an approved data source.
