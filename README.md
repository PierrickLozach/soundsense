# SoundSense 🔊

**Diagnostic d'appareils ménagers par analyse sonore IA**

Prototype Board Session — 29 juin 2026

## Concept

Une app qui utilise le micro de ton téléphone pour détecter les problèmes sur tes appareils électroménagers AVANT qu'ils ne tombent en panne. Économise des centaines d'euros en réparations d'urgence.

## Features

- **6 appareils supportés** : Réfrigérateur, Lave-linge, Sèche-linge, Lave-vaisselle, Climatisation, Chaudière
- **Analyse IA simulée** avec détection d'anomalies sonores
- **Prédiction de pannes** avec timeframe et urgence
- **Recommandations** personnalisées
- **Historique** des analyses (localStorage)

## Value Proposition

- €320 économie moyenne/an
- 89% précision diagnostic
- 2-4 semaines d'alerte avant panne
- 30 secondes d'analyse

## Monétisation

- Freemium : 3 analyses/mois gratuites
- Premium : analyses illimitées + historique complet
- B2B : API pour assureurs, SAV, fabricants

## Tech Stack

- Next.js 15 + TypeScript
- Tailwind CSS
- React state + localStorage

## Run Locally

```bash
npm install
npm run dev -- -p 3002
```

## Source

Inspiré par GitHub (FluidVoice), forums maintenance industrielle
