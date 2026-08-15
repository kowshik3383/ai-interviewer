// lib/prompts/question-banks/html.ts

export const htmlBank = {
  language: "html",
  displayName: "HTML5",
  topics: [
    "semantic elements (<article>, <section>, <nav>, <header>, <aside>, <main>)",
    "accessibility (ARIA roles, aria-live, alt text, keyboard navigation, focus management)",
    "forms & validation (custom validity, pattern, input types, multipart/form-data, csrf)",
    "SEO basics (meta tags, open graph, robots, structured data JSON-LD, sitemap)",
    "doctype & rendering modes (quirks mode vs standards mode)",
    "multimedia (<picture>, <video>, <canvas>, srcset, responsive images)",
    "storage & caching (localStorage, sessionStorage, IndexedDB, service workers basics)",
    "DOM & Shadow DOM (web components, templates, slots, encapsulation)",
  ],
  codingChallenges: {
    junior: {
      title: "Accessible Registration Form",
      description: "Construct a semantic, accessible user registration form with validation for email, password (min 8 chars, 1 digit), role select, terms agreement checkbox, and submit button.",
      starterCode: `<!-- Create an accessible, semantic HTML5 registration form -->
<form action="/register" method="POST" class="auth-form" novalidate>
  <h2>Create Your Account</h2>
  
  <!-- Add name, email, password, role select, terms checkbox, and submit button with proper labels and ARIA attributes -->

</form>`,
      testCriteria: [
        "Uses semantic <form>, <fieldset>, <label>, <input>, <select>, <button>",
        "Every input has an associated <label> with for/id pairing",
        "Includes required validation attributes and accessible error placeholders",
      ],
    },
    mid: {
      title: "Semantic Accessible Product Card Component",
      description: "Build a semantic, highly accessible e-commerce product card with picture element, discount badge, star rating with aria-label, price with strikethrough, and add-to-cart button.",
      starterCode: `<article class="product-card" aria-labelledby="prod-1-title">
  <!-- Use <picture> with multiple sources for responsive images -->

  <!-- Product title, brand, rating with ARIA, price, and CTA button -->

</article>`,
      testCriteria: [
        "Uses <article> and <figure>/<picture> with proper alt description",
        "Ratings are accessible to screen readers with aria-label or sr-only text",
        "Add to cart button includes accessible description of the exact item",
      ],
    },
    senior: {
      title: "Web Component / Accessible Modal Dialog Template",
      description: "Create an accessible native dialog markup with trap focus attributes, aria-modal, title, description, form submission with method='dialog', and close trigger.",
      starterCode: `<dialog id="confirm-modal" aria-labelledby="dialog-title" aria-describedby="dialog-desc" aria-modal="true">
  <div class="dialog-content">
    <header>
      <h2 id="dialog-title">Delete Project Confirmation</h2>
      <button type="button" aria-label="Close dialog" class="btn-close">&times;</button>
    </header>
    <p id="dialog-desc">Are you sure you want to permanently delete this project? This action cannot be undone.</p>
    <form method="dialog" class="dialog-actions">
      <!-- Action buttons -->
    </form>
  </div>
</dialog>`,
      testCriteria: [
        "Semantic native <dialog> element with aria-modal and describedby",
        "Form with method='dialog' for native closing without JavaScript",
        "Accessible close and cancel controls with proper focus targets",
      ],
    },
  },
};
