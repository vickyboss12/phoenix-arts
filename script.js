// ==================== Utility Functions ====================

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Format date
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Convert image to base64
function imageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ==================== User Authentication ====================

// Get all users
function getUsers() {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
}

// Save users
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// Get current user
function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

// Set current user
function setCurrentUser(user) {
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
        localStorage.removeItem('currentUser');
    }
}

// Check if user is logged in
function isLoggedIn() {
    return getCurrentUser() !== null;
}

// Check if user is admin
function isAdmin() {
    return localStorage.getItem('isAdmin') === 'true';
}

// Set admin status
function setAdminStatus(status) {
    localStorage.setItem('isAdmin', status ? 'true' : 'false');
}

// Admin credentials
const ADMIN_USERNAME = 'vistark';
const ADMIN_PASSWORD = 'phoenixarts12';

// Check authentication on page load
function checkAuth() {
    const currentPath = window.location.pathname;
    const isAuthPage = currentPath.includes('login.html') || currentPath.includes('signup.html');
    const isAdminPage = currentPath.includes('admin-dashboard.html');
    
    if (isAuthPage) {
        // If already logged in, redirect to home
        if (isLoggedIn() || isAdmin()) {
            if (isAdmin()) {
                window.location.href = 'admin-dashboard.html';
            } else {
                window.location.href = 'index.html';
            }
        }
    } else if (isAdminPage) {
        // Admin page - check admin status
        if (!isAdmin()) {
            window.location.href = 'login.html';
        }
    } else {
        // Regular pages - check user login
        if (!isLoggedIn() && !isAdminPage) {
            window.location.href = 'login.html';
        }
    }
}

// Run auth check on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAuth);
} else {
    checkAuth();
}

// ==================== localStorage Management ====================

// Get orders from localStorage
function getOrders() {
    const orders = localStorage.getItem('artOrders');
    return orders ? JSON.parse(orders) : [];
}

// Save orders to localStorage
function saveOrders(orders) {
    localStorage.setItem('artOrders', JSON.stringify(orders));
}

// Get gallery items from localStorage
function getGallery() {
    const gallery = localStorage.getItem('artGallery');
    return gallery ? JSON.parse(gallery) : [];
}

// Save gallery to localStorage
function saveGallery(gallery) {
    localStorage.setItem('artGallery', JSON.stringify(gallery));
}

// Get QR codes from localStorage
function getQRCodes() {
    const qrCodes = localStorage.getItem('qrCodes');
    return qrCodes ? JSON.parse(qrCodes) : { portrait: null, landscape: null };
}

// Save QR codes to localStorage
function saveQRCodes(qrCodes) {
    localStorage.setItem('qrCodes', JSON.stringify(qrCodes));
}

// ==================== Art Submission Form ====================

if (document.getElementById('artSubmissionForm')) {
    const form = document.getElementById('artSubmissionForm');
    const imageUpload = document.getElementById('imageUpload');
    const imagePreview = document.getElementById('imagePreview');
    const successModal = document.getElementById('successModal');
    const phoneInput = document.getElementById('phone');

    // Phone number validation - only numbers
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
    }

    // Image preview
    if (imageUpload) {
        imageUpload.addEventListener('change', async function(e) {
            const file = e.target.files[0];
            if (file) {
                const base64 = await imageToBase64(file);
                imagePreview.innerHTML = `<img src="${base64}" alt="Preview">`;
            }
        });
    }

    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            id: generateId(),
            name: document.getElementById('name').value,
            gender: document.getElementById('gender').value,
            phone: '+91' + document.getElementById('phone').value,
            sheetSize: document.querySelector('input[name="sheetSize"]:checked').value,
            artPosition: document.querySelector('input[name="artPosition"]:checked').value,
            whichMembers: document.getElementById('whichMembers').value,
            frames: document.querySelector('input[name="frames"]:checked').value,
            status: 'Submitted',
            date: new Date().toISOString()
        };

        // Get image
        const imageFile = imageUpload.files[0];
        if (imageFile) {
            formData.image = await imageToBase64(imageFile);
        }

        // Save order
        const orders = getOrders();
        orders.push(formData);
        saveOrders(orders);

        // Reset form
        form.reset();
        imagePreview.innerHTML = '';

        // Show success modal
        if (successModal) {
            successModal.classList.add('show');
            
            // Auto close after 5 seconds
            setTimeout(function() {
                successModal.classList.remove('show');
            }, 5000);
        }
    });

    // Close success modal
    if (successModal) {
        const closeBtn = successModal.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                successModal.classList.remove('show');
            });
        }
        
        window.addEventListener('click', function(e) {
            if (e.target === successModal) {
                successModal.classList.remove('show');
            }
        });
    }
}

