// Variables globales pour l'admin
let currentSection = 'dashboard';
let currentSelectionTab = 'nouveaux';
let vehicles = [];
let orders = [];

// Initialisation de l'interface admin
document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
});

function initializeAdmin() {
    setupNavigation();
    setupModals();
    setupForms();
    loadDashboardData();
}

// Configuration de la navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');
    const pageTitle = document.querySelector('.page-title');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionName = this.dataset.section;
            
            // Mise à jour de la navigation active
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            this.parentElement.classList.add('active');
            
            // Mise à jour des sections
            sections.forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(`${sectionName}-section`).classList.add('active');
            
            // Mise à jour du titre
            const titles = {
                dashboard: 'Tableau de bord',
                vehicles: 'Gestion des Véhicules',
                selection: 'Sélection Hebdomadaire',
                orders: 'Gestion des Commandes'
            };
            pageTitle.textContent = titles[sectionName];
            
            currentSection = sectionName;
            
            // Charger les données de la section
            loadSectionData(sectionName);
        });
    });
    
    // Navigation mobile
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
}

// Chargement des données selon la section
function loadSectionData(section) {
    switch (section) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'vehicles':
            loadVehicles();
            break;
        case 'selection':
            loadSelectionVehicles();
            break;
        case 'orders':
            loadOrders();
            break;
    }
}

// Chargement des données du dashboard
async function loadDashboardData() {
    try {
        const response = await fetch('/api/stats');
        const stats = await response.json();
        
        // Mise à jour des statistiques
        document.getElementById('total-vehicles').textContent = stats.totalVehicules || 0;
        document.getElementById('stock-vehicles').textContent = stats.totalVehicules || 0;
        document.getElementById('total-orders').textContent = stats.totalCommandes || 0;
        document.getElementById('revenue').textContent = `$${(stats.chiffreAffaires || 0).toLocaleString()}`;
        
    } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
    }
}

// Chargement des véhicules de stock
async function loadVehicles() {
    try {
        const response = await fetch('/api/vehicles?type=stock');
        vehicles = await response.json();
        
        const tbody = document.getElementById('vehicles-table');
        if (vehicles.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Aucun véhicule en stock</td></tr>';
            return;
        }
        
        tbody.innerHTML = vehicles.map(vehicle => `
            <tr>
                <td>
                    <img src="${vehicle.images?.[0] || '/assets/default-car.jpg'}" 
                         alt="${vehicle.marque} ${vehicle.modele}" 
                         class="vehicle-image-thumb"
                         onerror="this.src='/assets/default-car.jpg'">
                </td>
                <td>${vehicle.marque}</td>
                <td>${vehicle.modele}</td>
                <td>$${vehicle.prix?.toLocaleString() || 0}</td>
                <td>${vehicle.categorie || 'N/A'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-outline" onclick="editVehicle('${vehicle._id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteVehicle('${vehicle._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Erreur lors du chargement des véhicules:', error);
        document.getElementById('vehicles-table').innerHTML = 
            '<tr><td colspan="6" class="text-center">Erreur lors du chargement</td></tr>';
    }
}

// Chargement des véhicules de sélection
async function loadSelectionVehicles() {
    setupSelectionTabs();
    
    try {
        const response = await fetch(`/api/vehicles?type=selection&selectionType=${currentSelectionTab}`);
        const selectionVehicles = await response.json();
        
        const tbody = document.getElementById('selection-table');
        if (selectionVehicles.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Aucun véhicule dans cette sélection</td></tr>';
            return;
        }
        
        tbody.innerHTML = selectionVehicles.map(vehicle => `
            <tr>
                <td>
                    <img src="${vehicle.images?.[0] || '/assets/default-car.jpg'}" 
                         alt="${vehicle.marque} ${vehicle.modele}" 
                         class="vehicle-image-thumb"
                         onerror="this.src='/assets/default-car.jpg'">
                </td>
                <td>${vehicle.marque}</td>
                <td>${vehicle.modele}</td>
                <td>$${vehicle.prix?.toLocaleString() || 0}</td>
                <td><span class="status-badge">${getSelectionTypeLabel(vehicle.selectionType)}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-outline" onclick="editVehicle('${vehicle._id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteVehicle('${vehicle._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Erreur lors du chargement de la sélection:', error);
        document.getElementById('selection-table').innerHTML = 
            '<tr><td colspan="6" class="text-center">Erreur lors du chargement</td></tr>';
    }
}

// Configuration des onglets de sélection
function setupSelectionTabs() {
    const tabButtons = document.querySelectorAll('.selection-tabs .tab-btn');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            
            // Mise à jour des boutons actifs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            currentSelectionTab = tabName;
            loadSelectionVehicles();
        });
    });
}

