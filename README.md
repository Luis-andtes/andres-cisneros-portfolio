# Luis Andrés Cisneros — Personal Portfolio

Personal portfolio focused on economics, investment research and a disciplined path into global finance.

## Live site

The site is deployed automatically through GitHub Pages:

https://luis-andtes.github.io/andres-cisneros-portfolio/

## About

Built as a lightweight, responsive bilingual static website with semantic HTML, CSS and JavaScript. Live or delayed market quotes are displayed through the TradingView ticker-tape widget.

The separate `blog.html` writing archive renders the six newest publications from `data/x-posts.json` as native editorial cards—never as embedded frames. The main portfolio only contains a visual gateway to that page. A weekly GitHub Actions workflow retrieves new posts from the official X API and commits the refreshed archive. The API credential must be stored as the repository secret `X_BEARER_TOKEN`; no private key is committed to the site.

## X API setup

1. Create an app in the X Developer Console and generate its Bearer Token.
2. In this repository, open **Settings → Secrets and variables → Actions → New repository secret**.
3. Save the token with the exact name `X_BEARER_TOKEN`.
4. Open **Actions → Sync X publications → Run workflow** for the first synchronization. Future synchronizations run every Monday.

## Disclaimer

This is a personal portfolio for educational and professional purposes. Nothing on the site is financial advice or an offer of investment services.
