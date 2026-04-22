# PLAN_LANG.md — Internationalisation Reciper

Plan d'exécution séquentiel pour rendre Reciper multilingue (EN, FR, ES, PT) et publiable sur le Chrome Web Store mondial.

**Langues cibles** : `en`, `fr`, `es`, `pt` (fallback : `en`)
**Note PT** : une seule locale `pt` couvre Portugal et Brésil. Chrome mappe automatiquement `pt`, `pt-BR` et `pt-PT` vers `pt/`. Textes rédigés en portugais neutre (éviter régionalismes marqués).

**Mode d'emploi** : dans une nouvelle conversation, écrire « Implémenter la prochaine étape, puis commit ». L'assistant ouvre ce fichier, coche la première case non cochée une fois terminée, et commit.

---

## Étape 1 — Ajouter les locales Vue (es.js + pt.js)

- [x] **Statut**

**Fichiers** :
- Créer [extension/src/i18n/locales/es.js](extension/src/i18n/locales/es.js)
- Créer [extension/src/i18n/locales/pt.js](extension/src/i18n/locales/pt.js)

**Instructions** :
Copier la structure exacte de [fr.js](extension/src/i18n/locales/fr.js) / [en.js](extension/src/i18n/locales/en.js). Même hiérarchie de clés, **mêmes placeholders** (`{n}`, `{count}`, `{message}`, `{host}`, `{imported}`, `{skipped}`, `{version}`, `{error}`), traduire les `message` en espagnol neutre (LatAm) et portugais neutre.

**Enregistrer** dans [extension/src/i18n/index.js](extension/src/i18n/index.js) :
```js
import es from './locales/es.js'
import pt from './locales/pt.js'
// messages: { fr, en, es, pt }
// fallbackLocale: 'en'   (remplace 'fr')
```

**Commit** : `feat(i18n): add Spanish and Portuguese Vue locales`

---

## Étape 2 — Étendre i18n-lite (service worker + popup)

- [x] **Statut**

**Fichier** : [extension/i18n-lite.js](extension/i18n-lite.js)

**Instructions** :
- Ajouter les objets `es` et `pt` dans `messages` (traduire les ~9 clés existantes).
- Changer le fallback final : `messages.en[key]` au lieu de `messages.fr[key]`.

**Commit** : `feat(i18n): extend i18n-lite with Spanish and Portuguese`

---

## Étape 3 — Détection automatique de la langue du navigateur

- [x] **Statut**

