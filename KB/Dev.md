# Dev Topology

Supporting all Business Units in Dev from a single shared Dev platform in EastUS2.

![Dev Topology](diagrams/dev-topology.png)

Source: [diagrams/dev-topology.mmd](diagrams/dev-topology.mmd)

## Environment Configuration

### Agent Support

Reference: [agentmd](agentmd.md)

### Trouble shooting

Reference: [Troubles](README-TROUBLESHOOTING.md)

```mermaid
flowchart LR
    DEVF[Foundry Dev - EastUS2]

    DEVF --> DEVGOV[Shared Dev Governance]
    DEVF --> DEVSH[Shared Dev Services]

    DEVF --> BU1[BU Proj - Dev - BU1]
    DEVF --> BU2[BU Proj - Dev - BU2]
    DEVF --> BUN[BU Proj - Dev - BU N]

    BU1 --> BU1M[Models]
    BU1 --> BU1A[Agents]
    BU1 --> BU1D[Data and Indexes]

    BU2 --> BU2M[Models]
    BU2 --> BU2A[Agents]
    BU2 --> BU2D[Data and Indexes]

    BUN --> BUNM[Models]
    BUN --> BUNA[Agents]
    BUN --> BUND[Data and Indexes]
```