// Chargement des commandes
async function loadOrders() {
    try {
        const response = await fetch('/api/commandes');
        orders = await response.json();
        
        const tbody = document.getElementById('orders-table');
        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">Aucune commande</td></tr>';
            return;
        }
        
        tbody.innerHTML = orders.map(order => `
            <tr>
                <td>${new Date(order.dateCommande).toLocaleDateString()}</td>
                <td>${order.nomComplet}</td>
                <td>${order.vehiculeId?.marque} ${order.vehiculeId?.modele || 'Véhicule supprimé'}</td>
                <td>$${order.vehiculeId?.prix?.toLocaleString() || 0}</td>
                <td>${order.telephone}</td>
                <td><span class="status-badge status-${getStatusClass(order.statut)}">${order.statut}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-success" onclick="updateOrderStatus('${order._id}', 'Confirmé')">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="viewOrderDetails('${order._id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Erreur lors du chargement des commandes:', error);
        document.getElementById('orders-table').innerHTML = 
            '<tr><td colspan="7" class="text-center">Erreur lors du chargement</td></tr>';
    }
}

// Configuration des modales
function setupModals() {
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.close-modal');
    
    // Boutons d'ajout
    const addVehicleBtn = document.getElementById('add-vehicle-btn');
    const addSelectionBtn = document.getElementById('add-selection-btn');
    
    if (addVehicleBtn) {
        addVehicleBtn.addEventListener('click', () => openVehicleModal());
    }
    
    if (addSelectionBtn) {
        addSelectionBtn.addEventListener('click', () => openVehicleModal('selection'));
    }
    
    // Fermeture des modales
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Fermeture en cliquant en dehors
    modales.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this);
            }
        });
    });
}

// Ouverture de la modale véhicule
function openVehicleModal(type = 'stock', vehicleData = null) {
    const modal = document.getElementById('vehicle-modal');
    const form = document.getElementById('vehicle-form');
    const title = document.getElementById('vehicle-modal-title');
    const typeInput = document.getElementById('vehicle-type');
    const selectionTypeGroup = document.getElementById('selection-type-group');
    
    // Réinitialiser le formulaire
    form.reset();
    document.getElementById('vehicle-edit-id').value = '';
    
    // Configuration selon le type
    typeInput.value = type;
    title.textContent = vehicleData ? 'Modifier le véhicule' : 
                       type === 'selection' ? 'Ajouter à la sélection' : 'Ajouter un véhicule';
    
    selectionTypeGroup.style.display = type === 'selection' ? 'block' : 'none';
    
    if (type === 'selection') {
        document.getElementById('selection-type').value = currentSelectionTab;
    }
    
    // Pré-remplir si modification
    if (vehicleData) {
        fillVehicleForm(vehicleData);
    }
    
    openModal(modal);
}

// Remplissage du formulaire avec les données du véhicule
function fillVehicleForm(vehicle) {
    document.getElementById('vehicle-edit-id').value = vehicle._id;
    document.getElementById('marque').value = vehicle.marque || '';
    document.getElementById('modele').value = vehicle.modele || '';
    document.getElementById('prix').value = vehicle.prix || '';
    document.getElementById('annee').value = vehicle.annee || '';
    document.getElementById('kilometrage').value = vehicle.kilometrage || '';
    document.getElementById('transmission').value = vehicle.transmission || '';
    document.getElementById('carburant').value = vehicle.carburant || '';
    document.getElementById('cote-volant').value = vehicle.coteVolant || '';
    document.getElementById('categorie').value = vehicle.categorie || '';
    document.getElementById('features').value = vehicle.features?.join(', ') || '';
    document.getElementById('commentaires').value = vehicle.commentaires || '';
    
    if (vehicle.selectionType) {
        document.getElementById('selection-type').value = vehicle.selectionType;
    }
}

// Configuration des formulaires
function setupForms() {
    const vehicleForm = document.getElementById('vehicle-form');
    
    if (vehicleForm) {
        vehicleForm.addEventListener('submit', handleVehicleSubmit);
    }
}

// Gestion de la soumission du formulaire véhicule
async function handleVehicleSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const vehicleId = document.getElementById('vehicle-edit-id').value;
    
    try {
        const url = vehicleId ? `/api/vehicles/${vehicleId}` : '/api/vehicles';
        const method = vehicleId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            body: formData
        });
        
        if (response.ok) {
            showNotification('Véhicule enregistré avec succès !', 'success');
            closeModal(document.getElementById('vehicle-modal'));
            
            // Recharger les données appropriées
            if (currentSection === 'vehicles') {
                loadVehicles();
            } else if (currentSection === 'selection') {
                loadSelectionVehicles();
            }
            
            loadDashboardData(); // Mettre à jour les stats
        } else {
            throw new Error('Erreur lors de l\'enregistrement');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur lors de l\'enregistrement', 'error');
    }
}

// Édition d'un véhicule
function editVehicle(vehicleId) {
    const vehicle = vehicles.find(v => v._id === vehicleId) || 
                   orders.find(o => o.vehiculeId && o.vehiculeId._id === vehicleId)?.vehiculeId;
    
    if (vehicle) {
        openVehicleModal(vehicle.type || 'stock', vehicle);
    }
}

// Suppression d'un véhicule
async function deleteVehicle(vehicleId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/vehicles/${vehicleId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showNotification('Véhicule supprimé avec succès !', 'success');
            
            // Recharger les données
            if (currentSection === 'vehicles') {
                loadVehicles();
            } else if (currentSection === 'selection') {
                loadSelectionVehicles();
            }
            
            loadDashboardData();
        } else {
            throw new Error('Erreur lors de la suppression');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur lors de la suppression', 'error');
    }
}

// Mise à jour du statut d'une commande
async function updateOrderStatus(orderId, newStatus) {
    try {
        const response = await fetch(`/api/commandes/${orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ statut: newStatus })
        });
        
        if (response.ok) {
            showNotification('Statut mis à jour avec succès !', 'success');
            loadOrders();
        } else {
            throw new Error('Erreur lors de la mise à jour');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur lors de la mise à jour', 'error');
    }
}

