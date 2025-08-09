// Configuration et variables globales
let currentBrand = 'Toutes';
let currentCategory = 'Toutes';
let currentSelectionTab = 'nouveaux';
let vehiclesPerPage = 12;
let currentVehiclesPage = 1;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Navigation et menus
    setupNavigation();
    
    // Sections et onglets
    setupTabs();
    setupFilters();
    
    // Chargement des données
    loadSelectionVehicles();
    loadStockVehicles();
    
    // Modals et formulaires
    setupModals();
    setupForms();
    
    // Animations et interactions
    setupAnimations();
}

// Navigation et menus mobiles
function setupNavigation() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            nav.classList.toggle('active');
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });
    }
    
    // Smooth scrolling pour les liens d'ancrage
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Fermer le menu mobile
                if (nav.classList.contains('active')) {
                    nav.classList.remove('active');
                    mobileMenuBtn.querySelector('i').classList.add('fa-bars');
                    mobileMenuBtn.querySelector('i').classList.remove('fa-times');
                }
            }
        });
    });
}

// Configuration des onglets
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            
            // Mise à jour des boutons actifs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Mise à jour du contenu actif
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabName) {
                    content.classList.add('active');
                }
            });
            
            currentSelectionTab = tabName;
            loadSelectionVehicles();
        });
    });
}

// Configuration des filtres
function setupFilters() {
    // Filtres par marques
    const brandButtons = document.querySelectorAll('.brand-btn');
    brandButtons.forEach(button => {
        button.addEventListener('click', function() {
            const brand = this.dataset.brand;
            
            brandButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            currentBrand = brand;
            currentVehiclesPage = 1;
            loadStockVehicles();
        });
    });
    
    // Filtres par catégories
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.dataset.category;
            
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            currentCategory = category;
            currentVehiclesPage = 1;
            loadStockVehicles();
        });
    });
    
    // Bouton "Voir plus"
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            currentVehiclesPage++;
            loadStockVehicles(true);
        });
    }
}

// Chargement des véhicules de sélection
async function loadSelectionVehicles() {
    const grid = document.getElementById(`${currentSelectionTab}-grid`);
    if (!grid) return;
    
    try {
        grid.innerHTML = '<div class="loading">Chargement...</div>';
        
        const response = await fetch(`/api/vehicles?type=selection&selectionType=${currentSelectionTab}`);
        const vehicles = await response.json();
        
        if (vehicles.length === 0) {
            grid.innerHTML = '<div class="empty-state"><p>Aucun véhicule dans cette sélection</p></div>';
            return;
        }
        
        grid.innerHTML = vehicles.map(vehicle => createVehicleCard(vehicle)).join('');
        
        // Ajouter les événements aux cartes
        setupVehicleCards();
        
    } catch (error) {
        console.error('Erreur lors du chargement des véhicules de sélection:', error);
        grid.innerHTML = '<div class="error">Erreur lors du chargement</div>';
    }
}

// Chargement des véhicules de stock
async function loadStockVehicles(append = false) {
    const grid = document.getElementById('vehicles-stock-grid');
    if (!grid) return;
    
    try {
        if (!append) {
            grid.innerHTML = '<div class="loading">Chargement...</div>';
        }
        
        const params = new URLSearchParams({
            type: 'stock',
            marque: currentBrand,
            categorie: currentCategory,
            page: currentVehiclesPage,
            limit: vehiclesPerPage
        });
        
        const response = await fetch(`/api/vehicles?${params}`);
        const vehicles = await response.json();
        
        if (vehicles.length === 0 && !append) {
            grid.innerHTML = '<div class="empty-state"><p>Aucun véhicule trouvé</p></div>';
            return;
        }
        
        const vehicleCards = vehicles.map(vehicle => createVehicleCard(vehicle)).join('');
        
        if (append) {
            grid.innerHTML += vehicleCards;
        } else {
            grid.innerHTML = vehicleCards;
        }
        
        // Gérer l'affichage du bouton "Voir plus"
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.style.display = vehicles.length < vehiclesPerPage ? 'none' : 'block';
        }
        
        // Ajouter les événements aux cartes
        setupVehicleCards();
        
    } catch (error) {
        console.error('Erreur lors du chargement des véhicules de stock:', error);
        if (!append) {
            grid.innerHTML = '<div class="error">Erreur lors du chargement</div>';
        }
    }
}

