---
layout: default
title: Reciper – Privacy Policy
description: Privacy policy for the Reciper Chrome extension
---

# Reciper – Privacy Policy

_Last updated: 2026-04-23_

Reciper is a Chrome extension that automatically saves cooking recipes from
supported websites into a personal library stored on your device. This page
describes, in plain terms, what data the extension handles and what it does
**not** do.

## TL;DR

- Your recipes are stored **only on your device**, via `chrome.storage.local`.
- No account, no login, no advertising, no analytics, no tracking.
- The URL of a recipe page is sent to our backend **only when you visit a
  supported cooking website** (e.g. Marmiton, 750g, AllRecipes).
- The backend extracts and returns the recipe content. It does **not log, store
  or share** the URLs or recipe content.
- The backend is open source and can be self-hosted.

## What the extension does

When you navigate to a page on one of the 600+ supported recipe websites, the
extension:

1. Detects that the page contains a recipe (via Schema.org structured data).
2. Sends the URL of that page to the Reciper backend so the recipe can be
   extracted (ingredients, steps, cooking time, servings, title, image).
3. Saves the extracted recipe locally on your device.
4. Opens the recipe inside the extension.

The extension does **not** read or transmit the content of any page outside the
list of supported recipe websites.

## Data stored locally (on your device)

Stored via `chrome.storage.local`, never transmitted anywhere:

- Recipes you have saved (title, ingredients, steps, image, source URL).
- User preferences (language, theme, custom backend URL).

You can delete all data at any time by removing the extension from Chrome.

## Data sent to the Reciper backend

When you visit a supported recipe website, the extension sends the following
to the backend hosted on Google Cloud Run (region: europe-west1):

- **The URL of the recipe page** you are viewing.

That is the only data sent. No personal identifier, no cookie, no IP address
is deliberately collected. Standard network metadata (your IP address) is
transiently visible to the server as with any HTTP request, but is **not
logged or stored** by the Reciper backend.

The backend uses the URL to fetch the public HTML of the recipe page and
returns the structured recipe data. Nothing is persisted server-side for this
operation.

## Sharing a recipe (optional)

If you explicitly click "Share" on a saved recipe, the recipe content (title,
ingredients, steps, image URL) is uploaded to Google Cloud Storage and a
short public link is generated so you can send the recipe to someone else.
This only happens on explicit user action. Links are not indexed or listed
anywhere public.

## Data we do NOT collect

- Personally identifiable information (name, email, age, etc.)
- Authentication credentials
- Financial or payment information
- Health information
- Location data (GPS, geolocation)
- Browsing history outside of supported recipe websites
- Keystrokes, mouse movements, clicks, or any user activity telemetry
- Content of websites outside the supported recipe list

## Third parties

The backend is hosted on **Google Cloud Run** (Google Cloud Platform). Google
acts as infrastructure provider only. No other third party receives data from
Reciper.

User data is **never sold, rented, or transferred** to third parties for
advertising, profiling, credit assessment, or any purpose unrelated to the
core functionality of extracting and displaying recipes.

## Self-hosting

The backend source code is open source. You can host your own instance and
configure the extension to use it via the Settings page. In that case, no
data ever reaches the Reciper-operated backend.

## Changes to this policy

Material changes will be reflected in the "Last updated" date at the top of
this document and communicated through the extension's release notes.

## Contact

For any privacy-related question, contact: **services@leodurand.com**
