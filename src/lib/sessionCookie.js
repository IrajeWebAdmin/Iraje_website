// Name of the login cookie. Kept in its own tiny file because src/proxy.js
// needs it too, and the proxy must not import the database code in session.js.
//
// It MUST be "__session": iraje.com is served through Firebase Hosting, which
// strips every cookie except "__session" before forwarding a request to Cloud
// Run. Any other name reaches the browser but never comes back to the server,
// so every click after login lands on the login page again.
export const SESSION_COOKIE = "__session";