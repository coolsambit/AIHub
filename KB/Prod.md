# Prod Topology

Prod mirrors Cert by design (same structure and control model).

![Prod Topology](diagrams/prod-topology.png)

Source: [diagrams/prod-topology.mmd](diagrams/prod-topology.mmd)

## Environment Configuration

### Agent Support

Reference: [agentmd](agentmd.md)

### Trouble shooting

Reference: [Troubles](README-TROUBLESHOOTING.md)

```mermaid
flowchart LR
    PRODF[Foundry Prod - EastUS2]

    PRODF --> PRODBU[BU Proj - Prod]
    PRODBU --> PRODAG[Application Groups]

    PRODAG --> PRODM[Models]
    PRODAG --> PRODA[Agents]
    PRODAG --> PRODD[Data and Indexes]

    PRODF --> PRODOBS[Observability and SLO Monitoring]
    PRODF --> PRODSEC[Security and Policy Controls]
```
