# Cert Topology

Cert is intentionally aligned 1:1 with Prod in structure and controls.

![Cert Topology](diagrams/cert-topology.png)

Source: [diagrams/cert-topology.mmd](diagrams/cert-topology.mmd)

## Environment Configuration

### Agent Support

Reference: [agentmd](agentmd.md)

### Trouble shooting

Reference: [Troubles](README-TROUBLESHOOTING.md)

```mermaid
flowchart LR
    CERTF[Foundry Cert - EastUS2]

    CERTF --> CERTBU[BU Proj - Cert]
    CERTBU --> CERTAG[Application Groups]

    CERTAG --> CERTM[Models]
    CERTAG --> CERTA[Agents]
    CERTAG --> CERTD[Data and Indexes]

    CERTF --> CERTOBS[Observability and Evaluation]
    CERTF --> CERTSEC[Security and Policy Controls]
```
