export const offline = import.meta.env.MODE === "android";
let scope = "guest";
export const setUserScope = (id) => {
  scope = id || "guest";
};
export const storageKey = (key) => `${key}:${scope}`;
