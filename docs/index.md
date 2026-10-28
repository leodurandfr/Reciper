---
layout: default
title: Reciper – Privacy Policy
description: Privacy policy for the Reciper Chrome extension
---

# Reciper – Privacy Policy

_Last updated: 2026-10-28_

Reciper is a Chrome extension that automatically saves cooking recipes from
supported websites into a personal library stored on your device. This page
describes, in plain terms, what data the extension handles and what it does
**not** do.

## TL;DR

- Your recipes are stored **only on your device**, via `chrome.storage.local`.
- No account, no login, no advertising, no analytics, no tracking.
- Recipes are extracted **inside your browser**. Reciper has no server: the
  URLs you visit and the recipes you save are never sent to us or anyone else.
- The extension is open source.

## What the extension does

When you navigate to a page on one of the 700+ supported recipe websites, the
extension:

1. Recognises the website from the list of supported sites, downloads the page
   and checks that it declares a recipe (Schema.org structured data).
2. Extracts the recipe (ingredients, steps, cooking time, servings, title,
   image) locally, inside the extension, using the open source
   [recipe-scrapers](https://github.com/hhursev/recipe-scrapers) library.
3. Saves the extracted recipe locally on your device.
4. Opens the recipe inside the extension.

By default, the extension does **not** read the content of any page outside the
list of supported recipe websites, and it never transmits page content anywhere.

## Capturing recipes on any website (optional, off by default)

If you turn on "Capture recipes on any website" in the settings, the extension
also checks, on every website you visit, whether the page you opened declares a
recipe (Schema.org structured data). This check runs locally in the page; the
page content is not stored or sent anywhere. When a recipe is found, the page is
processed on your device and the recipe is saved, exactly as for supported
websites. Turning the setting off stops these checks.

## Data stored locally (on your device)

Stored via `chrome.storage.local`, never transmitted anywhere:

- Recipes you have saved (title, ingredients, steps, image, source URL).
- User preferences (language, theme, optional settings).

You can delete all data at any time by removing the extension from Chrome.

## Network requests made by the extension

To extract a recipe, the extension downloads the page you are visiting from
the recipe website itself, exactly as your browser already does when you open
it. The page is then processed on your device. The extension does not send
any data to a Reciper server: there is none.

## Sharing a recipe (optional)

If you explicitly click "Share" on a saved recipe, the extension builds a link
to a static page hosted on GitHub Pages (`leodurandfr.github.io`). The recipe
content (title, ingredients, ingredient illustration identifiers, steps,
preparation and cooking times, servings, image URL and source URL) is
compressed into the part of the link after the `#`, which browsers never send to a server:
the recipe is not uploaded or stored anywhere. Whoever opens the link loads
the page from GitHub, ingredient illustrations from GitHub
(`raw.githubusercontent.com`) and the recipe photo from its original website.
This only happens on explicit user action.

## Data we do NOT collect

- Personally identifiable information (name, email, age, etc.)
- Authentication credentials
- Financial or payment information
- Health information
- Location data (GPS, geolocation)
- Browsing history
- Keystrokes, mouse movements, clicks, or any user activity telemetry
- Content of websites outside the supported recipe list (unless you turn on the
  optional setting above, and then only recipe pages are saved, on your device)

## Third parties

Reciper does not operate any server and has no third-party services
receiving your data. The optional sharing page is a static page hosted by
GitHub; GitHub acts as hosting provider only and does not receive the recipe
content.

User data is **never sold, rented, or transferred** to third parties for
advertising, profiling, credit assessment, or any purpose unrelated to the
core functionality of extracting and displaying recipes.

## Changes to this policy

Material changes will be reflected in the "Last updated" date at the top of
this document and communicated through the extension's release notes.

## Contact

For any privacy-related question, contact: **services@leodurand.com**
