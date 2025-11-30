# 🏝️ Corse DataViz — Dashboard Interactif

> **Exploration territoriale de la Corse** : Sport, Énergie & Risques Incendies

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)

---

## 📋 Description

Ce dashboard interactif propose une **analyse visuelle multi-thématique** du territoire corse, articulée autour de trois axes :

### 🏅 Onglet Sport
- **Carte interactive** des équipements sportifs par commune
- **Nuage de points** : corrélation entre population jeune (15-29 ans) et nombre d'équipements
- **Histogramme des inégalités** : répartition des communes par niveau d'équipement (mise en évidence des "déserts sportifs")
- **Filtre** : seuil minimum d'équipements

### ⚡ Onglet Énergie
- **Carte interactive** de la consommation énergétique par commune
- **Nuage de points** : corrélation entre population totale et consommation
- **Donut Chart** : répartition de la consommation par secteur (Résidentiel, Tertiaire, Industrie, Agriculture)
- **Filtre** : métrique affichée (consommation totale ou parts sectorielles)

### 🔥 Onglet Incendies
- **Carte interactive** des incendies (>1 ha) avec taille proportionnelle à la surface brûlée
- **Top 5** des communes les plus touchées
- **Historique annuel** avec barre de zoom (Brush) pour explorer une période
- **Radar de saisonnalité** : visualisation des mois à risque (pic en été)
- **Filtre** : année spécifique ou toutes les années (2000-2024)

---

## 🚀 Installation et lancement

### Prérequis
- [Node.js](https://nodejs.org/) (v18 ou supérieur recommandé)
- npm ou yarn

### Étapes

```bash
# 1. Cloner le dépôt
git clone https://github.com/Michelozzi2/dashboard-corse-dataviz.git
cd dashboard-corse-dataviz

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur de développement
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

### Build de production

```bash
npm run build
```

Les fichiers optimisés seront générés dans le dossier `dist/`.

### Déploiement GitHub Pages

```bash
npm run deploy
```

---

## 🛠️ Technologies utilisées

| Technologie | Usage |
|-------------|-------|
| **React 18** | Framework UI |
| **Vite** | Build tool & dev server |
| **Tailwind CSS** | Styling utilitaire |
| **Recharts** | Graphiques (ScatterChart, BarChart, PieChart, RadarChart) |
| **React-Leaflet** | Cartographie interactive |
| **Lucide React** | Icônes |

---

## 📊 Sources et traitement des données

Les données brutes ont été **collectées, nettoyées et transformées** en amont du projet pour générer les fichiers JSON utilisés par la dataviz (`data.json` et `fires.json`).

### Sources originales

| Thématique | Source |
|------------|--------|
| Consommation énergétique | [data.gouv.fr](https://www.data.gouv.fr/datasets/consommation-annuelle-delectricite-et-gaz-par-commune-et-par-secteur-dactivite/) |
| Équipements sportifs | [data.gouv.fr](https://www.data.gouv.fr/datasets/recensement-des-equipements-sportifs-espaces-et-sites-de-pratiques/) |
| Population | [INSEE](https://www.insee.fr/fr/statistiques/8202264?sommaire=8202287) |
| Incendies | [BDIFF](https://bdiff.agriculture.gouv.fr/incendies) |

### Traitements appliqués

#### 🔥 Incendies
- **Nettoyage** : normalisation des noms de communes (suppression accents, traits d'union, standardisation "Saint" → "ST")
- **Conversion** : surface en m² → hectares, filtrage des incendies >1 ha
- **Géolocalisation** : rattachement des coordonnées GPS via correspondance avec le référentiel des communes
- **Export** : génération de `fires.json` avec id, commune, année, date, surface et coordonnées

#### ⚡ Énergie
- **Filtrage** : départements corses (2A/2B), filière Électricité uniquement, année la plus récente
- **Agrégation** : somme des consommations par commune (plusieurs opérateurs possibles)
- **Calcul** : parts sectorielles en pourcentage (Résidentiel, Tertiaire, Industrie, Agriculture)
- **Fusion** : enrichissement du `data.json` principal

#### 👥 Population
- **Parsing** : lecture du fichier INSEE avec gestion des espaces insécables
- **Correspondance** : rattachement par code INSEE
- **Fusion** : ajout de `population_totale` dans `data.json`

#### 🏅 Équipements sportifs
- **Filtrage** : communes corses uniquement
- **Comptage** : agrégation du nombre d'équipements par commune
- **Fusion** : enrichissement du `data.json` avec `nb_equipements` et `population_15_29`

---

## 📁 Structure du projet

```
src/
├── App.jsx          # Composant principal (dashboard)
├── main.jsx         # Point d'entrée React
├── index.css        # Styles globaux + Tailwind
├── data.json        # Données communes (sport, énergie, population)
├── fires.json       # Données incendies
└── components/
    └── CustomSelect.jsx  # Composant select personnalisé
```

---

## 📝 Fonctionnalités clés

- ✅ **Navigation par onglets** avec thème coloré adaptatif
- ✅ **Cartes interactives** avec popups informatifs
- ✅ **KPIs dynamiques** recalculés selon les filtres
- ✅ **Graphiques multiples** par onglet pour une analyse approfondie
- ✅ **Zoom temporel** (Brush) sur l'historique des incendies
- ✅ **Design responsive** (mobile/desktop)
- ✅ **Thème sombre** professionnel

---

## 👥 Auteurs

Projet réalisé dans le cadre du **Master 2 — DataViz**

| Nom | GitHub |
|-----|--------|
| Michelozzi Matthieu | [@Michelozzi2](https://github.com/Michelozzi2) |
| Mirande Clémentine | |

---

## 📄 Licence

Ce projet est à but éducatif.
