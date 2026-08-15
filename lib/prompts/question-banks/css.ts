// lib/prompts/question-banks/css.ts

export const cssBank = {
  language: "css",
  displayName: "CSS3 / Modern CSS",
  topics: [
    "box model (content, padding, border, margin, box-sizing: border-box vs content-box)",
    "flexbox (flex-direction, justify-content, align-items, flex-grow, flex-shrink, flex-basis, gap)",
    "grid (grid-template-columns, fr units, minmax, auto-fit vs auto-fill, grid-areas, subgrid)",
    "specificity & cascade (inline, IDs, classes, elements, !important, cascade layers @layer, :where vs :is)",
    "responsive design (media queries, container queries @container, clamp(), calc(), viewport units)",
    "animations & transitions (keyframes, cubic-bezier, hardware acceleration, will-change, prefers-reduced-motion)",
    "positioning (static, relative, absolute, fixed, sticky, stacking context & z-index rules)",
    "CSS variables & modern color formats (custom properties, lch, oklch, color-mix, accent-color)",
  ],
  codingChallenges: {
    junior: {
      title: "Responsive Flexbox Hero & Navigation Bar",
      description: "Style a modern responsive navbar with brand logo on left, centered links, and CTA on right that wraps cleanly on mobile viewports.",
      starterCode: `/* Write CSS for a responsive, fluid navigation header */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #0f172a;
  color: #f8fafc;
}

.nav-links {
  /* Style the navigation links list using flexbox */
}

@media (max-width: 768px) {
  /* Handle mobile layout */
}
`,
      testCriteria: [
        "Uses modern flexbox properties effectively",
        "Proper spacing, vertical alignment, and margin collapsing prevention",
        "Responsive media query breakpoint adaptation",
      ],
    },
    mid: {
      title: "Dynamic Responsive Grid with auto-fit and minmax",
      description: "Create an adaptive e-commerce / dashboard card grid that automatically fills available columns without requiring rigid media queries, with equal height cards and smooth hover effects.",
      starterCode: `/* Create an auto-responsive grid layout */
.card-grid {
  display: grid;
  /* Use repeat, auto-fit / auto-fill, and minmax */
  gap: 1.5rem;
  padding: 2rem;
}

.card {
  display: flex;
  flex-direction: column;
  background: #1e293b;
  border-radius: 0.75rem;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
}
`,
      testCriteria: [
        "Uses grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))",
        "Cards stretch uniformly and footer pin to bottom with margin-top: auto",
        "Smooth transition and GPU-accelerated transforms",
      ],
    },
    senior: {
      title: "Container Queries & Theme Cascade Architecture",
      description: "Implement modern container queries (@container) so a card switches between horizontal and vertical orientations based on its parent container width, with design tokens using CSS variables.",
      starterCode: `:root {
  --primary: oklch(0.65 0.24 260);
  --surface: oklch(0.2 0.03 260);
  --text-main: oklch(0.98 0.01 260);
}

.container-wrapper {
  container-type: inline-size;
  container-name: card-container;
}

.adaptive-card {
  display: flex;
  flex-direction: column;
  background: var(--surface);
  color: var(--text-main);
}

@container card-container (min-width: 500px) {
  .adaptive-card {
    flex-direction: row;
    align-items: center;
  }
}
`,
      testCriteria: [
        "Correct container-type and container query syntax",
        "Dynamic adaptation without window resize dependencies",
        "Fluid typography using clamp() and CSS custom properties",
      ],
    },
  },
};