// ==================== Gallery Management ====================

if (document.getElementById('galleryGrid')) {
    const addArtBtn = document.getElementById('addArtBtn');
    const artFormModal = document.getElementById('artFormModal');
    const galleryForm = document.getElementById('galleryForm');
    const galleryGrid = document.getElementById('galleryGrid');
    const emptyGallery = document.getElementById('emptyGallery');
    const artImageInput = document.getElementById('artImage');
    const artImagePreview = document.getElementById('artImagePreview');

    // Add Art Button (Admin only)
    if (addArtBtn) {
        addArtBtn.addEventListener('click', function(e) {
            if (!isAdmin()) {
                e.preventDefault();
                alert('Admin access required. Please login as admin.');
                const adminLoginModal = document.getElementById('adminLoginModal');
                if (adminLoginModal) {
                    adminLoginModal.classList.add('show');
                }
                return false;
            }
            document.getElementById('formTitle').textContent = 'Add New Art';
            galleryForm.reset();
            document.getElementById('artId').value = '';
            artImagePreview.innerHTML = '';
            artFormModal.classList.add('show');
        });
    }

    // Image preview for gallery form
    if (artImageInput) {
        artImageInput.addEventListener('change', async function(e) {
            const file = e.target.files[0];
            if (file) {
                const base64 = await imageToBase64(file);
                artImagePreview.innerHTML = `<img src="${base64}" alt="Preview">`;
            }
        });
    }

    // Gallery Form Submission
    if (galleryForm) {
        galleryForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const artId = document.getElementById('artId').value;
            const formData = {
                id: artId || generateId(),
                title: document.getElementById('artTitle').value,
                description: document.getElementById('artDescription').value,
                category: document.getElementById('artCategory').value,
                date: new Date().toISOString()
            };

            // Get image
            const imageFile = artImageInput.files[0];
            if (imageFile) {
                formData.image = await imageToBase64(imageFile);
            } else if (artId) {
                // Keep existing image if editing
                const gallery = getGallery();
                const existing = gallery.find(item => item.id === artId);
                if (existing) {
                    formData.image = existing.image;
                }
            }

            // Save to gallery
            const gallery = getGallery();
            if (artId) {
                const index = gallery.findIndex(item => item.id === artId);
                if (index !== -1) {
                    gallery[index] = formData;
                }
            } else {
                gallery.push(formData);
            }
            saveGallery(gallery);

            // Refresh gallery
            loadGallery();
            closeArtFormModal();
        });
    }

    // Load Gallery
    function loadGallery() {
        const gallery = getGallery();
        galleryGrid.innerHTML = '';

        if (gallery.length === 0) {
            emptyGallery.style.display = 'block';
            galleryGrid.style.display = 'none';
        } else {
            emptyGallery.style.display = 'none';
            galleryGrid.style.display = 'grid';

            gallery.forEach(item => {
                const galleryItem = document.createElement('div');
                galleryItem.className = 'gallery-item';
                const isAdminUser = isAdmin();
                galleryItem.innerHTML = `
                    <img src="${item.image || 'https://via.placeholder.com/300'}" alt="${item.title}">
                    <div class="gallery-item-content">
                        <h3>${item.title}</h3>
                        <p>${item.description || ''}</p>
                        <p><strong>Category:</strong> ${item.category}</p>
                        ${isAdminUser ? `
                        <div class="gallery-item-actions">
                            <button class="btn-edit" onclick="editGalleryItem('${item.id}')">Edit</button>
                            <button class="btn-delete" onclick="deleteGalleryItem('${item.id}')">Delete</button>
                        </div>
                        ` : ''}
                    </div>
                `;
                galleryGrid.appendChild(galleryItem);
            });
        }
    }

    // Edit Gallery Item (Admin only)
    window.editGalleryItem = function(id) {
        if (!isAdmin()) {
            alert('Admin access required. Please login as admin.');
            const adminLoginModal = document.getElementById('adminLoginModal');
            if (adminLoginModal) {
                adminLoginModal.classList.add('show');
            }
            return;
        }
        const gallery = getGallery();
        const item = gallery.find(i => i.id === id);
        if (item) {
            document.getElementById('formTitle').textContent = 'Edit Art';
            document.getElementById('artId').value = item.id;
            document.getElementById('artTitle').value = item.title;
            document.getElementById('artDescription').value = item.description || '';
            document.getElementById('artCategory').value = item.category;
            if (item.image) {
                artImagePreview.innerHTML = `<img src="${item.image}" alt="Preview">`;
            }
            artFormModal.classList.add('show');
        }
    };

    // Delete Gallery Item (Admin only)
    window.deleteGalleryItem = function(id) {
        if (!isAdmin()) {
            alert('Admin access required. Please login as admin.');
            const adminLoginModal = document.getElementById('adminLoginModal');
            if (adminLoginModal) {
                adminLoginModal.classList.add('show');
            }
            return;
        }
        if (confirm('Are you sure you want to delete this art item?')) {
            const gallery = getGallery();
            const filtered = gallery.filter(item => item.id !== id);
            saveGallery(filtered);
            loadGallery();
        }
    };

    // Close Art Form Modal
    window.closeArtFormModal = function() {
        artFormModal.classList.remove('show');
    };

    // Close modal on click outside
    if (artFormModal) {
        window.addEventListener('click', function(e) {
            if (e.target === artFormModal) {
                closeArtFormModal();
            }
        });
    }

    // Load gallery on page load
    loadGallery();
}

