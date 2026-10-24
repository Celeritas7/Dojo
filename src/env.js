// Runtime environment: today's date and the query-string switches used by screenshots and tests.
import { parseISO, startOfDay } from "./logic.js";
import { DEMO_TODAY, demoState } from "./demo.js";

const params = new URLSearchParams(location.search);
export const DEMO = params.get("demo") === "1";
const override = params.get("today") || (DEMO ? DEMO_TODAY : null);
export const TODAY = override ? parseISO(override) : startOfDay(new Date());
export const initialState = DEMO ? demoState : null;
export const DS = window.DojoDesignSystem_c9e716;