// Création d'une carte de véhicule
function createVehicleCard(vehicle) {
    const mainImage = vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : '/assets/default-car.jpg';
    const formattedPrice = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
    }).format(vehicle.prix);
    
    return `
        <div class="vehicle-card" data-vehicle-id="${vehicle._id}">
            <div class="vehicle-image">
                <img src="${mainImage}" alt="${vehicle.marque} ${vehicle.modele}" 
                     onerror="this.src='/assets/default-car.jpg'">
                ${vehicle.selectionType ? `<div class="vehicle-badge">${getBadgeText(vehicle.selectionType)}</div>` : ''}
            </div>
            <div class="vehicle-info">
                <div class="vehicle-brand">${vehicle.marque}</div>
                <h3 class="vehicle-name">${vehicle.modele}</h3>
                <div class="vehicle-price">${formattedPrice}</div>
                <div class="vehicle-specs">
                    <div class="spec-item">
                        <i class="fas fa-cogs"></i>
                        <span>${vehicle.transmission}</span>
                    </div>
                    <div class="spec-item">
                        <i class="fas fa-road"></i>
                        <span>${formatKilometrage(vehicle.kilometrage)}</span>
                    </div>
                    <div class="spec-item">
                        <i class="fas fa-steering-wheel"></i>
                        <span>${vehicle.coteVolant}</span>
                    </div>
                    <div class="spec-item">
                        <i class="fas fa-gas-pump"></i>
                        <span>${vehicle.carburant}</span>
                    </div>
                </div>
                <div class="vehicle-actions">
                    <button class="btn-details" onclick="viewVehicleDetails('${vehicle._id}')">
                        Voir détails
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Configuration des événements sur les cartes de véhicule
function setupVehicleCards() {
    const vehicleCards = document.querySelectorAll('.vehicle-card');
    
    vehicleCards.forEach(card => {
        // Animation hover
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
        
        // Click sur la carte pour voir les détails
        card.addEventListener('click', function(e) {
            if (!e.target.classList.contains('btn-details')) {
                const vehicleId = this.dataset.vehicleId;
                viewVehicleDetails(vehicleId);
            }
        });
    });
}

// Voir les détails d'un véhicule
function viewVehicleDetails(vehicleId) {
    window.location.href = `/vehicle/${vehicleId}`;
}

// Configuration des modales
function setupModals() {
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.close-modal');
    
    // Fermeture des modales
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Fermeture en cliquant en dehors
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this);
            }
        });
    });
    
    // Fermeture avec Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                closeModal(activeModal);
            }
        }
    });
}

// Ouverture d'une modale
function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Fermeture d'une modale
function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Configuration des formulaires
function setupForms() {
    // Formulaire de newsletter
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            
            // Simulation d'inscription
            showNotification('Merci pour votre inscription !', 'success');
            this.reset();
        });
    }
    
    // Formulaire de commande
    const orderForm = document.getElementById('order-form');
    if (orderForm) {
        orderForm.addEventListener('submit', handleOrderSubmit);
    }
}

// Gestion de la soumission de commande
async function handleOrderSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const orderData = Object.fromEntries(formData);
    orderData.vehiculeId = document.getElementById('vehicle-id').value;
    
    try {
        const response = await fetch('/api/commandes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });
        
        if (response.ok) {
            showNotification('Commande envoyée avec succès !', 'success');
            closeModal(document.getElementById('order-modal'));
            e.target.reset();
        } else {
            throw new Error('Erreur lors de l\'envoi de la commande');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur lors de l\'envoi de la commande', 'error');
    }
}

// Configuration des animations
function setupAnimations() {
    // Observer pour les animations au scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observer les éléments à animer
    const animatedElements = document.querySelectorAll('.service-card, .vehicle-card, .stat-item');
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(element);
    });
}

// Fonctions utilitaires
function getBadgeText(selectionType) {
    const badges = {
        'nouveaux': 'Nouveau',
        'soldes': 'Solde',
        'vedettes': 'Vedette'
    };
    return badges[selectionType] || selectionType;
}

function formatKilometrage(km) {
    if (km < 1000) return `${km} km`;
    return `${(km / 1000).toFixed(0)}k km`;
}

function formatPrice(price) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
    }).format(price);
}

function showNotification(message, type = 'info') {
    // Créer l'élément de notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Styles de la notification
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
    
    // Ajouter au DOM
    document.body.appendChild(notification);
    
    // Animer l'entrée
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Fermeture automatique et manuelle
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

// Fonction globale pour commander un véhicule
function orderVehicle(vehicleId) {
    document.getElementById('vehicle-id').value = vehicleId;
    openModal(document.getElementById('order-modal'));
}

// Gestion du header transparent/fixe
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    const scrolled = window.pageYOffset;
    
    if (scrolled > 100) {
        header.style.background = 'rgba(26, 26, 26, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
    } else {
        header.style.background = 'rgba(26, 26, 26, 0.8)';
        header.style.backdropFilter = 'blur(5px)';
    }
});