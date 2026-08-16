/** Semantic color tokens shared by compose_core's controlled inputs. */
export interface ComposeControlTheme {
  surface: string;
  surfaceRaised: string;
  surfaceMuted: string;
  surfaceSelected: string;
  surfaceDisabled: string;
  border: string;
  borderStrong: string;
  borderDisabled: string;
  accent: string;
  accentMuted: string;
  onAccent: string;
  text: string;
  textMuted: string;
  textDisabled: string;
  thumb: string;
  danger: string;
  dangerMuted: string;
  onDanger: string;
  shadow: string;
}

/** Neutral defaults suitable for the playground and unbranded consumers. */
export const defaultComposeControlTheme: Readonly<ComposeControlTheme> = {
  surface: "#ffffff",
  surfaceRaised: "#ffffff",
  surfaceMuted: "#e2e8f0",
  surfaceSelected: "#dbeafe",
  surfaceDisabled: "#f1f5f9",
  border: "#cbd5e1",
  borderStrong: "#64748b",
  borderDisabled: "#e2e8f0",
  accent: "#2563eb",
  accentMuted: "#bfdbfe",
  onAccent: "#ffffff",
  text: "#0f172a",
  textMuted: "#475569",
  textDisabled: "#94a3b8",
  thumb: "#ffffff",
  danger: "#b42318",
  dangerMuted: "#fee4e2",
  onDanger: "#7a271a",
  shadow: "rgba(15, 23, 42, 0.24)",
};

/** Applies only defined override values, preserving every fallback token. */
export function mergeDefinedOverrides<T extends object>(base: T, overrides?: Partial<T>): T {
  const resolved = { ...base };
  if (!overrides) {
    return resolved;
  }
  (Object.keys(overrides) as Array<keyof T>).forEach(key => {
    const value = overrides[key];
    if (value !== undefined) {
      resolved[key] = value as T[typeof key];
    }
  });
  return resolved;
}

/** Resolves a complete theme without mutating the caller's overrides. */
export function resolveComposeControlTheme(
  overrides?: Partial<ComposeControlTheme>,
): ComposeControlTheme {
  return mergeDefinedOverrides(defaultComposeControlTheme, overrides);
}
