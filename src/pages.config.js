/**
 * pages.config.js - DISABLED
 * 
 * All routes are now explicitly defined in App.jsx as lazy-loaded routes.
 * This prevents the bundler from traversing the entire page import graph at build time,
 * which was causing circular dependency issues with recharts in production.
 */

export const pagesConfig = {
    mainPage: null,
    Pages: {},
    Layout: null,
};