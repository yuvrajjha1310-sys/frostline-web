# Frostline — Cold Storage & Cold Chain Website

Plain HTML/CSS/JS, no build tools or dependencies required.

## Structure
```
frostline/
├── index.html      # all page content & sections
├── css/
│   └── style.css   # all styling, light + dark theme, animations
├── js/
│   └── script.js   # theme toggle, scroll reveal, mobile nav, live widget
└── README.md
```

## Running it
No install step needed. Either:
- Double-click `index.html` to open it directly in your browser, or
- In VS Code, install the **Live Server** extension, right-click `index.html`, and choose **Open with Live Server** (recommended — some effects behave better served over http:// than file://).

## Editing
- Colors, fonts, spacing, and animations all live in `css/style.css` under the `:root` and `html.dark` variable blocks at the top.
- Section copy (headings, stats, testimonials, etc.) is directly in `index.html`.
- Interactive behavior (dark mode toggle, scroll animations, live temperature widget) is in `js/script.js`.
