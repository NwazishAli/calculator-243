Calculator
---
<img src="Logotype primary.png" width="60%" height="60%" />

Created with *create-react-app*. See the [full create-react-app guide](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md).



Try It
---

[nwazishali.github.io/calculator-243](https://nwazishali.github.io/calculator-243/)



Install
---

`npm install`



Usage
---

`npm start`



Scientific mode
---

Press **SCI** at the left of the read-out to slide a scientific keypad in above
the standard keys (it becomes **BASIC**, so the same button switches back). The
mode is interface state, so `AC` clears the calculation without closing the
keypad.

| | | | | |
|---|---|---|---|---|
| DEG/RAD | sin | cos | tan | π |
| x² | x³ | xʸ | √x | ∛x |
| ln | log | eˣ | 10ˣ | e |
| 1/x | x! | \|x\| | mod | ⌫ |

* **DEG/RAD** sets the unit for sin, cos and tan, and shows the current one.
* Unary functions (`sin`, `√x`, `x!`, …) apply to the number on the display and
  can be chained — `9 √x x²` returns 9.
* `xʸ` and `mod` take two operands and behave like `+`, `-`, `x` and `÷`, so a
  pending operation survives a unary function: `5 + 3 x² =` gives 14.
* Out-of-domain input (`√x` of a negative, `ln` of 0, `tan` of 90°, `1/x` of 0,
  divide by zero) shows `Error` instead of `NaN`, and the keypad stays inert
  until a digit, `.` or a constant starts a fresh value.
* Results too long to read — 170! is a 272-character integer — fall back to
  twelve significant digits, while `0.1 x²` stays exactly `0.01` because
  big.js does the arithmetic.

`tan` of an odd multiple of 90° is rejected on purpose: `Math.tan(Math.PI / 2)`
returns `1.633e16` rather than failing.



Hosting on GitHub Pages
---

Deployment is automated by the GitHub Actions workflow in
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). Every push to
`master` installs dependencies, runs the tests, builds the app and publishes the
`build/` folder to GitHub Pages. It can also be triggered by hand from the
Actions tab with **Run workflow**.

One-time setup for a fork or a renamed repository:

1. Set the `homepage` field in `package.json` to your own Pages URL, e.g.
   `https://<username>.github.io/<repo>/`. Without it the HTML is built for the
   wrong base path and the CSS/JS assets 404 on a project page.
2. In the repository, go to **Settings → Pages** and set *Build and deployment*
   → *Source* to **GitHub Actions**.

Three details the workflow has to handle for this (2019-vintage) toolchain:

* The published folder is `build/`, so `actions/upload-pages-artifact` needs
  `path: ./build`. A Jekyll build does not work here — it cannot compile JSX or
  bundle the app.
* `react-scripts` 3 uses webpack 4, which hashes with MD4. MD4 was removed from
  OpenSSL 3 (Node 17+), so the build step sets
  `NODE_OPTIONS=--openssl-legacy-provider` to avoid `ERR_OSSL_EVP_UNSUPPORTED`.
* `npm ci` needs `--legacy-peer-deps`. The committed `package-lock.json`
  predates npm 7, which began installing peer dependencies automatically
  (`@typescript-eslint/parser` declares `typescript: *`), so a plain `npm ci`
  aborts with "package.json and package-lock.json are not in sync".

To publish manually instead of using Actions, `npm run deploy` still works
(it pushes the `build/` folder to a `gh-pages` branch with the `gh-pages`
package).