// Voir les détails d'une commande
function viewOrderDetails(orderId) {
    const order = orders.find(o => o._id === orderId);
    if (order) {
        const details = `
            Client: ${order.nomComplet}
            Téléphone: ${order.telephone}
            Adresse: ${order.adresse}
            Véhicule: ${order.vehiculeId?.marque} ${order.vehiculeId?.modele}
            Prix: $${order.vehiculeId?.prix?.toLocaleString()}
            Moyen de paiement: ${order.moyenPaiement}
            Date de livraison: ${new Date(order.dateLivraison).toLocaleDateString()}
            Heure: ${order.heureLivraison}
            Statut: ${order.statut}
        `;
        alert(details); // En production, utiliser une vraie modale
    }
}

// Fonctions utilitaires
function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function getSelectionTypeLabel(type) {
    const labels = {
        'nouveaux': 'Nouveau',
        'soldes': 'Solde',
        'vedettes': 'Vedette'
    };
    return labels[type] || type;
}

function getStatusClass(status) {
    const classes = {
        'En attente': 'pending',
        'Confirmé': 'completed',
        'Livré': 'completed',
        'Annulé': 'cancelled'
    };
    return classes[status] || 'pending';
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        z-index: 3000;
        transform: translateX(400px);
        transition: transform 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    const close = () => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    };
    
    notification.querySelector('.notification-close').addEventListener('click', close);
    setTimeout(close, 5000);
}

// Chargement initial
loadDashboardData();