// ==================== Orders Management ====================

if (document.getElementById('ordersTableBody')) {
    const ordersTableBody = document.getElementById('ordersTableBody');
    const emptyOrders = document.getElementById('emptyOrders');
    const searchOrders = document.getElementById('searchOrders');
    const editOrderModal = document.getElementById('editOrderModal');
    const editOrderForm = document.getElementById('editOrderForm');

    // Load Orders
    function loadOrders(searchTerm = '') {
        let orders = getOrders();
        
        // Filter by search term
        if (searchTerm) {
            orders = orders.filter(order => 
                order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.phone.includes(searchTerm) ||
                order.id.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        ordersTableBody.innerHTML = '';

        if (orders.length === 0) {
            emptyOrders.style.display = 'block';
            document.getElementById('ordersTable').style.display = 'none';
        } else {
            emptyOrders.style.display = 'none';
            document.getElementById('ordersTable').style.display = 'table';

            orders.forEach(order => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${order.id}</td>
                    <td>${order.name}</td>
                    <td>${order.phone}</td>
                    <td>${order.sheetSize}</td>
                    <td>${order.artPosition}</td>
                    <td>₹${order.artPrize}</td>
                    <td><span class="status-badge status-${order.status.toLowerCase().replace(' ', '-')}">${order.status}</span></td>
                    <td>${formatDate(order.date)}</td>
                    <td>
                        <div class="table-actions">
                            <button class="btn-edit" onclick="editOrder('${order.id}')">Edit</button>
                            <button class="btn-delete" onclick="deleteOrder('${order.id}')">Delete</button>
                        </div>
                    </td>
                `;
                ordersTableBody.appendChild(row);
            });
        }
    }

    // Search Orders
    if (searchOrders) {
        searchOrders.addEventListener('input', function(e) {
            loadOrders(e.target.value);
        });
    }

    // Edit Order
    window.editOrder = function(id) {
        const orders = getOrders();
        const order = orders.find(o => o.id === id);
        if (order) {
            document.getElementById('editOrderId').value = order.id;
            document.getElementById('editName').value = order.name;
            document.getElementById('editGender').value = order.gender;
            document.getElementById('editPhone').value = order.phone;
            document.querySelector(`input[name="editSheetSize"][value="${order.sheetSize}"]`).checked = true;
            document.querySelector(`input[name="editArtPosition"][value="${order.artPosition}"]`).checked = true;
            document.getElementById('editStatus').value = order.status;
            editOrderModal.classList.add('show');
        }
    };

    // Edit Order Form Submission
    if (editOrderForm) {
        editOrderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const orderId = document.getElementById('editOrderId').value;
            const orders = getOrders();
            const orderIndex = orders.findIndex(o => o.id === orderId);
            
            if (orderIndex !== -1) {
                orders[orderIndex].name = document.getElementById('editName').value;
                orders[orderIndex].gender = document.getElementById('editGender').value;
                orders[orderIndex].phone = document.getElementById('editPhone').value;
                orders[orderIndex].sheetSize = document.querySelector('input[name="editSheetSize"]:checked').value;
                orders[orderIndex].artPosition = document.querySelector('input[name="editArtPosition"]:checked').value;
                orders[orderIndex].status = document.getElementById('editStatus').value;
                
                // Update price if position changed
                if (orders[orderIndex].artPosition === 'Portrait') {
                    orders[orderIndex].artPrize = 500;
                } else {
                    orders[orderIndex].artPrize = 800;
                }
                
                saveOrders(orders);
                loadOrders(searchOrders ? searchOrders.value : '');
                closeEditOrderModal();
            }
        });
    }

    // Delete Order
    window.deleteOrder = function(id) {
        if (confirm('Are you sure you want to delete this order?')) {
            const orders = getOrders();
            const filtered = orders.filter(order => order.id !== id);
            saveOrders(filtered);
            loadOrders(searchOrders ? searchOrders.value : '');
        }
    };

    // Close Edit Order Modal
    window.closeEditOrderModal = function() {
        editOrderModal.classList.remove('show');
    };

    // Close modal on click outside
    if (editOrderModal) {
        window.addEventListener('click', function(e) {
            if (e.target === editOrderModal) {
                closeEditOrderModal();
            }
        });
    }

    // Load orders on page load
    loadOrders();
}

// ==================== Signup ====================

if (document.getElementById('signupForm')) {
    const signupForm = document.getElementById('signupForm');
    const signupError = document.getElementById('signupError');
    
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('signupName').value;
        const gender = document.getElementById('signupGender').value;
        const age = parseInt(document.getElementById('signupAge').value);
        const username = document.getElementById('signupUsername').value;
        const password = document.getElementById('signupPassword').value;
        
        // Validation
        if (password.length < 6) {
            signupError.textContent = 'Password must be at least 6 characters';
            signupError.style.display = 'block';
            return;
        }
        
        // Check if username already exists
        const users = getUsers();
        if (users.find(u => u.username === username)) {
            signupError.textContent = 'Username already exists';
            signupError.style.display = 'block';
            return;
        }
        
        // Create new user
        const newUser = {
            id: generateId(),
            name,
            gender,
            age,
            username,
            password, // In production, hash this
            signupDate: new Date().toISOString()
        };
        
        users.push(newUser);
        saveUsers(users);
        
        // Redirect to login after signup
        alert('Account created successfully! Please login.');
        window.location.href = 'login.html';
    });
}

// ==================== User Login ====================

if (document.getElementById('loginForm')) {
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        
        const users = getUsers();
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            setCurrentUser(user);
            window.location.href = 'index.html';
        } else {
            loginError.textContent = 'Invalid username or password';
            loginError.style.display = 'block';
        }
    });
}

// ==================== Admin Login ====================

document.addEventListener('DOMContentLoaded', function() {
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const adminLoginModal = document.getElementById('adminLoginModal');
    const adminLoginForm = document.getElementById('adminLoginForm');
    
    // Open admin login modal
    if (adminLoginBtn) {
        adminLoginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (adminLoginModal) {
                adminLoginModal.classList.add('show');
            }
        });
    }
    
    // Admin login form submission
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('adminUsername').value;
            const password = document.getElementById('adminPassword').value;
            const errorDiv = document.getElementById('adminLoginError');
            
            if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
                setAdminStatus(true);
                setCurrentUser(null); // Clear user session
                errorDiv.style.display = 'none';
                adminLoginModal.classList.remove('show');
                adminLoginForm.reset();
                window.location.href = 'admin-dashboard.html';
            } else {
                errorDiv.textContent = 'Invalid username or password';
                errorDiv.style.display = 'block';
            }
        });
    }
    
    // Close admin login modal
    if (adminLoginModal) {
        const closeBtn = adminLoginModal.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                adminLoginModal.classList.remove('show');
            });
        }
        
        window.addEventListener('click', function(e) {
            if (e.target === adminLoginModal) {
                adminLoginModal.classList.remove('show');
            }
        });
    }
    
    // Logout buttons
    const logoutBtn = document.getElementById('logoutBtn');
    const adminLogoutBtn = document.getElementById('adminLogoutBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            setCurrentUser(null);
            window.location.href = 'login.html';
        });
    }
    
    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            setAdminStatus(false);
            setCurrentUser(null);
            window.location.href = 'login.html';
        });
    }
});

// ==================== Home Page Gallery Display ====================

if (document.getElementById('homeGalleryGrid')) {
    function loadHomeGallery() {
        const gallery = getGallery();
        const homeGalleryGrid = document.getElementById('homeGalleryGrid');
        const emptyHomeGallery = document.getElementById('emptyHomeGallery');
        
        homeGalleryGrid.innerHTML = '';
        
        // Show only first 6 items
        const displayItems = gallery.slice(0, 6);
        
        if (displayItems.length === 0) {
            emptyHomeGallery.style.display = 'block';
            homeGalleryGrid.style.display = 'none';
        } else {
            emptyHomeGallery.style.display = 'none';
            homeGalleryGrid.style.display = 'grid';
            
            displayItems.forEach(item => {
                const galleryItem = document.createElement('div');
                galleryItem.className = 'gallery-item';
                galleryItem.innerHTML = `
                    <img src="${item.image || 'https://via.placeholder.com/300'}" alt="${item.title}">
                    <div class="gallery-item-content">
                        <h3>${item.title}</h3>
                        <p>${item.description || ''}</p>
                    </div>
                `;
                homeGalleryGrid.appendChild(galleryItem);
            });
        }
    }
    
    loadHomeGallery();
}

// ==================== Gallery Admin Restriction ====================

if (document.getElementById('galleryGrid')) {
    // Check admin status on gallery page load
    if (!isAdmin()) {
        const addArtBtn = document.getElementById('addArtBtn');
        const galleryGrid = document.getElementById('galleryGrid');
        
        // Hide add button
        if (addArtBtn) {
            addArtBtn.style.display = 'none';
        }
        
        // Remove edit/delete buttons from gallery items
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(function() {
                const editButtons = document.querySelectorAll('.btn-edit');
                const deleteButtons = document.querySelectorAll('.btn-delete');
                
                editButtons.forEach(btn => btn.style.display = 'none');
                deleteButtons.forEach(btn => btn.style.display = 'none');
            }, 100);
        });
    }
    
    // Restrict form modal access
    const addArtBtn = document.getElementById('addArtBtn');
    if (addArtBtn) {
        addArtBtn.addEventListener('click', function(e) {
            if (!isAdmin()) {
                e.preventDefault();
                alert('Admin access required. Please login as admin.');
                const adminLoginModal = document.getElementById('adminLoginModal');
                if (adminLoginModal) {
                    adminLoginModal.classList.add('show');
                }
                return false;
            }
        });
    }
}

// ==================== Admin Dashboard ====================

if (window.location.pathname.includes('admin-dashboard.html')) {
    // Tab switching
    document.addEventListener('DOMContentLoaded', function() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const targetTab = this.getAttribute('data-tab');
                
                // Remove active class from all tabs and contents
                tabButtons.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding content
                this.classList.add('active');
                document.getElementById(targetTab + 'Tab').classList.add('active');
            });
        });
        
        // Orders Management Tab
        if (document.getElementById('ordersTab')) {
            const ordersTableBody = document.getElementById('ordersTableBody');
            const emptyOrders = document.getElementById('emptyOrders');
            const searchOrders = document.getElementById('searchOrders');
            
            function loadAdminOrders(searchTerm = '') {
                let orders = getOrders();
                
                if (searchTerm) {
                    orders = orders.filter(order => 
                        order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        order.phone.includes(searchTerm) ||
                        order.id.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                }
                
                ordersTableBody.innerHTML = '';
                
                if (orders.length === 0) {
                    emptyOrders.style.display = 'block';
                    document.getElementById('ordersTable').style.display = 'none';
                } else {
                    emptyOrders.style.display = 'none';
                    document.getElementById('ordersTable').style.display = 'table';
                    
                    orders.forEach(order => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${order.id}</td>
                            <td>${order.name || 'N/A'}</td>
                            <td>${order.phone || 'N/A'}</td>
                            <td>${order.sheetSize || 'N/A'}</td>
                            <td>${order.artPosition || 'N/A'}</td>
                            <td>${order.whichMembers || 'N/A'}</td>
                            <td>${order.frames || 'N/A'}</td>
                            <td>${formatDate(order.date)}</td>
                            <td>
                                <div class="table-actions">
                                    <button class="btn-edit" onclick="viewAdminOrder('${order.id}')">View Order</button>
                                    <button class="btn-delete" onclick="deleteAdminOrder('${order.id}')">Delete</button>
                                </div>
                            </td>
                        `;
                        ordersTableBody.appendChild(row);
                    });
                }
            }
            
            if (searchOrders) {
                searchOrders.addEventListener('input', function(e) {
                    loadAdminOrders(e.target.value);
                });
            }
            
            window.viewAdminOrder = function(id) {
                const orders = getOrders();
                const order = orders.find(o => o.id === id);
                if (order) {
                    const viewOrderContent = document.getElementById('viewOrderContent');
                    const viewOrderModal = document.getElementById('viewOrderModal');
                    
                    viewOrderContent.innerHTML = `
                        <div class="bill-header">
                            <h2>Phoenix Arts</h2>
                            <p>Order Details</p>
                        </div>
                        <div class="bill-details">
                            <div class="bill-detail-item">
                                <strong>Order ID:</strong>
                                <span>${order.id}</span>
                            </div>
                            <div class="bill-detail-item">
                                <strong>Date:</strong>
                                <span>${formatDate(order.date)}</span>
                            </div>
                            <div class="bill-detail-item">
                                <strong>Name:</strong>
                                <span>${order.name || 'N/A'}</span>
                            </div>
                            <div class="bill-detail-item">
                                <strong>Gender:</strong>
                                <span>${order.gender || 'N/A'}</span>
                            </div>
                            <div class="bill-detail-item">
                                <strong>Phone:</strong>
                                <span>${order.phone || 'N/A'}</span>
                            </div>
                            <div class="bill-detail-item">
                                <strong>Sheet Size:</strong>
                                <span>${order.sheetSize || 'N/A'}</span>
                            </div>
                            <div class="bill-detail-item">
                                <strong>Position:</strong>
                                <span>${order.artPosition || 'N/A'}</span>
                            </div>
                            <div class="bill-detail-item">
                                <strong>Which Members:</strong>
                                <span>${order.whichMembers || 'N/A'}</span>
                            </div>
                            <div class="bill-detail-item">
                                <strong>Frames:</strong>
                                <span>${order.frames || 'N/A'}</span>
                            </div>
                            <div class="bill-detail-item">
                                <strong>Status:</strong>
                                <span>${order.status || 'Submitted'}</span>
                            </div>
                        </div>
                        ${order.image ? `
                            <div class="bill-image">
                                <strong>Uploaded Image:</strong>
                                <img src="${order.image}" alt="Order Image" style="max-width: 100%; border-radius: 10px; margin-top: 1rem;">
                            </div>
                        ` : '<p style="color: var(--text-secondary); margin-top: 1rem;">No image uploaded</p>'}
                    `;
                    
                    viewOrderModal.classList.add('show');
                }
            };

            // Close view order modal
            const viewOrderModal = document.getElementById('viewOrderModal');
            if (viewOrderModal) {
                const closeBtn = viewOrderModal.querySelector('.close');
                if (closeBtn) {
                    closeBtn.addEventListener('click', function() {
                        viewOrderModal.classList.remove('show');
                    });
                }
                
                window.addEventListener('click', function(e) {
                    if (e.target === viewOrderModal) {
                        viewOrderModal.classList.remove('show');
                    }
                });
            }
            
            window.deleteAdminOrder = function(id) {
                if (confirm('Are you sure you want to delete this order?')) {
                    const orders = getOrders();
                    const filtered = orders.filter(order => order.id !== id);
                    saveOrders(filtered);
                    loadAdminOrders(searchOrders ? searchOrders.value : '');
                }
            };
            
            loadAdminOrders();
        }
        
        // Art Upload Tab
        if (document.getElementById('artTab')) {
            const artUploadForm = document.getElementById('artUploadForm');
            const artImageInput = document.getElementById('artImage');
            const artImagePreview = document.getElementById('artImagePreview');
            const adminGalleryGrid = document.getElementById('adminGalleryGrid');
            
            // Image preview
            if (artImageInput) {
                artImageInput.addEventListener('change', async function(e) {
                    const file = e.target.files[0];
                    if (file) {
                        const base64 = await imageToBase64(file);
                        artImagePreview.innerHTML = `<img src="${base64}" alt="Preview">`;
                    }
                });
            }
            
            // Art upload form
            if (artUploadForm) {
                artUploadForm.addEventListener('submit', async function(e) {
                    e.preventDefault();
                    
                    const formData = {
                        id: generateId(),
                        title: document.getElementById('artTitle').value,
                        description: document.getElementById('artDescription').value,
                        category: document.getElementById('artCategory').value,
                        date: new Date().toISOString()
                    };
                    
                    const imageFile = artImageInput.files[0];
                    if (imageFile) {
                        formData.image = await imageToBase64(imageFile);
                    }
                    
                    const gallery = getGallery();
                    gallery.push(formData);
                    saveGallery(gallery);
                    
                    artUploadForm.reset();
                    artImagePreview.innerHTML = '';
                    loadAdminGallery();
                    alert('Art uploaded successfully!');
                });
            }
            
            // Load admin gallery
            function loadAdminGallery() {
                const gallery = getGallery();
                if (adminGalleryGrid) {
                    adminGalleryGrid.innerHTML = '';
                    
                    gallery.forEach(item => {
                        const galleryItem = document.createElement('div');
                        galleryItem.className = 'gallery-item';
                        galleryItem.innerHTML = `
                            <img src="${item.image || 'https://via.placeholder.com/300'}" alt="${item.title}">
                            <div class="gallery-item-content">
                                <h3>${item.title}</h3>
                                <p>${item.description || ''}</p>
                                <p><strong>Category:</strong> ${item.category}</p>
                            </div>
                        `;
                        adminGalleryGrid.appendChild(galleryItem);
                    });
                }
            }
            
            loadAdminGallery();
        }
        
        // User Details Tab
        if (document.getElementById('usersTab')) {
            const usersTableBody = document.getElementById('usersTableBody');
            const emptyUsers = document.getElementById('emptyUsers');
            const searchUsers = document.getElementById('searchUsers');
            
            function loadUsers(searchTerm = '') {
                let users = getUsers();
                
                if (searchTerm) {
                    users = users.filter(user => 
                        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.username.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                }
                
                if (usersTableBody) {
                    usersTableBody.innerHTML = '';
                    
                    if (users.length === 0) {
                        emptyUsers.style.display = 'block';
                        document.getElementById('usersTable').style.display = 'none';
                    } else {
                        emptyUsers.style.display = 'none';
                        document.getElementById('usersTable').style.display = 'table';
                        
                        users.forEach(user => {
                            const row = document.createElement('tr');
                            row.innerHTML = `
                                <td>${user.username}</td>
                                <td>${user.name}</td>
                                <td>${user.gender}</td>
                                <td>${user.age}</td>
                                <td>${formatDate(user.signupDate)}</td>
                            `;
                            usersTableBody.appendChild(row);
                        });
                    }
                }
            }
            
            if (searchUsers) {
                searchUsers.addEventListener('input', function(e) {
                    loadUsers(e.target.value);
                });
            }
            
            loadUsers();
        }
        
    });
}

// ==================== Mobile Menu Toggle ====================

document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
        
        // Close menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    }
});

