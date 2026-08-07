# Project Rules

- **CCTV Heatmap Boundaries**: When modifying the frontend or any CCTV visual analytics overlays (e.g., `MetroVisionIntelligence.tsx`), NEVER alter the boundary logic (like `getRandomPos`) that restricts the heatmap/swarm positioning. The coordinates are perfectly calibrated to match the physical bounds of the platform (avoiding the blue sign and the right pillar) and must remain unchanged to ensure demo fidelity.
