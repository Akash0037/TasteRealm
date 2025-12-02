// js/menu.js
class Menu {
    constructor() {
        this.currentItemId = null;
        this.init();
    }
    
    init() {
        this.setupFilterButtons();
        this.setupImageModal();
        this.setupViewOverlays();
    }
    
    setupFilterButtons() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const menuItems = document.querySelectorAll('.menu-item');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                button.classList.add('active');
                
                const filter = button.dataset.filter;
                
                menuItems.forEach(item => {
                    if (filter === 'all' || item.dataset.category === filter) {
                        item.style.display = 'block';
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'translateY(0)';
                        }, 100);
                    } else {
                        item.style.opacity = '0';
                        item.style.transform = 'translateY(20px)';
                        setTimeout(() => {
                            item.style.display = 'none';
                        }, 300);
                    }
                });
            });
        });
    }
    
    setupImageModal() {
        const modal = document.getElementById('imageModal');
        const modalImage = document.getElementById('modalImage');
        const modalTitle = document.getElementById('modalTitle');
        const modalDescription = document.getElementById('modalDescription');
        const modalPrice = document.getElementById('modalPrice');
        const closeModal = document.querySelector('.close-modal');
        const addToCartModal = document.querySelector('.add-to-cart-modal');
        
        if (!modal) {
            console.error('Image modal not found!');
            return;
        }
        
        // Close modal when clicking X
        closeModal.addEventListener('click', () => {
            this.closeImageModal();
        });
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeImageModal();
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                this.closeImageModal();
            }
        });
        
        // Add to cart from modal
        addToCartModal.addEventListener('click', () => {
            this.addToCartFromModal();
        });
    }
    
    setupViewOverlays() {
        const menuItems = document.querySelectorAll('.menu-item');
        
        menuItems.forEach(item => {
            const overlay = item.querySelector('.view-overlay');
            const image = item.querySelector('.menu-image img');
            
            if (overlay) {
                overlay.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.openImageModal(item);
                });
            }
            
            if (image) {
                image.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.openImageModal(item);
                });
            }
        });
    }
    
    openImageModal(item) {
        const modal = document.getElementById('imageModal');
        const modalImage = document.getElementById('modalImage');
        const modalTitle = document.getElementById('modalTitle');
        const modalDescription = document.getElementById('modalDescription');
        const modalPrice = document.getElementById('modalPrice');
        
        if (!modal) {
            console.error('Modal elements not found!');
            return;
        }
        
        this.currentItemId = item.dataset.id;
        
        // Get the image source
        const imageSrc = item.dataset.image || 
                        item.querySelector('.menu-image img')?.src || 
                        '../assests/placeholder.jpg';
        
        // Fix relative paths if needed
        let finalImageSrc = imageSrc;
        if (imageSrc.startsWith('assests/')) {
            finalImageSrc = '../' + imageSrc;
        }
        
        console.log('Opening modal with image:', finalImageSrc);
        
        // Set modal content
        modalImage.src = finalImageSrc;
        modalImage.alt = item.dataset.name || 'Food Item';
        modalTitle.textContent = item.dataset.name || 'Food Item';
        modalDescription.textContent = item.querySelector('p')?.textContent || 'Delicious food description';
        modalPrice.textContent = item.querySelector('.menu-price')?.textContent || '₹0';
        
        // Show modal
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Add loading state for image
        modalImage.style.opacity = '0';
        modalImage.onload = () => {
            modalImage.style.opacity = '1';
        };
        
        // Handle image loading errors
        modalImage.onerror = () => {
            console.error('Failed to load image:', finalImageSrc);
            modalImage.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xMjUgMTI1SDE3NVYxNzVIMTI1VjEyNVoiIGZpbGw9IiNEOEQ4RDgiLz4KPHBhdGggZD0iTTIwMCAxNTVWMjA1SDI1MFYxNTVIMjAwWiIgZmlsbD0iI0Q4RDhEOCIvPgo8cGF0aCBkPSJNMjc1IDEzNUgzMjVWMTg1SDI3NVYxMzVaIiBmaWxsPSIjRDhEOEQ4Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPg==';
            modalImage.alt = 'Image not available';
            modalImage.style.opacity = '1';
        };
    }
    
    closeImageModal() {
        const modal = document.getElementById('imageModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }
    
    addToCartFromModal() {
        if (!this.currentItemId) return;
        
        const itemElement = document.querySelector(`[data-id="${this.currentItemId}"]`);
        if (itemElement) {
            const addToCartBtn = itemElement.querySelector('.add-to-cart');
            if (addToCartBtn) {
                addToCartBtn.click();
                
                // Close modal after adding to cart
                setTimeout(() => {
                    this.closeImageModal();
                }, 500);
            }
        }
    }
}

// Initialize menu when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Menu();
});