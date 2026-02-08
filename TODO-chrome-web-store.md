# TODO - Publication Chrome Web Store

## Compte développeur
- [ ] Créer un compte sur le Chrome Web Store Developer Dashboard
- [ ] Payer les frais d'inscription (5 USD, une seule fois)
- [ ] Compléter la vérification d'identité

## Visuels
- [ ] Screenshots de l'extension (1280x800 ou 640x400, min. 1, max. 5)
  - [ ] Overlay de détection sur un site de recettes
  - [ ] Vue d'une recette sauvegardée
  - [ ] Liste des recettes (HomeView)
  - [ ] Page des paramètres
- [ ] Small promo tile (440x280) — vignette dans les résultats de recherche

## Mini-site (NAS + nom de domaine)
- [ ] Page d'accueil de présentation de l'extension
- [ ] Page "Privacy Policy" (politique de confidentialité)
  - Aucune donnée personnelle collectée
  - Recettes stockées localement
  - Communication HTTPS avec le backend (scraping uniquement)
  - Pas d'analytics, cookies, ou partage tiers
  - Backend configurable par l'utilisateur
- [ ] Lien vers la page Chrome Web Store

## Backend Cloud Run
- [ ] Vérifier que l'instance Cloud Run est stable et accessible
- [ ] Tester `/api/health` sur l'URL de production
- [ ] Vérifier les quotas / limites Cloud Run (requêtes, cold starts)
- [ ] S'assurer que le CORS autorise les requêtes depuis l'extension

## Tests avant soumission
- [ ] Tester l'extension sur 5-10 sites de recettes variés
- [ ] Vérifier le bon fonctionnement sur une installation fraîche (pas de données)
- [ ] Tester l'export / import de recettes
- [ ] Tester les paramètres (thème, langue, backend custom)
- [ ] Vérifier que l'extension fonctionne après un `npm run build` propre

## Description Chrome Web Store
- [ ] Rédiger la description courte (~130 caractères)
- [ ] Rédiger la description détaillée (~500-1000 caractères)
- [ ] Choisir la catégorie (Productivité ou Mode de vie)
- [ ] Préparer la justification pour la permission `<all_urls>` :
  > "Reciper supports 606+ recipe websites. The extension detects recipe structured data (JSON-LD, microdata) on these sites. A static list of 606+ match patterns would be impractical and require constant updates."

## Packaging et soumission
- [ ] `npm run build` dans `extension/`
- [ ] Vérifier le contenu de `dist/` (manifest, icons, service-worker, assets)
- [ ] Zipper le dossier `dist/`
- [ ] Charger le .zip via "Load unpacked" dans Chrome pour validation finale
- [ ] Uploader le .zip sur le Developer Dashboard
- [ ] Remplir le formulaire (description, screenshots, privacy policy URL, catégorie)
- [ ] Soumettre pour review (délai : 1-3 jours ouvrés)
