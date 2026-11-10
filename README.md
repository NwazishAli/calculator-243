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
