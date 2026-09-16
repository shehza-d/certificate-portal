# Certificate portal

The portal is plain HTML, CSS, and JavaScript. Open `index.html` to search for a certificate.

Edit the shared teacher message in `teacher-note.js`. Its `paragraphs`, `reminder`, and signature control both the on-screen card and the downloadable PNG. To personalize a single certificate later, add an entry to `overrides` keyed by that certificate's `file` value from `data.js`; you can replace only the fields that differ.

The card uses each certificate's `name` and `batch` from `data.js` and the visitor's current date. It opens in a scrollable popup after a student chooses “View certificate” or “Download certificate.” The download still saves only the original PDF. “Keep this message” separately creates an 1800-pixel-wide PNG on demand; its height grows to include the full message.
