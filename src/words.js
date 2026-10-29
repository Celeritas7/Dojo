// Vocabulary for the pelvic-floor program. Discreet mode (Settings) swaps in neutral words for logging in public.
const NORMAL = { program: "Pelvic floor", programTitle: "Pelvic floor and control", sets: "Kegel sets", setsQuestion: "Kegel sets today", practice: "Control practice", test: "Test session", programTab: "Pelvic floor" };
const DISCREET = { program: "Daily routine", programTitle: "Daily routine", sets: "Daily sets", setsQuestion: "Daily sets today", practice: "Practice", test: "Check session", programTab: "Routine" };
export const words = state => (state.settings && state.settings.discreet ? DISCREET : NORMAL);
