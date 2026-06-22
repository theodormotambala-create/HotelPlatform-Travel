# HotelPlatform Travel — Application PWA

Application hoteliere sociale prete pour le deploiement (Progressive Web App installable, plein ecran, mode hors-ligne, bouton retour systeme).

## Contenu du projet

```
index.html              Point d'entree (meta-tags mobiles, splash de demarrage)
vite.config.js          Configuration Vite + generation automatique du service worker (PWA)
package.json            Dependances et scripts
public/
  logo.svg              Logo vectoriel
  icons/                Icones de l'app (192, 512, maskable) pour l'installation
src/
  main.jsx              Demarreur : monte l'application
  App.jsx               L'application complete (tous les ecrans et la logique)
  index.css             Styles globaux (plein ecran, fond sombre, splash)
```

## Lancer en local (pour tester sur ton telephone)

Il faut Node.js installe (https://nodejs.org). Ensuite, dans un terminal :

```bash
npm install        # installe React, lucide-react, Vite, le plugin PWA
npm run dev        # lance le serveur de developpement
```

Ouvre l'adresse affichee (ex. http://localhost:5173) dans le navigateur de ton telephone
(le telephone doit etre sur le meme reseau Wi-Fi que l'ordinateur).
**C'est dans ce contexte plein ecran que le bouton retour du telephone fonctionnera**,
contrairement a l'apercu integre.

## Construire la version de production

```bash
npm run build      # genere le dossier dist/ optimise
npm run preview    # previsualise la version de production en local
```

Le dossier `dist/` est ce que tu mets en ligne.

## Mettre en ligne (hebergement)

Le dossier `dist/` est un site statique. Options gratuites et professionnelles :

- **Vercel** : `npm i -g vercel` puis `vercel` (detecte Vite automatiquement)
- **Netlify** : glisser-deposer le dossier `dist/` sur app.netlify.com
- **GitHub Pages**, **Cloudflare Pages**, ou tout hebergeur de fichiers statiques

Une fois en ligne (HTTPS obligatoire pour une PWA), les utilisateurs pourront
**installer l'app sur leur ecran d'accueil** ("Ajouter a l'ecran d'accueil"),
elle s'ouvrira en plein ecran avec son icone, et fonctionnera hors-ligne.

## Ce qui est pret / ce qui reste a brancher

L'interface et toute la logique cote application sont **completes et fonctionnelles**.
Ce qui reste, comme prevu, ce sont les connexions vers des services externes (backend) :

| Fonction              | Etat actuel                            | A brancher (backend)                              |
|-----------------------|----------------------------------------|---------------------------------------------------|
| Comptes / connexion   | Simules localement                     | API d'authentification (ex. Firebase Auth, Supabase) |
| Reservations          | Enregistrees dans l'app (session)      | Base de donnees + API reservations                |
| Messagerie            | Locale a l'app                         | API temps reel (websockets / Firebase)            |
| Paiement Premium      | Parcours complet, sans debit reel      | Passerelle de paiement (Stripe, etc.)             |
| Partage               | Liens + partage natif fonctionnels     | Pages publiques des posts servies par le backend  |
| Localisation / GPS    | Champs ville en texte                  | API de geolocalisation (navigator.geolocation + cartes) |
| Verification badge    | Parcours complet (revue simulee)       | Back-office admin de validation des documents     |

Ces branchements se font dans `src/App.jsx` aux endroits ou les donnees sont
actuellement simulees : il suffira de remplacer les donnees locales par des appels
`fetch` vers tes API.

## Notes techniques

- Le bouton retour du telephone est gere via l'API History (standard PWA).
  Il ferme l'ecran courant au lieu de quitter l'app — **effectif une fois deploye**,
  pas dans un apercu integre.
- Le service worker (cache hors-ligne) est genere automatiquement par `vite-plugin-pwa`
  lors du `npm run build`.
- Couleur de theme : `#FF6B00` (orange du logo). Fond : `#09090F`.
