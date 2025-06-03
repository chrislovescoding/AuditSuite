# Blackwood Analytics Design Specification

## Brand Identity
- **Company Name**: Blackwood Analytics
- **Tagline**: Strategic Advisory Portal
- **Industry**: Strategic consulting for UK public sector
- **Logo**: Tree silhouette design (Blackwood_Analytics_Logo.png)

## Color Palette

### Primary Colors
```css
--blackwood-dark-blue: #173559    /* Primary brand color */
--blackwood-white: #FFFFFF        /* Pure white */
--blackwood-cream: #EDE5D4        /* Warm cream accent */
--blackwood-dark-grey: #494B4F    /* Secondary grey */
```

### UI Colors
```css
--dropdown-background: #35373A    /* Solid background for dropdowns/modals */
--overlay-dark: rgba(0, 0, 0, 0.7) /* Dark overlay for backgrounds */
```

### Glass Effect Colors
```css
--glass-light: rgba(255, 255, 255, 0.1)  /* Light frosted glass */
--glass-border: rgba(255, 255, 255, 0.2) /* Glass borders */
--glass-hover: rgba(255, 255, 255, 0.2)  /* Glass hover state */
```

### Status Colors
```css
--success: rgba(34, 197, 94, 0.2)   /* Green for success states */
--warning: rgba(234, 179, 8, 0.2)   /* Yellow for warnings */
--error: rgba(239, 68, 68, 0.2)     /* Red for errors */
```

## Typography

### Font Family
```css
font-family: 'Times New Roman', serif;
```

### Font Weights
- **Light (300)**: Primary headings, elegant text
- **Regular (400)**: Body text, form labels
- **Medium (500)**: Button text, emphasis
- **Bold (700)**: Logo text only

### Typography Scale
```css
/* Headings */
.heading-xl { font-size: 4xl; font-weight: 300; font-style: italic; } /* Page titles */
.heading-lg { font-size: 3xl; font-weight: 300; font-style: italic; } /* Section titles */
.heading-md { font-size: 2xl; font-weight: 300; } /* Card titles */
.heading-sm { font-size: xl; font-weight: 300; }  /* Subsection titles */

/* Body Text */
.body-lg { font-size: lg; font-weight: 300; }     /* Large body text */
.body-md { font-size: base; font-weight: 400; }   /* Standard body text */
.body-sm { font-size: sm; font-weight: 400; }     /* Small body text */
.body-xs { font-size: xs; font-weight: 400; }     /* Caption text */
```

## Background & Layout

### Primary Background
The primary background features a black and white (desaturated) image of London Bridge to maintain brand sophistication while ensuring optimal contrast for text readability.

```css
background-image: url('https://images.unsplash.com/photo-1533929736458-ca588d08c8be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80&sat=-100');
background-size: cover;
background-position: center;
background-attachment: fixed;
```

**Design Rationale**: The monochrome treatment:
- Enhances text readability across all glass elements
- Maintains professional, sophisticated aesthetic
- Reduces visual distraction from interface elements
- Ensures consistent brand presentation across all pages

### Background Overlay
```css
.dashboard-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 1;
  min-height: 100%;
}
```

## Glass Effects

### Primary Glass Effect
```css
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

### Glass Variations
```css
.glass-light { background: rgba(255, 255, 255, 0.05); }
.glass-medium { background: rgba(255, 255, 255, 0.1); }
.glass-strong { background: rgba(255, 255, 255, 0.15); }
```

## Component Specifications

### Header
```css
.header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 50;
  font-family: 'Times New Roman', serif;
}

.header-logo {
  height: 3rem; /* 48px */
}

.header-title {
  font-size: 2xl;
  font-weight: bold;
  color: white;
  letter-spacing: 0.025em;
}

.header-subtitle {
  font-size: sm;
  color: rgba(255, 255, 255, 0.7);
  font-style: italic;
}
```

### Cards & Containers
```css
.card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  padding: 2rem;
}

.card-hover {
  transition: all 0.3s ease;
}

.card-hover:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-4px);
  border-color: rgba(255, 255, 255, 0.4);
}
```

### Buttons

#### Primary Button
```css
.btn-primary {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  font-family: 'Times New Roman', serif;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: rgba(255, 255, 255, 0.3);
}
```

#### Secondary Button
```css
.btn-secondary {
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  font-family: 'Times New Roman', serif;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}
```

### Form Elements

#### Input Fields
```css
.input {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  color: white;
  font-family: 'Times New Roman', serif;
}