**Fichiers** :
- Créer [extension/src/i18n/detect.js](extension/src/i18n/detect.js) :
```js
const SUPPORTED = ['en', 'fr', 'es', 'pt']
export function detectBrowserLocale() {
  const raw = (typeof chrome !== 'undefined' && chrome.i18n?.getUILanguage?.())
    || navigator.language || 'en'
  const base = raw.toLowerCase().split('-')[0]
  return SUPPORTED.includes(base) ? base : 'en'
}
```
- Modifier [extension/src/stores/settings.js:13-17](extension/src/stores/settings.js#L13) :
  - `language: null` dans `defaultSettings` (null = auto)
  - Ajouter `getEffectiveLanguage()` qui renvoie `settings.language || detectBrowserLocale()`
- Modifier [extension/src/main.js:20-24](extension/src/main.js#L20) pour appeler `getEffectiveLanguage()` au boot.
- Modifier `initLocale()` dans [extension/i18n-lite.js](extension/i18n-lite.js) : si pas de langue stockée, utiliser `chrome.i18n.getUILanguage()`, fallback `en`.

**Commit** : `feat(i18n): auto-detect browser language on first launch`

---

## Étape 4 — Ajouter es/pt + option "Auto" dans les paramètres

- [x] **Statut**

**Fichier** : [extension/src/components/SettingsModal.vue](extension/src/components/SettingsModal.vue)

**Instructions** :
- Étendre `languageOptions` (ligne ~199) avec :
  - `{ value: null,  label: 'Auto' }` (première option, suit le navigateur)
  - `{ value: 'es',  label: 'Español' }`
  - `{ value: 'pt',  label: 'Português' }`
- Garder les labels des langues dans leur propre langue (`Français`, `English`, `Español`, `Português`).
- Adapter la logique de sauvegarde pour accepter `null` (langue auto).

**Commit** : `feat(settings): expose Spanish/Portuguese and auto language options`

---

## Étape 5 — Créer `_locales/` et migrer le manifest

- [ ] **Statut**

**Fichiers** :
- Créer l'arborescence :
  ```
  extension/_locales/en/messages.json
  extension/_locales/fr/messages.json
  extension/_locales/es/messages.json
  extension/_locales/pt/messages.json
  ```
- Chaque `messages.json` contient au minimum :
  ```json
  {
    "extensionName":        { "message": "Reciper" },
    "extensionDescription": { "message": "..." },
    "actionTitle":          { "message": "..." }
  }
  ```
- Modifier [extension/manifest.json](extension/manifest.json) :
  - Ajouter `"default_locale": "en"`
  - `"name": "__MSG_extensionName__"`
  - `"description": "__MSG_extensionDescription__"`
  - `"action.default_title": "__MSG_actionTitle__"`

**Vérifier** [extension/vite.config.js](extension/vite.config.js) : `_locales/` doit être copié dans `dist/` (via `publicDir` ou `viteStaticCopy`). Ajouter la copie si absente.

**Commit** : `feat(manifest): localize store listing via _locales`

---

## Étape 6 — Audit des chaînes résiduelles

- [ ] **Statut**

**Commande d'audit** (à exécuter depuis `extension/`) :
```bash
grep -rnE "[éèêàçîôù]|[A-Z][a-zéèêà]+ [a-zéèêà]+" \
  src popup.html popup.js service-worker.js overlay-content-script.js \
  --include="*.js" --include="*.vue" --include="*.html" 2>/dev/null
```

**Instructions** :
- Lister chaque chaîne UI hardcodée hors des catalogues de traduction.
- Migrer vers `i18n/locales/*.js` (contexte Vue) ou `i18n-lite.js` (service worker / popup).
- Vérifier en particulier `popup.html` / `popup.js` s'ils contiennent du texte visible.

**Commit** : `chore(i18n): migrate remaining hardcoded strings to catalogs`

---

## Étape 7 — Backend : détection PT

- [ ] **Statut**

**Fichier** : [backend/app/language_detection.py](backend/app/language_detection.py)

**Instructions** :
- Ajouter dans les fallbacks TLD : `.pt` → `pt`, `.br` → `pt` (une seule locale couvre Portugal et Brésil).
- Optionnel : ajouter 1–2 domaines PT/BR connus dans `DOMAIN_LANGUAGE_MAP` si pertinents.

**Commit** : `feat(back): detect Portuguese from .pt and .br domains`

---

## Étape 8 — QA et build final

- [ ] **Statut**

**Checklist de QA** (pour chaque langue `en`, `fr`, `es`, `pt`) :
- [ ] Changer `chrome://settings/languages` → relancer l'extension
- [ ] Tooltip de l'icône dans la bonne langue
- [ ] Popup, Home, Recipe, Loading, Settings, modales
- [ ] Messages de succès / erreurs
- [ ] Overlay de notification sur un site supporté
- [ ] Console log `extensionLoaded`
- [ ] Fiche `chrome://extensions/` (name + description)
- [ ] Fallback → anglais pour une langue hors scope (ex. `de`, `ja`)

**Script de parité des clés** (Node) : vérifier que `en.js`, `fr.js`, `es.js`, `pt.js` ont les **mêmes clés et mêmes placeholders**. Idem pour les 4 `_locales/<lang>/messages.json`.

**Build final** :
```bash
cd extension
npm run build
ls dist/_locales/   # doit lister en, fr, es, pt
```

**Commit** : `chore(i18n): validate multilingual build`

---

## Notes

- **Ordre strict** : chaque étape dépend des précédentes (Étapes 1-2 ajoutent les catalogues, 3-4 les exposent, 5 localise le store, 6 nettoie, 7 complète le backend, 8 valide).
- **Portugais** : une seule locale `pt` pour Portugal + Brésil. Textes en portugais neutre, relire si une large audience BR est visée plus tard.
- **Espagnol** : espagnol neutre (éviter `vosotros` et régionalismes d'Espagne).
- **Traductions** : les traductions automatiques suffisent pour démarrer, prévoir une relecture native avant la publication officielle sur le Web Store.
