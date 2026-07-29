
**Goal**
Add theme presets that let users change Kadha’s brand/accent palette while keeping light/dark mode independent. Build it using Chakra v3’s token system so a future custom theme engine can reuse the same structure.

**User Experience**
Users can open the existing utility menu and choose a theme preset. The app updates immediately and remembers the choice after refresh.

Initial presets:
- Kadha Orange, default
- Ocean Blue
- Forest Green
- Rose
- Violet or Teal, if contrast checks pass

Light/dark mode remains a separate menu action.

**Non-Goals**
This first version will not include:
- arbitrary user-created themes
- server-synced theme preferences
- import/export
- a full color editor
- typography, spacing, radius, or layout customization

**Technical Approach**
Replace the current `defaultSystem` usage with a project-owned Chakra system.

New likely files:

```text
client/src/theme/system.ts
client/src/features/theme/theme-presets.ts
client/src/features/theme/theme.types.ts
client/src/features/theme/theme-provider.tsx
client/src/features/theme/use-theme-preset.ts
```

`system.ts` should use Chakra’s v3 pattern:

```ts
createSystem(defaultConfig, defineConfig({ theme: { tokens, semanticTokens } }))
```

Define a stable `brand` color palette with Chakra’s required semantic palette tokens:

```text
brand.solid
brand.contrast
brand.fg
brand.muted
brand.subtle
brand.emphasized
brand.focusRing
```

This matters because Chakra’s docs say those semantic tokens are required if a custom color is intended to work with `colorPalette`.

**Preset Strategy**
For option 2, do not rebuild the Chakra system dynamically per preset. Instead, define CSS variables or preset classes that set the underlying `brand` values.

That gives us:
- static Chakra system
- runtime preset switching
- no full re-render/provider rebuild
- clean future path for user-defined custom variables

The selected preset can be stored in localStorage, separate from `next-themes` color mode storage.

**Component Migration**
Replace brand-orange usages with:

```tsx
<Button colorPalette="brand" />
<Badge colorPalette="brand" />
<Box bg="brand.subtle" color="brand.fg" />
<Icon color="brand.fg" />
```

Keep semantic status colors unchanged:
- red for destructive/error
- green for success/watched/available
- blue for informational states
- yellow for rating/warning

**Acceptance Criteria**
- Theme preset selector exists in the utility menu.
- Preset choice persists across reloads.
- Light/dark mode still works independently.
- Default Kadha Orange looks close to the current app.
- Brand accents update across navbar, landing page, CTAs, notifications, collection actions, media detail CTAs, and brand spinners.
- Status colors are not accidentally converted to brand.
- Client lint/build pass.

**Future Engine Compatibility**
The preset schema should resemble a future custom theme schema:

```ts
interface ThemePreset {
  id: string;
  label: string;
  cssVariables: {
    solid: string;
    contrast: string;
    fg: string;
    muted: string;
    subtle: string;
    emphasized: string;
    focusRing: string;
  };
}
```

Later, a custom theme engine can add validation, color picking, contrast checks, and server persistence without changing feature components, because components will already reference `brand` instead of concrete colors like `orange`.
