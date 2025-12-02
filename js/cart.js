// js/cart.js
class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('tasteRealmCart')) || [];
        this.init();
    }
    
    init() {
        this.updateCartDisplay();
        this.setupEventListeners();
    }
    
    addItem(item) {
        const existingItem = this.items.find(i => i.id === item.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({...item, quantity: 1});
        }
        
        this.saveToStorage();
        this.updateCartDisplay();
        this.showAddToCartNotification(item.name);
        
        return this;
    }
    
    removeItem(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
        this.saveToStorage();
        this.updateCartDisplay();
        return this;
    }
    
    updateQuantity(itemId, newQuantity) {
        if (newQuantity <= 0) {
            this.removeItem(itemId);
            return this;
        }
        
        const item = this.items.find(i => i.id === itemId);
        if (item) {
            item.quantity = newQuantity;
            this.saveToStorage();
            this.updateCartDisplay();
        }
        return this;
    }
    
    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    
    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }
    
    saveToStorage() {
        localStorage.setItem('tasteRealmCart', JSON.stringify(this.items));
    }
    
    updateCartDisplay() {
        // Update cart count in navigation
        const cartCountElements = document.querySelectorAll('.cart-count');
        const totalItems = this.getTotalItems();
        
        cartCountElements.forEach(element => {
            element.textContent = totalItems;
            element.style.display = totalItems > 0 ? 'flex' : 'none';
        });
        
        // Update cart page if we're on it
        if (document.querySelector('.cart-page')) {
            this.renderCartPage();
        }
        
        // Update order page if we're on it
        if (document.querySelector('.order-page')) {
            this.updateOrderSummary();
        }
    }
    
    renderCartPage() {
        const cartContainer = document.getElementById('cartItems');
        if (!cartContainer) return;
        
        if (this.items.length === 0) {
            cartContainer.innerHTML = `
                <div class="empty-cart">
                    <h3>Your cart is empty</h3>
                    <p>Add some delicious items from our menu!</p>
                    <a href="menu.html" class="btn-primary">Browse Menu</a>
                </div>
            `;
            this.updateCartTotals();
            return;
        }
        
        cartContainer.innerHTML = this.items.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="item-image">
                    <img src="${this.fixImagePath(item.image)}" alt="${item.name}" 
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xMjUgMTI1SDE3NVYxNzVIMTI1VjEyNVoiIGZpbGw9IiNEOEQ4RDgiLz4KPHBhdGggZD0iTTIwMCAxNTVWMjA1SDI1MFYxNTVIMjAwWiIgZpbGw9IiNEOEQ4RDgiLz4KPHBhdGggZD0iTTI3NSAxMzVIMzI1VjE4NUgyNzVWMTM1WiIgZmlsbD0iI0Q4RDhEOCIvPgo8dGV4dCB4PSIyMDAiIHk9IjI0MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzk5OSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0Ij5JbWFnZSBub3QgYXZhaWxhYmxlPC90ZXh0Pgo8L3N2Zz4='">
                </div>
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p class="item-category">${this.formatCategory(item.category)}</p>
                    <p class="item-price">₹${item.price.toFixed(2)}</p>
                </div>
                <div class="item-controls">
                    <button class="quantity-btn minus" data-id="${item.id}">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn plus" data-id="${item.id}">+</button>
                    <button class="remove-btn" data-id="${item.id}">Remove</button>
                </div>
                <div class="item-total">
                    ₹${(item.price * item.quantity).toFixed(2)}
                </div>
            </div>
        `).join('');
        
        this.updateCartTotals();
        this.setupCartEventListeners();
    }
    
    updateCartTotals() {
        const subtotal = this.getTotal();
        const tax = subtotal * 0.05;
        const delivery = subtotal > 500 ? 0 : 40;
        const total = subtotal + tax + delivery;
        
        const elements = {
            subtotal: document.querySelector('.cart-subtotal'),
            tax: document.querySelector('.cart-tax'),
            delivery: document.querySelector('.delivery-fee'),
            total: document.querySelector('.cart-total')
        };
        
        if (elements.subtotal) elements.subtotal.textContent = `₹${subtotal.toFixed(2)}`;
        if (elements.tax) elements.tax.textContent = `₹${tax.toFixed(2)}`;
        if (elements.delivery) {
            elements.delivery.textContent = delivery === 0 ? 'FREE' : `₹${delivery.toFixed(2)}`;
        }
        if (elements.total) elements.total.textContent = `₹${total.toFixed(2)}`;
    }
    
    updateOrderSummary() {
        const summaryContainer = document.getElementById('orderSummaryItems');
        if (!summaryContainer) return;
        
        if (this.items.length === 0) {
            summaryContainer.innerHTML = `
                <div class="empty-order">
                    <p>Your cart is empty</p>
                    <a href="menu.html" class="btn-secondary">Browse Menu</a>
                </div>
            `;
            return;
        }
        
        summaryContainer.innerHTML = this.items.map(item => `
            <div class="order-item">
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <span class="item-quantity">Qty: ${item.quantity}</span>
                    <span class="item-category">${this.formatCategory(item.category)}</span>
                </div>
                <div class="item-price">
                    ₹${(item.price * item.quantity).toFixed(2)}
                </div>
            </div>
        `).join('');
    }
    
    setupCartEventListeners() {
        // Use event delegation with proper event handling
        const cartContainer = document.getElementById('cartItems');
        if (!cartContainer) return;
        
        // Remove any existing event listeners by cloning the container
        const newCartContainer = cartContainer.cloneNode(true);
        cartContainer.parentNode.replaceChild(newCartContainer, cartContainer);
        
        // Add event listeners to the new container
        newCartContainer.addEventListener('click', (e) => {
            const target = e.target;
            
            if (target.classList.contains('minus')) {
                e.preventDefault();
                e.stopPropagation();
                const itemId = target.dataset.id;
                const item = this.items.find(i => i.id === itemId);
                if (item) {
                    this.updateQuantity(itemId, item.quantity - 1);
                }
            }
            
            if (target.classList.contains('plus')) {
                e.preventDefault();
                e.stopPropagation();
                const itemId = target.dataset.id;
                const item = this.items.find(i => i.id === itemId);
                if (item) {
                    this.updateQuantity(itemId, item.quantity + 1);
                }
            }
            
            if (target.classList.contains('remove-btn')) {
                e.preventDefault();
                e.stopPropagation();
                const itemId = target.dataset.id;
                this.removeItem(itemId);
            }
        });
    }
    
    fixImagePath(imagePath) {
        if (imagePath && imagePath.startsWith('../assests/')) {
            return imagePath;
        } else if (imagePath && imagePath.startsWith('assests/')) {
            return '../' + imagePath;
        }
        return imagePath;
    }
    
    formatCategory(category) {
        const categories = {
            'veg': 'Vegetarian',
            'nonveg': 'Non-Vegetarian',
            'breads': 'Bread',
            'rice': 'Rice Dish',
            'beverages': 'Beverage',
            'sweets': 'Sweet'
        };
        return categories[category] || category;
    }
    
    showAddToCartNotification(itemName) {
        // Remove any existing notifications first
        document.querySelectorAll('.add-to-cart-notification').forEach(notification => {
            notification.remove();
        });
        
        const notification = document.createElement('div');
        notification.className = 'add-to-cart-notification';
        notification.innerHTML = `<span>✓ ${itemName} added to cart!</span>`;
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: #27ae60;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 5px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 3000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
    
    setupEventListeners() {
        // Use event delegation for Add to Cart buttons
        document.addEventListener('click', (e) => {
            const target = e.target;
            
            if (target.classList.contains('add-to-cart') || target.classList.contains('add-to-cart-modal')) {
                e.preventDefault();
                e.stopPropagation();
                
                const itemElement = target.closest('.menu-item');
                if (itemElement) {
                    const item = {
                        id: itemElement.dataset.id,
                        name: itemElement.dataset.name,
                        price: parseFloat(itemElement.dataset.price),
                        image: itemElement.dataset.image,
                        category: itemElement.dataset.category
                    };
                    
                    this.addItem(item);
                    
                    // Show button feedback
                    const originalText = target.textContent;
                    target.textContent = '✓ Added!';
                    target.disabled = true;
                    
                    setTimeout(() => {
                        target.textContent = originalText;
                        target.disabled = false;
                    }, 1500);
                }
            }
        });
    }
}

// Initialize cart when DOM is loaded - only once
let cartInitialized = false;

document.addEventListener('DOMContentLoaded', function() {
    if (!cartInitialized) {
        window.cart = new Cart();
        cartInitialized = true;
    }
});