# Agent Guidelines for Dinam

## Project Overview

A React 19 + TypeScript + Vite dashboard application with Tailwind CSS v4, shadcn/ui components, and oklch color system.

## Build Commands

```bash
# Development
npm run dev              # Start dev server with HMR

# Production
npm run build             # Type-check + build for production
npm run preview           # Preview production build locally

# Quality Checks
npm run lint             # Run ESLint on all .ts/.tsx files
npm run format            # Format all .ts/.tsx with Prettier (auto-fix)
npm run typecheck         # Run TypeScript type-check (no emit)
```

**Single File Operations:**

```bash
# Lint a specific file
npx eslint src/components/dashboard/Example.tsx

# Type-check a specific file
npx tsc --noEmit src/components/dashboard/Example.tsx

# Format a specific file
npx prettier --write src/components/dashboard/Example.tsx
```

## Code Style

### TypeScript Configuration

- **Strict mode** enabled (`strict: true` in tsconfig.app.json)
- **No unused locals/params** (`noUnusedLocals`, `noUnusedParameters`)
- **Erasable syntax only** (`erasableSyntaxOnly: true`)
- **Target**: ES2022

### Imports

```typescript
// Absolute paths via @ alias (preferred)
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// React imports (default to namespace import)
import * as React from "react"
import { useState, useCallback } from "react"

// Type-only imports (use `type` keyword)
import { type ClassValue } from "clsx"
import { type AccentId } from "@/lib/theme-accent-presets"
```

### Naming Conventions

| Element          | Convention               | Example                                          |
| ---------------- | ------------------------ | ------------------------------------------------ |
| Components       | PascalCase               | `DashboardHeader`, `QuickLaunchPanel`            |
| Functions        | camelCase                | `normalizeHref`, `getSystemTheme`                |
| Variables        | camelCase                | `searchQuery`, `resolvedTheme`                   |
| Types/Interfaces | PascalCase               | `ThemeProviderProps`, `AccentId`                 |
| CSS classes      | kebab-case               | `bg-card`, `text-foreground`                     |
| File names       | kebab-case               | `dashboard-header.tsx`, `quick-launch-panel.tsx` |
| Constants        | PascalCase (if exported) | `ACCENT_OPTIONS`, `COLOR_SCHEME_QUERY`           |
| Enum values      | camelCase                | `"dark"`, `"light"`, `"system"`                  |

### Component Patterns

```typescript
// Use function declarations for React components
export function DashboardHeader() {
  const { theme } = useTheme()
  // ...
}

// Use const for internal/helper components
const Button = ({ children, ...props }) => {
  // ...
}

// Props should use destructuring with defaults
function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  // ...
}
```

### State Management

```typescript
// useState with lazy initializer for expensive computation
const [items, setItems] = useState<QuickLaunchItem[]>(() =>
  MOCK_QUICK_LAUNCH.map((item) => ({ ...item }))
)

// useCallback for handlers passed to children
const handleSubmit = useCallback(
  (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // ...
  },
  [dependency]
)

// useMemo for expensive computations
const filteredItems = useMemo(
  () => items.filter((item) => item.active),
  [items]
)

// useRef for mutable values that don't trigger re-renders
const speechRecognitionRef = useRef<SpeechRecognition | null>(null)
```

### CSS Class Organization (Tailwind)

```typescript
// Utility function for combining classes
import { cn } from "@/lib/utils"

// Variants via class-variance-authority
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-4xl",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        destructive: "bg-destructive/10 text-destructive",
      },
    },
  }
)
```

### Error Handling

```typescript
// Type guards for runtime validation
function isTheme(value: string | null): value is Theme {
  if (value === null) return false
  return THEME_VALUES.includes(value as Theme)
}

// Try/catch with specific error types
try {
  const u = new URL(href)
  return u.hostname
} catch {
  return "Link"
}

// Context validation in hooks
export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
```

### JSX Patterns

```tsx
// Conditional rendering
{dashboardWallpaper ? (
    <div className="bg-cover" />
) : null}

// Boolean attributes (shorthand)
<Input disabled={isLoading} />

// Event handlers (inline only for simple cases)
<Button onClick={() => setOpen(true)}>

// Complex handlers (use useCallback)
<Button onClick={handleSubmit}>

// Accessibility
<button aria-label="Close dialog" aria-expanded={isOpen}>
<input aria-invalid={hasError} />
```

### File Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI primitives (Button, Input, Dialog)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── dashboard/        # Dashboard-specific components
│   │   ├── DashboardHeader.tsx
│   │   ├── QuickLaunchPanel.tsx
│   │   └── ...
│   └── theme-provider.tsx
├── lib/
│   ├── utils.ts         # cn() utility
│   ├── search-engine.ts
│   └── theme-accent-presets.ts
├── data/
│   └── dashboard-mock.ts
├── App.tsx
├── main.tsx
└── index.css
```

## Prettier Configuration

```json
{
  "endOfLine": "lf",
  "semi": false,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

## Linting Rules

ESLint extends:

- `@eslint/js` (recommended)
- `typescript-eslint` (recommended)
- `react-hooks` (recommended)
- `react-refresh` (for Vite)

Key rules enforced:

- No unused variables (locals or parameters)
- React hooks rules (exhaustive-deps, rules-of-hooks)
- React refresh compatibility (no default exports for components)

## Workflow

1. **Before committing**: Run `npm run lint && npm run typecheck`
2. **Before submitting PR**: Run `npm run build` to verify production build
3. **Auto-fix formatting**: Run `npm run format` before committing
