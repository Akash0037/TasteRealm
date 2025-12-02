// js/order.js
class Order {
    constructor() {
        this.cart = new Cart();
        this.currentPromo = null;
        this.promoDiscount = 0;
        this.init();
    }
    
    init() {
        this.loadOrderSummary();
        this.setupEventListeners();
        this.setupFormValidation();
        this.checkEmptyCart();
    }
    
    checkEmptyCart() {
        if (this.cart.items.length === 0) {
            // Redirect to menu if cart is empty
            setTimeout(() => {
                if (this.cart.items.length === 0) {
                    alert('Your cart is empty. Redirecting to menu...');
                    window.location.href = 'menu.html';
                }
            }, 500);
        }
    }
    
    loadOrderSummary() {
        const summaryContainer = document.getElementById('orderSummaryItems');
        const subtotalElement = document.querySelector('.order-subtotal');
        const taxElement = document.querySelector('.order-tax');
        const deliveryElement = document.querySelector('.order-delivery');
        const totalElement = document.querySelector('.order-total');
        const discountElement = document.querySelector('.order-discount');
        const discountRow = document.querySelector('.summary-row.discount');
        
        if (!summaryContainer) return;
        
        if (this.cart.items.length === 0) {
            summaryContainer.innerHTML = `
                <div class="empty-order">
                    <p>Your cart is empty</p>
                    <a href="menu.html" class="btn-secondary">Browse Menu</a>
                </div>
            `;
            this.updateTotals(0, 0, 40, 0);
            return;
        }
        
        summaryContainer.innerHTML = this.cart.items.map(item => `
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
        
        this.updateTotals();
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
    
    updateTotals(subtotal = null, tax = null, delivery = null, discount = null) {
        if (subtotal === null) subtotal = this.cart.getTotal();
        if (tax === null) tax = subtotal * 0.05; // 5% tax for India
        
        const orderType = document.getElementById('orderType')?.value;
        if (delivery === null) {
            delivery = (orderType === 'takeaway' || subtotal > 500) ? 0 : 40; // ₹40 delivery fee
        }
        
        if (discount === null) discount = this.promoDiscount;
        
        const total = subtotal + tax + delivery - discount;
        
        const subtotalElement = document.querySelector('.order-subtotal');
        const taxElement = document.querySelector('.order-tax');
        const deliveryElement = document.querySelector('.order-delivery');
        const totalElement = document.querySelector('.order-total');
        const discountElement = document.querySelector('.order-discount');
        const discountRow = document.querySelector('.summary-row.discount');
        
        if (subtotalElement) subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
        if (taxElement) taxElement.textContent = `₹${tax.toFixed(2)}`;
        if (deliveryElement) {
            deliveryElement.textContent = delivery === 0 ? 'FREE' : `₹${delivery.toFixed(2)}`;
            // Add free delivery message
            if (subtotal > 500 && orderType === 'delivery') {
                deliveryElement.innerHTML = 'FREE <span style="color: #27ae60; font-size: 0.8em;">(Over ₹500)</span>';
            }
        }
        
        if (discount > 0) {
            discountRow.style.display = 'flex';
            if (discountElement) discountElement.textContent = `-₹${discount.toFixed(2)}`;
        } else {
            discountRow.style.display = 'none';
        }
        
        if (totalElement) totalElement.textContent = `₹${total.toFixed(2)}`;
    }
    
    setupEventListeners() {
        const orderForm = document.getElementById('orderForm');
        if (orderForm) {
            orderForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleOrderSubmission();
            });
        }
        
        // Update delivery fee based on order type
        const orderTypeSelect = document.getElementById('orderType');
        if (orderTypeSelect) {
            orderTypeSelect.addEventListener('change', (e) => {
                this.updateDeliveryFee(e.target.value);
            });
        }
        
        // Promo code functionality
        const applyPromoBtn = document.getElementById('applyPromo');
        const promoInput = document.getElementById('promoCode');
        
        if (applyPromoBtn && promoInput) {
            applyPromoBtn.addEventListener('click', () => {
                this.applyPromoCode();
            });
            
            promoInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.applyPromoCode();
                }
            });
        }
        
        // Real-time validation
        this.setupRealTimeValidation();
    }
    
    updateDeliveryFee(orderType) {
        const subtotal = this.cart.getTotal();
        let delivery = 40; // ₹40 delivery fee
        
        if (orderType === 'takeaway') {
            delivery = 0;
        } else if (subtotal > 500) {
            delivery = 0;
        }
        
        this.updateTotals(null, null, delivery, null);
    }
    
    applyPromoCode() {
        const promoInput = document.getElementById('promoCode');
        const promoMessage = document.getElementById('promoMessage');
        const promoCode = promoInput.value.trim().toUpperCase();
        
        const promoCodes = {
            'WELCOME10': 0.1,    // 10% off
            'TASTE15': 0.15,     // 15% off
            'FIRSTORDER': 50,    // ₹50 off
            'FREESHIP': 'free'   // Free delivery
        };
        
        if (!promoCode) {
            this.showPromoMessage('Please enter a promo code', 'error');
            return;
        }
        
        if (promoCodes[promoCode]) {
            this.currentPromo = promoCode;
            const discount = promoCodes[promoCode];
            
            if (discount === 'free') {
                this.promoDiscount = 40; // Free delivery value (₹40)
                this.showPromoMessage('Free delivery applied!', 'success');
                this.updateTotals();
            } else if (typeof discount === 'number') {
                if (discount < 1) {
                    // Percentage discount
                    const subtotal = this.cart.getTotal();
                    this.promoDiscount = subtotal * discount;
                } else {
                    // Fixed amount discount
                    this.promoDiscount = discount;
                }
                this.showPromoMessage(`Promo code applied! ₹${this.promoDiscount.toFixed(2)} discount`, 'success');
                this.updateTotals();
            }
            
            promoInput.disabled = true;
            document.getElementById('applyPromo').disabled = true;
        } else {
            this.showPromoMessage('Invalid promo code', 'error');
        }
    }
    
    showPromoMessage(message, type) {
        const promoMessage = document.getElementById('promoMessage');
        promoMessage.textContent = message;
        promoMessage.className = `promo-message ${type}`;
        
        setTimeout(() => {
            promoMessage.textContent = '';
            promoMessage.className = 'promo-message';
        }, 5000);
    }
    
    setupRealTimeValidation() {
        const form = document.getElementById('orderForm');
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                this.clearError(input);
                
                // Real-time phone formatting for Indian numbers
                if (input.type === 'tel') {
                    this.formatPhoneNumber(input);
                }
            });
        });
    }
    
    formatPhoneNumber(input) {
        let value = input.value.replace(/\D/g, '');
        if (value.length > 0) {
            // Format for Indian phone numbers: +91 XXXXXXXXXX
            if (value.length <= 10) {
                value = value.replace(/(\d{5})(\d{5})/, '$1 $2');
            } else if (value.length > 10) {
                value = value.replace(/(\d{2})(\d{5})(\d{5})/, '+$1 $2 $3');
            }
        }
        input.value = value;
    }
    
    setupFormValidation() {
        // Additional validation setup if needed
    }
    
    validateField(field) {
        const value = field.value.trim();
        const errorElement = document.getElementById(field.name + 'Error');
        
        if (field.hasAttribute('required') && !value) {
            this.showError(field, 'This field is required');
            return false;
        }
        
        switch(field.type) {
            case 'email':
                if (value && !this.isValidEmail(value)) {
                    this.showError(field, 'Please enter a valid email address');
                    return false;
                }
                break;
            case 'tel':
                if (!this.isValidIndianPhone(value)) {
                    this.showError(field, 'Please enter a valid Indian phone number');
                    return false;
                }
                break;
            case 'checkbox':
                if (!field.checked) {
                    this.showError(field, 'You must accept the terms and conditions');
                    return false;
                }
                break;
        }
        
        // Specific field validations
        switch(field.name) {
            case 'name':
                if (value.length < 2) {
                    this.showError(field, 'Name must be at least 2 characters long');
                    return false;
                }
                break;
            case 'address':
                if (value.length < 10) {
                    this.showError(field, 'Please enter a complete address');
                    return false;
                }
                break;
        }
        
        this.clearError(field);
        return true;
    }
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    isValidIndianPhone(phone) {
        // Remove formatting characters and check if it's a valid Indian phone number
        const cleanPhone = phone.replace(/[^\d]/g, '');
        return cleanPhone.length === 10 || (cleanPhone.length === 12 && cleanPhone.startsWith('91'));
    }
    
    showError(field, message) {
        const errorElement = document.getElementById(field.name + 'Error');
        if (errorElement) {
            errorElement.textContent = message;
            field.classList.add('error');
        }
    }
    
    clearError(field) {
        const errorElement = document.getElementById(field.name + 'Error');
        if (errorElement) {
            errorElement.textContent = '';
            field.classList.remove('error');
        }
    }
    
    validateForm() {
        const form = document.getElementById('orderForm');
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    handleOrderSubmission() {
        if (!this.validateForm()) {
            this.showNotification('Please fix the errors in the form before submitting.', 'error');
            return;
        }
        
        if (this.cart.items.length === 0) {
            this.showNotification('Your cart is empty. Please add items before placing an order.', 'error');
            return;
        }
        
        // Show loading state
        const submitBtn = document.querySelector('.submit-order');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Processing...';
        submitBtn.disabled = true;
        
        // Simulate order processing
        setTimeout(() => {
            this.processOrder();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 2000);
    }
    
    processOrder() {
        const formData = new FormData(document.getElementById('orderForm'));
        const subtotal = this.cart.getTotal();
        const tax = subtotal * 0.05; // 5% tax
        const delivery = document.querySelector('.order-delivery').textContent === 'FREE' ? 0 : 40;
        const total = subtotal + tax + delivery - this.promoDiscount;
        
        const orderData = {
            customer: {
                name: formData.get('name'),
                phone: formData.get('phone'),
                email: formData.get('email'),
                address: formData.get('address')
            },
            orderType: formData.get('orderType'),
            instructions: formData.get('instructions'),
            payment: formData.get('payment'),
            items: this.cart.items,
            promoCode: this.currentPromo,
            discount: this.promoDiscount,
            subtotal: subtotal,
            tax: tax,
            delivery: delivery,
            total: total,
            orderNumber: this.generateOrderNumber(),
            timestamp: new Date().toISOString()
        };
        
        // Save order to localStorage
        this.saveOrder(orderData);
        
        // Show success modal
        this.showSuccessModal(orderData);
        
        // Clear cart
        this.cart.items = [];
        this.cart.saveToStorage();
        this.cart.updateCartDisplay();
    }
    
    generateOrderNumber() {
        const timestamp = new Date().getTime();
        const random = Math.floor(Math.random() * 1000);
        return `TR-${timestamp}-${random}`;
    }
    
    saveOrder(orderData) {
        const orders = JSON.parse(localStorage.getItem('tasteRealmOrders')) || [];
        orders.push(orderData);
        localStorage.setItem('tasteRealmOrders', JSON.stringify(orders));
    }
    
    showSuccessModal(orderData) {
        const modal = document.getElementById('successModal');
        const orderNumberElement = document.getElementById('orderNumber');
        const orderTypeElement = document.getElementById('orderTypeDisplay');
        const paymentMethodElement = document.getElementById('paymentMethodDisplay');
        
        if (orderNumberElement) {
            orderNumberElement.textContent = orderData.orderNumber;
        }
        
        if (orderTypeElement) {
            orderTypeElement.textContent = orderData.orderType === 'delivery' ? 'Delivery' : 'Takeaway';
        }
        
        if (paymentMethodElement) {
            const paymentMethods = {
                'cash': 'Cash on Delivery',
                'card': 'Credit/Debit Card',
                'digital': 'Digital Wallet'
            };
            paymentMethodElement.textContent = paymentMethods[orderData.payment] || orderData.payment;
        }
        
        modal.style.display = 'flex';
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                window.location.href = 'index.html';
            }
        });
    }
    
    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="close-notification">&times;</button>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'error' ? '#e74c3c' : '#27ae60'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 5px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 3000;
            display: flex;
            align-items: center;
            gap: 1rem;
            max-width: 400px;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Close button event
        notification.querySelector('.close-notification').addEventListener('click', () => {
            notification.remove();
        });
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
}

// Initialize order system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Order();
});