# Rendivia Revenue Potential Analysis (Data-Driven)

## Pricing Inputs (from current product)
- Starter: $99/mo, 500 renders included
- Growth: $299/mo, 2,500 renders included
- Scale: $999/mo, 10,000 renders included
- Overages: $0.02 per render

## Modeling Assumptions
Net new customers are assumed to already account for churn. Overages add a percentage uplift to MRR.

Scenario assumptions

| Scenario | Plan Mix (Starter/Growth/Scale) | Overages Uplift | Net New Customers / Mo |
| --- | --- | --- | --- |
| Conservative | 70% / 25% / 5% | +5% | 8 |
| Base | 60% / 30% / 10% | +10% | 15 |
| Aggressive | 50% / 35% / 15% | +15% | 25 |

Derived ARPA (average revenue per account, monthly)

| Scenario | ARPA |
| --- | --- |
| Conservative | ~$204 |
| Base | ~$274 |
| Aggressive | ~$350 |

Formula
- MRR = Active customers × ARPA
- ARR = MRR × 12

## Customer Counts Required for MRR Targets

| Target MRR | Conservative | Base | Aggressive |
| --- | --- | --- | --- |
| $10k | ~49 customers | ~37 customers | ~29 customers |
| $50k | ~245 customers | ~183 customers | ~143 customers |
| $100k | ~490 customers | ~365 customers | ~286 customers |

## Time to Targets (given net adds)

| Target MRR | Conservative | Base | Aggressive |
| --- | --- | --- | --- |
| $10k | ~7 months | ~3 months | ~2 months |
| $50k | ~31 months | ~12 months | ~6 months |
| $100k | ~61 months | ~24 months | ~12 months |

## MRR + ARR Projections (Illustrative)
MRR and ARR at key milestones assuming steady net adds.

| Scenario | Month 6 | Month 12 | Month 18 |
| --- | --- | --- | --- |
| Conservative | ~48 customers, ~$9.8k MRR, ~$118k ARR | ~96 customers, ~$19.6k MRR, ~$235k ARR | ~144 customers, ~$29.4k MRR, ~$353k ARR |
| Base | ~90 customers, ~$24.7k MRR, ~$296k ARR | ~180 customers, ~$49.3k MRR, ~$592k ARR | ~270 customers, ~$74.0k MRR, ~$888k ARR |
| Aggressive | ~150 customers, ~$52.5k MRR, ~$630k ARR | ~300 customers, ~$105k MRR, ~$1.26M ARR | ~450 customers, ~$157.5k MRR, ~$1.89M ARR |

## Practical Notes
- Overages can materially lift MRR if customers exceed render caps; even a 10% uplift meaningfully accelerates ARR.
- Enterprise contracts will skew ARR upward beyond this model.
- pSEO + API-first positioning should improve lead quality and ARPA (more Growth/Scale mix).

## What Moves the Numbers Most
- Plan mix shift toward Growth/Scale
- Net new customers per month
- Expansion via overages (heavy API usage)
- Retention and deep integration (lower churn)

