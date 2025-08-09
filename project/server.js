const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs-extra');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Créer le dossier uploads s'il n'existe pas
fs.ensureDirSync('uploads');

// Configuration Multer pour l'upload d'images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Connexion MongoDB (remplacez par votre URL MongoDB Atlas)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://username:password@cluster.mongodb.net/zando-mituka?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connecté à MongoDB'))
  .catch(err => console.error('Erreur de connexion MongoDB:', err));

// Schémas MongoDB
const vehicleSchema = new mongoose.Schema({
  marque: String,
  modele: String,
  prix: Number,
  annee: Number,
  kilometrage: Number,
  transmission: String,
  carburant: String,
  coteVolant: String,
  images: [String],
  features: [String],
  commentaires: String,
  categorie: String,
  type: String, // 'selection' ou 'stock'
  selectionType: String, // 'nouveaux', 'soldes', 'vedettes'
  dateCreation: { type: Date, default: Date.now }
});

const commandeSchema = new mongoose.Schema({
  vehiculeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  nomComplet: String,
  telephone: String,
  adresse: String,
  moyenPaiement: String,
  dateLivraison: Date,
  heureLivraison: String,
  statut: { type: String, default: 'En attente' },
  dateCommande: { type: Date, default: Date.now }
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
const Commande = mongoose.model('Commande', commandeSchema);

// Routes API

// Véhicules
app.get('/api/vehicles', async (req, res) => {
  try {
    const { type, selectionType, marque, categorie } = req.query;
    let query = {};
    
    if (type) query.type = type;
    if (selectionType) query.selectionType = selectionType;
    if (marque && marque !== 'Toutes') query.marque = marque;
    if (categorie && categorie !== 'Toutes') query.categorie = categorie;
    
    const vehicles = await Vehicle.find(query).sort({ dateCreation: -1 });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/vehicles/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ error: 'Véhicule non trouvé' });
    }
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/vehicles', upload.array('images', 10), async (req, res) => {
  try {
    const vehicleData = req.body;
    
    if (req.files) {
      vehicleData.images = req.files.map(file => `/uploads/${file.filename}`);
    }
    
    if (vehicleData.features && typeof vehicleData.features === 'string') {
      vehicleData.features = vehicleData.features.split(',').map(f => f.trim());
    }
    
    const vehicle = new Vehicle(vehicleData);
    await vehicle.save();
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/vehicles/:id', upload.array('images', 10), async (req, res) => {
  try {
    const vehicleData = req.body;
    
    if (req.files && req.files.length > 0) {
      vehicleData.images = req.files.map(file => `/uploads/${file.filename}`);
    }
    
    if (vehicleData.features && typeof vehicleData.features === 'string') {
      vehicleData.features = vehicleData.features.split(',').map(f => f.trim());
    }
    
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, vehicleData, { new: true });
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/vehicles/:id', async (req, res) => {
  try {
    await Vehicle.findByIdAndDelete(req.params.id);
    res.json({ message: 'Véhicule supprimé' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Commandes
app.post('/api/commandes', async (req, res) => {
  try {
    const commande = new Commande(req.body);
    await commande.save();
    res.json(commande);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/commandes', async (req, res) => {
  try {
    const commandes = await Commande.find().populate('vehiculeId').sort({ dateCommande: -1 });
    res.json(commandes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/commandes/:id', async (req, res) => {
  try {
    const commande = await Commande.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(commande);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Statistiques pour le dashboard
app.get('/api/stats', async (req, res) => {
  try {
    const totalVehicules = await Vehicle.countDocuments();
    const totalCommandes = await Commande.countDocuments();
    const commandesEnAttente = await Commande.countDocuments({ statut: 'En attente' });
    
    const chiffreAffaires = await Commande.aggregate([
      { $lookup: { from: 'vehicles', localField: 'vehiculeId', foreignField: '_id', as: 'vehicle' } },
      { $unwind: '$vehicle' },
      { $group: { _id: null, total: { $sum: '$vehicle.prix' } } }
    ]);
    
    res.json({
      totalVehicules,
      totalCommandes,
      commandesEnAttente,
      chiffreAffaires: chiffreAffaires[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Routes pour servir les pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/vehicle/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'vehicle-details.html'));
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});