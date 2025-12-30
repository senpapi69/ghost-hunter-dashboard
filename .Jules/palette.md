# Palette's Journal

## 2024-05-22 - Missing Form Accessibility
**Learning:** The form components are missing `id` and `htmlFor` attributes, which breaks the relationship between labels and inputs for screen readers.
**Action:** When creating forms, always ensure labels have `htmlFor` matching the input's `id`.

## 2024-05-22 - Icon-Only Buttons
**Learning:** Several buttons in the header and other components are icon-only without `aria-label`.
**Action:** Add `aria-label` to all icon-only buttons to ensure they are accessible.
