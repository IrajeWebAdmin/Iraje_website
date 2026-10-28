// Name of the login cookie. Kept in its own tiny file because src/proxy.js
// needs it too, and the proxy must not import the database code in session.js.
export const SESSION_COOKIE = "iraje_session";