.input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.input:focus {
  outline: none;
  ring: 2px solid rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.4);
}
```

#### Labels
```css
.label {
  font-size: sm;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.5rem;
  font-family: 'Times New Roman', serif;
}
```

### Modals

#### Modal Container
```css
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 60;
  background: rgba(0, 0, 0, 0.7);
}

.modal-container {
  position: fixed;
  inset: 0;
  z-index: 70;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  font-family: 'Times New Roman', serif;
}

.modal-content {
  background: #35373A; /* Solid background for better readability */
  border: 6px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 42rem; /* 672px */
  max-height: 85vh;
  overflow-y: auto;
}
```

### Dropdowns
```css
.dropdown {
  background: #35373A;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  z-index: 50;
}

.dropdown-item {
  padding: 0.75rem 1.5rem;
  color: rgba(255, 255, 255, 0.95);
  transition: background-color 0.2s ease;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.1);
}
```

## Z-Index Hierarchy

```css
/* Z-Index Scale */
.z-background { z-index: 1; }    /* Background overlays */
.z-content { z-index: 10; }      /* Main content */
.z-header { z-index: 50; }       /* Header */
.z-dropdown { z-index: 50; }     /* Dropdown menus */
.z-modal-bg { z-index: 60; }     /* Modal backdrops */
.z-modal { z-index: 70; }        /* Modal content */
.z-tooltip { z-index: 80; }      /* Tooltips */
.z-toast { z-index: 90; }        /* Toast notifications */
```

## Special Design Elements

### Key Borders (Login, Modals)
```css
.special-border {
  border: 6px solid rgba(255, 255, 255, 0.2);
}
```

### Status Badges
```css
.badge-active {
  background: rgba(34, 197, 94, 0.2);
  color: rgb(187, 247, 208);
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.badge-pending {
  background: rgba(234, 179, 8, 0.2);
  color: rgb(254, 240, 138);
  border: 1px solid rgba(234, 179, 8, 0.3);
}

.badge-error {
  background: rgba(239, 68, 68, 0.2);
  color: rgb(252, 165, 165);
  border: 1px solid rgba(239, 68, 68, 0.3);
}
```

## Grid Layouts

### Dashboard Grid
```css
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
  gap: 1.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: 1.5rem;
}
```

### Responsive Breakpoints
```css
/* Mobile First Approach */
.mobile { max-width: 640px; }
.tablet { max-width: 768px; }
.desktop { max-width: 1024px; }
.large { max-width: 1280px; }
```

## Animation & Transitions

### Standard Transitions
```css
.transition-standard {
  transition: all 0.3s ease;
}

.transition-fast {
  transition: all 0.2s ease;
}

.transition-slow {
  transition: all 0.5s ease;
}
```

### Hover Effects
```css
.hover-lift:hover {
  transform: translateY(-4px);
}

.hover-scale:hover {
  transform: scale(1.02);
}

.hover-glow:hover {
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
}
```

## Implementation Guidelines

### Portal Rendering for Modals
Always use React Portal for modals to escape parent container constraints:
```javascript
import { createPortal } from 'react-dom';

const modalContent = (/* modal JSX */);
return createPortal(modalContent, document.body);
```

### Background Container Pattern
```javascript
<div 
  className="min-h-screen bg-cover bg-center bg-fixed relative dashboard-container"
  style={{
    backgroundImage: `url('https://images.unsplash.com/photo-1533929736458-ca588d08c8be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80&sat=-100')`,
    fontFamily: 'Times New Roman, serif'
  }}
>
  <div className="relative z-10">
    {/* Content here */}
  </div>
</div>
```

### Form Validation Styling
```css
.input-error {
  border-color: rgba(239, 68, 68, 0.5);
  background: rgba(239, 68, 68, 0.1);
}

.error-message {
  color: rgb(252, 165, 165);
  font-size: sm;
  margin-top: 0.25rem;
}
```

## Content Guidelines

### Voice & Tone
- **Professional yet approachable**
- **Strategic focus** - use terms like "strategic advisory", "insights", "recommendations"
- **UK public sector context** - reference local government, councils, authorities
- **Confident expertise** - "comprehensive analysis", "expert guidance"

### Terminology
- Use "Strategic Advisory" instead of "Audit"
- "Applications" instead of "Tools"
- "Insights" instead of "Results"
- "Portal" instead of "Platform"
- "Analysis" instead of "Scanning"

### Contact Information Template
```
Blackwood Analytics
25 Matthews Court
Ascot, Berkshire SL5 7RE
United Kingdom

Phone: 01344 622896
Email: info@blackwoodanalytics.com
```

---

*This specification ensures consistency across all pages and components in the Blackwood Analytics Strategic Advisory Portal.*