// These existing suites isolate publishing/classroom/inbox behavior from the
// new learner login gate. students.test.js and accounts-browser.mjs exercise
// the real default (mandatory login). Runtime entry points never disable it.
import { createApp as createRealApp } from "../../server/app.js";
export const createApp = (store, options = {}) =>
  createRealApp(store, { ...options, requireStudentLogin: false });
