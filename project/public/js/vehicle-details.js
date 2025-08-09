// Variables globales pour les détails du véhicule
let currentVehicle = null;
let currentImageIndex = 0;

// Initialisation de la page de détails
document.addEventListener('DOMContentLoaded', function() {
    initializeVehicleDetails();
});

function initializeVehicleDetails() {
    // Récupérer l'ID du véhicule depuis l'URL
    const pathParts = window.location.pathname.split('/');
    const vehicleId = pathParts[pathParts.length - 1];
    
    if (vehicleId) {
        loadVehicleDetails(vehicleId);
    } else {
        showError('ID de véhicule manquant');
    }
    
    setupModals();
}

// Chargement des détails du véhicule
async function loadVehicleDetails(vehicleId) {
    try {
        showLoading();
        
        const response = await fetch(`/api/vehicles/${vehicleId}`);
        if (!response.ok) {
            throw new Error('Véhicule non trouvé');
        }
        
        currentVehicle = await response.json();
        displayVehicleDetails(currentVehicle);
        
    } catch (error) {
        console.error('Erreur lors du chargement:', error);
        showError('Erreur lors du chargement du véhicule');
    }
}

// Affichage des détails du véhicule
function displayVehicleDetails(vehicle) {
    const detailsContainer = document.getElementById('vehicle-details');
    
    const formattedPrice = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
    }).format(vehicle.prix);
    
    const mainImage = vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : '/assets/default-car.jpg';
    
    detailsContainer.innerHTML = `
        <div class="container">
            <!-- Header du véhicule -->
            <div class="vehicle-header">
                <div class="vehicle-header-content">
                    <div>
                        <div class="vehicle-brand-detail">${vehicle.marque}</div>
                        <h1 class="vehicle-title">${vehicle.modele}</h1>
                        <div class="vehicle-price-detail">${formattedPrice}</div>
                    </div>
                    <a href="/" class="back-btn">
                        <i class="fas fa-arrow-left"></i>
                        Retour
                    </a>
                </div>
            </div>
            
            <div class="vehicle-content">
                <!-- Galerie d'images -->
                <div class="vehicle-gallery">
                    <img src="${mainImage}" alt="${vehicle.marque} ${vehicle.modele}" 
                         class="main-image" id="main-image" 
                         onclick="openImageModal(this.src)"
                         onerror="this.src='/assets/default-car.jpg'">
                    
                    ${vehicle.images && vehicle.images.length > 1 ? `
                        <div class="thumbnail-list">
                            ${vehicle.images.map((image, index) => `
                                <img src="${image}" alt="Image ${index + 1}" 
                                     class="thumbnail ${index === 0 ? 'active' : ''}" 
                                     onclick="changeMainImage('${image}', ${index})"
                                     onerror="this.style.display='none'">
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                
                <!-- Informations du véhicule -->
                <div class="vehicle-info">
                    <!-- Spécifications -->
                    <div class="vehicle-specs-detail">
                        <h3><i class="fas fa-cogs"></i> Spécifications</h3>
                        <div class="specs-list">
                            <div class="spec-row">
                                <span class="spec-label">Année</span>
                                <span class="spec-value">${vehicle.annee || 'N/A'}</span>
                            </div>
                            <div class="spec-row">
                                <span class="spec-label">Kilométrage</span>
                                <span class="spec-value">${formatKilometrage(vehicle.kilometrage)}</span>
                            </div>
                            <div class="spec-row">
                                <span class="spec-label">Transmission</span>
                                <span class="spec-value">${vehicle.transmission}</span>
                            </div>
                            <div class="spec-row">
                                <span class="spec-label">Carburant</span>
                                <span class="spec-value">${vehicle.carburant}</span>
                            </div>
                            <div class="spec-row">
                                <span class="spec-label">Côté volant</span>
                                <span class="spec-value">${vehicle.coteVolant}</span>
                            </div>
                            <div class="spec-row">
                                <span class="spec-label">Catégorie</span>
                                <span class="spec-value">${vehicle.categorie || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                    
                    ${vehicle.features && vehicle.features.length > 0 ? `
                        <!-- Fonctionnalités -->
                        <div class="vehicle-features">
                            <h3><i class="fas fa-star"></i> Fonctionnalités</h3>
                            <div class="features-list">
                                ${vehicle.features.map(feature => `
                                    <span class="feature-tag">${feature}</span>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${vehicle.commentaires ? `
                        <!-- Description -->
                        <div class="vehicle-description">
                            <h3><i class="fas fa-info-circle"></i> Description</h3>
                            <p>${vehicle.commentaires}</p>
                        </div>
                    ` : ''}
                    
                    <!-- Actions -->
                    <div class="vehicle-actions">
                        <button class="btn-buy" onclick="openOrderModal()">
                            <i class="fas fa-shopping-cart"></i>
                            Commander maintenant
                        </button>
                        <a href="tel:+243999101335" class="btn-contact">
                            <i class="fas fa-phone"></i>
                            Nous contacter
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Configuration des événements pour les images
    setupImageGallery();
}

// Configuration de la galerie d'images
function setupImageGallery() {
    const thumbnails = document.querySelectorAll('.thumbnail');
    
    thumbnails.forEach((thumbnail, index) => {
        thumbnail.addEventListener('click', function() {
            // Mise à jour de l'image principale
            const mainImage = document.getElementById('main-image');
            mainImage.src = this.src;
            
            // Mise à jour des thumbnails actifs
            thumbnails.forEach(thumb => thumb.classList.remove('active'));
            this.classList.add('active');
            
            currentImageIndex = index;
        });
    });
}

// Changement de l'image principale
function changeMainImage(imageSrc, index) {
    const mainImage = document.getElementById('main-image');
    const thumbnails = document.querySelectorAll('.thumbnail');
    
    mainImage.src = imageSrc;
    currentImageIndex = index;
    
    // Mise à jour des thumbnails actifs
    thumbnails.forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });
}

// Ouverture de la modale d'image
function openImageModal(imageSrc) {
    // Créer la modale d'image si elle n'existe pas
    let imageModal = document.getElementById('image-modal');
    if (!imageModal) {
        imageModal = document.createElement('div');
        imageModal.id = 'image-modal';
        imageModal.className = 'image-modal';
        imageModal.innerHTML = `
            <img src="${imageSrc}" alt="Image agrandie">
            <button class="close-image-modal" onclick="closeImageModal()">&times;</button>
        `;
        document.body.appendChild(imageModal);
    } else {
        imageModal.querySelector('img').src = imageSrc;
    }
    
    imageModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Fermeture de la modale d'image
function closeImageModal() {
    const imageModal = document.getElementById('image-modal');
    if (imageModal) {
        imageModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Ouverture de la modale de commande
function openOrderModal() {
    if (currentVehicle) {
        document.getElementById('vehicle-id').value = currentVehicle._id;
        const modal = document.getElementById('order-modal');
        openModal(modal);
    }
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
            
            const imageModal = document.querySelector('.image-modal.active');
            if (imageModal) {
                closeImageModal();
            }
        }
    });
    
    // Configuration du formulaire de commande
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

// Affichage du chargement
function showLoading() {
    const detailsContainer = document.getElementById('vehicle-details');
    detailsContainer.innerHTML = `
        <div class="container">
            <div class="loading-vehicle">
                <h2>Chargement du véhicule...</h2>
            </div>
        </div>
    `;
}

// Affichage des erreurs
function showError(message) {
    const detailsContainer = document.getElementById('vehicle-details');
    detailsContainer.innerHTML = `
        <div class="container">
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h2>Erreur</h2>
                <p>${message}</p>
                <a href="/" class="btn btn-primary">Retour à l'accueil</a>
            </div>
        </div>
    `;
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

function formatKilometrage(km) {
    if (!km) return 'N/A';
    if (km < 1000) return `${km} km`;
    return `${(km / 1000).toFixed(0)}k km`;
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

// Navigation au clavier pour la galerie
document.addEventListener('keydown', function(e) {
    if (currentVehicle && currentVehicle.images && currentVehicle.images.length > 1) {
        if (e.key === 'ArrowLeft' && currentImageIndex > 0) {
            changeMainImage(currentVehicle.images[currentImageIndex - 1], currentImageIndex - 1);
        } else if (e.key === 'ArrowRight' && currentImageIndex < currentVehicle.images.length - 1) {
            changeMainImage(currentVehicle.images[currentImageIndex + 1], currentImageIndex + 1);
        }
    }
});