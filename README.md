# Zando Mituka - Concessionnaire Automobile

Site web pour le concessionnaire automobile Zando Mituka à Lubumbashi, République Démocratique du Congo.

## 🚗 Fonctionnalités

### Interface Client
- **Landing Page** avec hero section et statistiques
- **Section Services** : Vente, Location, Livraison à domicile, Location chauffeur
- **Sélection Hebdomadaire** : Nouveaux arrivages, Soldes, Modèles en vedette
- **Catalogue Véhicules** avec filtres par marques et catégories
- **Pages Détaillées** avec galerie d'images
- **Système de Commande** intégré

### Interface Administrateur
- **Dashboard** avec statistiques en temps réel
- **Gestion Stock** : Ajout, modification, suppression de véhicules
- **Gestion Sélection** hebdomadaire
- **Suivi Commandes** clients
- **Upload Multiple** d'images

## 🛠️ Technologies

- **Frontend** : HTML5, CSS3, JavaScript (Vanilla)
- **Backend** : Node.js, Express.js
- **Base de Données** : MongoDB Atlas
- **Upload Fichiers** : Multer
- **Design** : Responsive, Mobile-first

## 🎨 Design

- **Couleurs Principales** : Gold (#ffd700), Blanc (#fff)
- **Style** : Moderne, épuré, professionnel
- **Responsive** : Adapté à tous types d'écrans
- **Animations** : Micro-interactions et transitions fluides

## 📦 Installation

1. **Cloner le repository**
```bash
git clone https://github.com/votre-username/zando-mituka-dealership.git
cd zando-mituka-dealership
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration MongoDB**
   - Créez un compte sur [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Créez un cluster et obtenez votre URL de connexion
   - Remplacez `MONGODB_URI` dans `server.js` par votre URL

4. **Démarrer le serveur**
```bash
# Mode développement
npm run dev

# Mode production
npm start
```

5. **Accéder au site**
   - Interface Client : `http://localhost:3000`
   - Interface Admin : `http://localhost:3000/admin`

## 📁 Structure du Projet

```
zando-mituka-dealership/
├── public/
│   ├── index.html              # Page d'accueil client
│   ├── admin.html              # Interface administrateur
│   ├── vehicle-details.html    # Page détails véhicule
│   ├── styles/
│   │   ├── main.css           # Styles interface client
│   │   ├── admin.css          # Styles interface admin
│   │   └── vehicle-details.css # Styles page détails
│   └── js/
│       ├── main.js            # JavaScript interface client
│       ├── admin.js           # JavaScript interface admin
│       └── vehicle-details.js # JavaScript page détails
├── uploads/                    # Dossier images uploadées
├── server.js                   # Serveur Express
├── package.json               # Dépendances et scripts
└── README.md                  # Documentation
```

## 🚀 Déploiement

### Heroku
1. Créez une app Heroku
2. Connectez votre repository GitHub
3. Configurez les variables d'environnement :
   - `MONGODB_URI` : URL de votre base MongoDB Atlas
   - `PORT` : Port du serveur (automatique sur Heroku)

### Netlify (Frontend seulement)
Pour déployer uniquement la partie frontend sur Netlify, vous devrez adapter le code pour utiliser une API externe.

## 📱 Marques Supportées

- Toyota
- Mercedes-Benz
- BMW
- Mazda
- Land Rover
- Jeep
- Nissan
- Et autres...

## 🏷️ Catégories de Véhicules

- SUV & 4x4
- Citadines
- Berlines
- Pickups
- Vans
- Véhicules Sport

## 📞 Contact

**Zando Mituka**
- 📱 Téléphone : +243 999 101 335
- 📧 Email : contact@zandomituka.com
- 📍 Adresse : GOOF-HAS Rd, Kolwezi

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

---

**Développé avec ❤️ pour Zando Mituka - Votre partenaire automobile de confiance à Lubumbashi**
