/**
 * Feature flags — control which modules are visible in the sidebar and routed.
 *
 * Defaults to true (all enabled). Set the corresponding VITE_ env var to 'false'
 * to disable a module at build time.
 *
 * Example (.env or GitHub Secret):
 *   VITE_FEATURE_EBOOK_READER=false   → hides the ebook-reader module
 */
export interface FeatureFlags {
  todoList:     boolean
  habitTracker: boolean
  ebookReader:  boolean
  resignStamp:  boolean
}

function flag(envKey: string): boolean {
  const val = import.meta.env[envKey]
  // undefined (not set) → enabled; explicit 'false' → disabled
  return val !== 'false'
}

export const features: FeatureFlags = {
  todoList:     flag('VITE_FEATURE_TODO_LIST'),
  habitTracker: flag('VITE_FEATURE_HABIT_TRACKER'),
  ebookReader:  flag('VITE_FEATURE_EBOOK_READER'),
  resignStamp:  flag('VITE_FEATURE_RESIGN_STAMP'),
}
