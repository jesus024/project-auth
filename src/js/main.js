// API Configuration
const API_BASE_URL = 'http://localhost:3001';

// State Management
let currentUser = null;
let currentView = 'landing';

// DOM Elements
const views = {
  landing: document.getElementById('landing'),
  login: document.getElementById('login'),
  register: document.getElementById('register'),
  dashboard: document.getElementById('dashboard'),
  error404: document.getElementById('error-404')
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
  setupEventListeners();
  checkAuthStatus();
});

// Initialize the application
function initializeApp() {
  // Check if user is already logged in
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    showDashboard();
  } else {
    showLanding();
  }
}

// Setup all event listeners
function setupEventListeners() {
  // Landing page navigation
  document.getElementById('go-to-login').addEventListener('click', () => showLogin());
  document.getElementById('go-to-register').addEventListener('click', () => showRegister());
  document.getElementById('cta-login').addEventListener('click', () => showLogin());
  document.getElementById('cta-register').addEventListener('click', () => showRegister());

  // Login form
  document.getElementById('login-form').addEventListener('submit', handleLogin);
  document.getElementById('login-go-register').addEventListener('click', (e) => {
    e.preventDefault();
    showRegister();
  });
  document.getElementById('login-go-home').addEventListener('click', () => showLanding());

  // Register form
  document.getElementById('register-form').addEventListener('submit', handleRegister);
  document.getElementById('register-go-login').addEventListener('click', (e) => {
    e.preventDefault();
    showLogin();
  });
  document.getElementById('register-go-home').addEventListener('click', () => showLanding());

  // Dashboard navigation
  document.getElementById('logout-btn').addEventListener('click', handleLogout);

  // Customer dashboard
  document.getElementById('add-pet-btn').addEventListener('click', () => showPetModal());

  // Worker dashboard tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.target.dataset.tab;
      switchTab(tab);
    });
  });

  // Worker dashboard actions
  document.getElementById('add-stay-btn').addEventListener('click', () => showStayModal());

  // Modal forms
  document.getElementById('pet-form').addEventListener('submit', handlePetSubmit);
  document.getElementById('cancel-pet-form').addEventListener('click', () => hidePetModal());
  document.getElementById('stay-form').addEventListener('submit', handleStaySubmit);
  document.getElementById('cancel-stay-form').addEventListener('click', () => hideStayModal());

  // Error page navigation
  document.getElementById('go-home').addEventListener('click', () => showLanding());
  document.getElementById('go-back').addEventListener('click', () => window.history.back());

  // Close modals when clicking outside
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });
  });
}

// Navigation Functions
function showView(viewName) {
  // Hide all views
  Object.values(views).forEach(view => {
    if (view) view.classList.add('hidden');
  });

  // Show the requested view
  if (views[viewName]) {
    views[viewName].classList.remove('hidden');
    currentView = viewName;
  } else {
    showError404();
  }
}

function showLanding() {
  showView('landing');
}

function showLogin() {
  showView('login');
  document.getElementById('login-form').reset();
}

function showRegister() {
  showView('register');
  document.getElementById('register-form').reset();
}

function showDashboard() {
  showView('dashboard');
  if (currentUser) {
    document.getElementById('dashboard-title').textContent = `Welcome, ${currentUser.nombre}`;
    
    if (currentUser.rolId === 1) { // Worker
      showWorkerDashboard();
    } else { // Customer
      showCustomerDashboard();
    }
  }
}

function showError404() {
  showView('error404');
}

// Dashboard Management
function showCustomerDashboard() {
  document.getElementById('customer-dashboard').classList.remove('hidden');
  document.getElementById('worker-dashboard').classList.add('hidden');
  loadCustomerPets();
}

function showWorkerDashboard() {
  document.getElementById('worker-dashboard').classList.remove('hidden');
  document.getElementById('customer-dashboard').classList.add('hidden');
  loadAllPets();
  loadAllUsers();
  loadAllStays();
}

function switchTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  document.getElementById(`${tabName}-tab`).classList.add('active');
}

// Authentication Functions
async function handleLogin(e) {
  e.preventDefault();
  
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value.trim();

  if (!username || !password) {
    showMessage('Please complete all fields', 'error');
    return;
  }

  try {
    // Try to find user by email or identity
    const users = await fetch(`${API_BASE_URL}/users?email=${username}`).then(r => r.json());
    const userByIdentity = await fetch(`${API_BASE_URL}/users?identidad=${username}`).then(r => r.json());
    
    const user = users.find(u => u.email === username) || userByIdentity.find(u => u.identidad === username);

    if (!user) {
      showMessage('User not found', 'error');
      return;
    }

    if (user.contrasena !== password) {
      showMessage('Incorrect password', 'error');
      return;
    }

    // Get user role
    const role = await fetch(`${API_BASE_URL}/roles/${user.rolId}`).then(r => r.json());
    
    currentUser = { ...user, role: role.name };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    showMessage(`Welcome, ${user.nombre}!`, 'success');
    setTimeout(() => showDashboard(), 1000);

  } catch (error) {
    console.error('Login error:', error);
    showMessage('Login error', 'error');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  
  const formData = {
    nombre: document.getElementById('register-nombre').value.trim(),
    identidad: document.getElementById('register-identidad').value.trim(),
    telefono: document.getElementById('register-telefono').value.trim(),
    direccion: document.getElementById('register-direccion').value.trim(),
    email: document.getElementById('register-email').value.trim(),
    contrasena: document.getElementById('register-password').value.trim(),
    rolId: 2 // Customer role
  };

  // Validate all fields
  for (const [key, value] of Object.entries(formData)) {
    if (!value) {
      showMessage('Please complete all fields', 'error');
      return;
    }
  }

  try {
    // Check if user already exists
    const existingUsers = await fetch(`${API_BASE_URL}/users?email=${formData.email}`).then(r => r.json());
    if (existingUsers.length > 0) {
      showMessage('El email ya está registrado', 'error');
      return;
    }

    const existingIdentity = await fetch(`${API_BASE_URL}/users?identidad=${formData.identidad}`).then(r => r.json());
    if (existingIdentity.length > 0) {
      showMessage('El número de identidad ya está registrado', 'error');
      return;
    }

    // Create new user
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      showMessage('Usuario registrado exitosamente. Ahora puedes iniciar sesión.', 'success');
      setTimeout(() => showLogin(), 2000);
    } else {
      showMessage('Error registering user', 'error');
    }

  } catch (error) {
    console.error('Register error:', error);
    showMessage('Error registering user', 'error');
  }
}

function handleLogout() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  showLanding();
}

function checkAuthStatus() {
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
  }
}

// API Functions
async function loadCustomerPets() {
  if (!currentUser) return;

  try {
    const response = await fetch(`${API_BASE_URL}/pets?userId=${currentUser.id}`);
    const pets = await response.json();
    displayPets(pets, 'pets-container');
  } catch (error) {
    console.error('Error loading pets:', error);
    showMessage('Error loading pets', 'error');
  }
}

async function loadAllPets() {
  try {
    const response = await fetch(`${API_BASE_URL}/pets`);
    const pets = await response.json();
    
    // Get user information for each pet
    const petsWithUsers = await Promise.all(pets.map(async (pet) => {
      const userResponse = await fetch(`${API_BASE_URL}/users/${pet.userId}`);
      const user = await userResponse.json();
      return { ...pet, owner: user };
    }));
    
    displayAllPets(petsWithUsers);
  } catch (error) {
    console.error('Error loading all pets:', error);
    showMessage('Error loading pets', 'error');
  }
}

async function loadAllUsers() {
  try {
    const response = await fetch(`${API_BASE_URL}/users`);
    const users = await response.json();
    
    // Get role information for each user
    const usersWithRoles = await Promise.all(users.map(async (user) => {
      const roleResponse = await fetch(`${API_BASE_URL}/roles/${user.rolId}`);
      const role = await roleResponse.json();
      return { ...user, role: role.name };
    }));
    
    displayUsers(usersWithRoles);
  } catch (error) {
    console.error('Error loading users:', error);
    showMessage('Error loading users', 'error');
  }
}

async function loadAllStays() {
  try {
    const response = await fetch(`${API_BASE_URL}/stays`);
    const stays = await response.json();
    
    // Get pet and user information for each stay
    const staysWithDetails = await Promise.all(stays.map(async (stay) => {
      const petResponse = await fetch(`${API_BASE_URL}/pets/${stay.petId}`);
      const pet = await petResponse.json();
      const userResponse = await fetch(`${API_BASE_URL}/users/${pet.userId}`);
      const user = await userResponse.json();
      return { ...stay, pet, owner: user };
    }));
    
    displayStays(staysWithDetails);
  } catch (error) {
    console.error('Error loading stays:', error);
    showMessage('Error loading stays', 'error');
  }
}

// Display Functions
function displayPets(pets, containerId) {
  const container = document.getElementById(containerId);
  
  if (pets.length === 0) {
    container.innerHTML = '<p class="no-data">You have no registered pets</p>';
    return;
  }

  container.innerHTML = pets.map(pet => `
    <div class="pet-card" data-pet-id="${pet.id}">
      <img src="https://cdn.pixabay.com/photo/2017/09/25/13/12/dog-2785074_1280.jpg" alt="Foto de ${pet.nombre}" />
      <h3>${pet.nombre}</h3>
      <p><strong>Breed:</strong> ${pet.raza}</p>
      <p><strong>Age:</strong> ${pet.edad} years</p>
      <p><strong>Weight:</strong> ${pet.peso} kg</p>
      <p><strong>Temperament:</strong> ${pet.temperamento}</p>
      ${pet.anotaciones ? `<p><strong>Notes:</strong> ${pet.anotaciones}</p>` : ''}
      <div class="card-buttons">
        <button class="edit-btn btn-primary" onclick="editPet(${pet.id})">Edit</button>
        <button class="delete-btn btn-danger" onclick="deletePet(${pet.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

function displayAllPets(pets) {
  const container = document.getElementById('all-pets-container');
  
  if (pets.length === 0) {
    container.innerHTML = '<p class="no-data">No pets registered</p>';
    return;
  }

  container.innerHTML = pets.map(pet => `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">${pet.nombre}</h3>
      </div>
      <div class="card-content">
        <div class="card-field">
          <strong>Breed:</strong>
          <span>${pet.raza}</span>
        </div>
        <div class="card-field">
          <strong>Age:</strong>
          <span>${pet.edad} years</span>
        </div>
        <div class="card-field">
          <strong>Weight:</strong>
          <span>${pet.peso} kg</span>
        </div>
        <div class="card-field">
          <strong>Temperament:</strong>
          <span>${pet.temperamento}</span>
        </div>
        <div class="card-field">
          <strong>Owner:</strong>
          <span>${pet.owner.nombre}</span>
        </div>
        ${pet.anotaciones ? `
        <div class="card-field">
          <strong>Notes:</strong>
          <span>${pet.anotaciones}</span>
        </div>
        ` : ''}
      </div>
    </div>
  `).join('');
}

function displayUsers(users) {
  const container = document.getElementById('users-container');
  
  if (users.length === 0) {
    container.innerHTML = '<p class="no-data">No users registered</p>';
    return;
  }

  container.innerHTML = users.map(user => `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">${user.nombre}</h3>
        <span class="card-status ${user.role === 'worker' ? 'status-active' : 'status-completed'}">${user.role === 'worker' ? 'Worker' : 'Customer'}</span>
      </div>
      <div class="card-content">
        <div class="card-field">
          <strong>Email:</strong>
          <span>${user.email}</span>
        </div>
        <div class="card-field">
          <strong>Phone:</strong>
          <span>${user.telefono}</span>
        </div>
        <div class="card-field">
          <strong>Identity:</strong>
          <span>${user.identidad}</span>
        </div>
        <div class="card-field">
          <strong>Address:</strong>
          <span>${user.direccion}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function displayStays(stays) {
  const container = document.getElementById('stays-container');
  
  if (stays.length === 0) {
    container.innerHTML = '<p class="no-data">No stays registered</p>';
    return;
  }

  container.innerHTML = stays.map(stay => {
    const totalValue = calculateStayValue(stay.ingreso, stay.salida, stay.valorDia);
    const statusClass = stay.completada ? 'status-completed' : 'status-active';
    const statusText = stay.completada ? 'Completed' : 'Active';
    
    return `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Stay for ${stay.pet.nombre}</h3>
          <span class="card-status ${statusClass}">${statusText}</span>
        </div>
        <div class="card-content">
          <div class="card-field">
            <strong>Pet:</strong>
            <span>${stay.pet.nombre} (${stay.pet.raza})</span>
          </div>
          <div class="card-field">
            <strong>Owner:</strong>
            <span>${stay.owner.nombre}</span>
          </div>
          <div class="card-field">
            <strong>Check-in:</strong>
            <span>${formatDate(stay.ingreso)}</span>
          </div>
          <div class="card-field">
            <strong>Check-out:</strong>
            <span>${formatDate(stay.salida)}</span>
          </div>
          <div class="card-field">
            <strong>Daily rate:</strong>
            <span>$${stay.valorDia.toLocaleString()}</span>
          </div>
          <div class="card-field">
            <strong>Total value:</strong>
            <span>$${totalValue.toLocaleString()}</span>
          </div>
          ${stay.serviciosAdicionales.length > 0 ? `
          <div class="card-field">
            <strong>Services:</strong>
            <span>${stay.serviciosAdicionales.join(', ')}</span>
          </div>
          ` : ''}
        </div>
        <div class="card-actions">
          ${!stay.completada ? `
            <button class="btn-success" onclick="completeStay(${stay.id})">Complete</button>
          ` : ''}
          <button class="btn-primary" onclick="editStay(${stay.id})">Edit</button>
          <button class="btn-danger" onclick="deleteStay(${stay.id})">Delete</button>
        </div>
      </div>
    `;
  }).join('');
}

// Modal Functions
function showPetModal(petId = null) {
  const modal = document.getElementById('pet-form-modal');
  const title = document.getElementById('pet-form-title');
  const form = document.getElementById('pet-form');
  
  // Add hidden field for edit mode if it doesn't exist
  let editIdField = document.getElementById('pet-edit-id');
  if (!editIdField) {
    editIdField = document.createElement('input');
    editIdField.type = 'hidden';
    editIdField.id = 'pet-edit-id';
    form.appendChild(editIdField);
  }
  
  if (petId) {
    title.textContent = 'Edit Pet';
    editIdField.value = petId;
  } else {
    title.textContent = 'Add New Pet';
    form.reset();
    editIdField.value = '';
  }
  
  modal.classList.remove('hidden');
}

function hidePetModal() {
  document.getElementById('pet-form-modal').classList.add('hidden');
}

function showStayModal(stayId = null) {
  const modal = document.getElementById('stay-form-modal');
  const title = document.getElementById('stay-form-title');
  const form = document.getElementById('stay-form');
  
  // Add hidden field for edit mode if it doesn't exist
  let editIdField = document.getElementById('stay-edit-id');
  if (!editIdField) {
    editIdField = document.createElement('input');
    editIdField.type = 'hidden';
    editIdField.id = 'stay-edit-id';
    form.appendChild(editIdField);
  }
  
  if (stayId) {
    title.textContent = 'Edit Stay';
    editIdField.value = stayId;
  } else {
    title.textContent = 'New Stay';
    form.reset();
    editIdField.value = '';
    loadPetsForStay();
  }
  
  modal.classList.remove('hidden');
}

function hideStayModal() {
  document.getElementById('stay-form-modal').classList.add('hidden');
}

// Form Handlers
async function handlePetSubmit(e) {
  e.preventDefault();
  
  const editId = document.getElementById('pet-edit-id').value;
  const formData = {
    nombre: document.getElementById('pet-nombre').value.trim(),
    peso: parseFloat(document.getElementById('pet-peso').value),
    edad: parseInt(document.getElementById('pet-edad').value),
    raza: document.getElementById('pet-raza').value.trim(),
    anotaciones: document.getElementById('pet-anotaciones').value.trim(),
    temperamento: document.getElementById('pet-temperamento').value,
    userId: currentUser.id
  };

  try {
    const url = editId ? `${API_BASE_URL}/pets/${editId}` : `${API_BASE_URL}/pets`;
    const method = editId ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      const message = editId ? 'Pet updated successfully' : 'Pet registered successfully';
      showMessage(message, 'success');
      hidePetModal();
      loadCustomerPets();
    } else {
      const message = editId ? 'Error updating pet' : 'Error registering pet';
      showMessage(message, 'error');
    }
  } catch (error) {
    console.error('Error saving pet:', error);
    const message = editId ? 'Error updating pet' : 'Error registering pet';
    showMessage(message, 'error');
  }
}

async function handleStaySubmit(e) {
  e.preventDefault();
  
  const editId = document.getElementById('stay-edit-id').value;
  const selectedServices = Array.from(document.querySelectorAll('.services-checkboxes input:checked'))
    .map(checkbox => checkbox.value);
  
  const formData = {
    petId: parseInt(document.getElementById('stay-pet-id').value),
    ingreso: document.getElementById('stay-ingreso').value,
    salida: document.getElementById('stay-salida').value,
    valorDia: parseInt(document.getElementById('stay-valor-dia').value),
    serviciosAdicionales: selectedServices,
    completada: false
  };

  try {
    const url = editId ? `${API_BASE_URL}/stays/${editId}` : `${API_BASE_URL}/stays`;
    const method = editId ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      const message = editId ? 'Stay updated successfully' : 'Stay registered successfully';
      showMessage(message, 'success');
      hideStayModal();
      loadAllStays();
    } else {
      const message = editId ? 'Error updating stay' : 'Error registering stay';
      showMessage(message, 'error');
    }
  } catch (error) {
    console.error('Error saving stay:', error);
    const message = editId ? 'Error updating stay' : 'Error registering stay';
    showMessage(message, 'error');
  }
}

// Utility Functions
function calculateStayValue(ingreso, salida, valorDia) {
  const startDate = new Date(ingreso);
  const endDate = new Date(salida);
  const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  return days * valorDia;
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US');
}

function showMessage(message, type = 'info') {
  // Create a simple message display
  const messageDiv = document.createElement('div');
  messageDiv.className = `message message-${type}`;
  messageDiv.textContent = message;
  messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 5px;
    color: white;
    font-weight: bold;
    z-index: 10000;
    background-color: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
  `;
  
  document.body.appendChild(messageDiv);
  
  setTimeout(() => {
    messageDiv.remove();
  }, 3000);
}

// Action Functions
async function editPet(petId) {
  try {
    const response = await fetch(`${API_BASE_URL}/pets/${petId}`);
    if (response.ok) {
      const pet = await response.json();
      showPetModal(petId);
      // Load the pet data after the modal is shown
      setTimeout(() => loadPetData(pet), 100);
    } else {
      showMessage('Error loading pet data', 'error');
    }
  } catch (error) {
    console.error('Error loading pet data:', error);
    showMessage('Error loading pet data', 'error');
  }
}

async function deletePet(petId) {
  if (confirm('Are you sure you want to delete this pet?')) {
    try {
      const response = await fetch(`${API_BASE_URL}/pets/${petId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        showMessage('Pet deleted successfully', 'success');
        loadCustomerPets();
      } else {
        showMessage('Error deleting pet', 'error');
      }
    } catch (error) {
      console.error('Error deleting pet:', error);
      showMessage('Error deleting pet', 'error');
    }
  }
}

async function editStay(stayId) {
  try {
    const response = await fetch(`${API_BASE_URL}/stays/${stayId}`);
    if (response.ok) {
      const stay = await response.json();
      showStayModal(stayId);
      // Load the stay data after the modal is shown
      setTimeout(() => loadStayData(stay), 100);
    } else {
      showMessage('Error loading stay data', 'error');
    }
  } catch (error) {
    console.error('Error loading stay data:', error);
    showMessage('Error loading stay data', 'error');
  }
}

async function deleteStay(stayId) {
  if (confirm('Are you sure you want to delete this stay?')) {
    try {
      const response = await fetch(`${API_BASE_URL}/stays/${stayId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        showMessage('Stay deleted successfully', 'success');
        loadAllStays();
      } else {
        showMessage('Error deleting stay', 'error');
      }
    } catch (error) {
      console.error('Error deleting stay:', error);
      showMessage('Error deleting stay', 'error');
    }
  }
}

async function completeStay(stayId) {
  try {
    const response = await fetch(`${API_BASE_URL}/stays/${stayId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ completada: true })
    });
    
    if (response.ok) {
      showMessage('Stay completed successfully', 'success');
      loadAllStays();
    } else {
      showMessage('Error completing stay', 'error');
    }
  } catch (error) {
    console.error('Error completing stay:', error);
    showMessage('Error completing stay', 'error');
  }
}

async function loadPetsForStay() {
  try {
    const response = await fetch(`${API_BASE_URL}/pets`);
    const pets = await response.json();
    
    const select = document.getElementById('stay-pet-id');
    select.innerHTML = '<option value="">Select pet</option>';
    
    pets.forEach(pet => {
      const option = document.createElement('option');
      option.value = pet.id;
      option.textContent = `${pet.nombre} (${pet.raza})`;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading pets for stay:', error);
  }
}

// Load pet data into form for editing
function loadPetData(pet) {
  document.getElementById('pet-nombre').value = pet.nombre || '';
  document.getElementById('pet-peso').value = pet.peso || '';
  document.getElementById('pet-edad').value = pet.edad || '';
  document.getElementById('pet-raza').value = pet.raza || '';
  document.getElementById('pet-anotaciones').value = pet.anotaciones || '';
  document.getElementById('pet-temperamento').value = pet.temperamento || 'Calm';
}

// Load stay data into form for editing
function loadStayData(stay) {
  document.getElementById('stay-pet-id').value = stay.petId || '';
  document.getElementById('stay-ingreso').value = stay.ingreso || '';
  document.getElementById('stay-salida').value = stay.salida || '';
  document.getElementById('stay-valor-dia').value = stay.valorDia || '';
  
  // Load pets for the select dropdown
  loadPetsForStay().then(() => {
    document.getElementById('stay-pet-id').value = stay.petId || '';
  });
  
  // Check the services that were selected
  const serviceCheckboxes = document.querySelectorAll('.services-checkboxes input[type="checkbox"]');
  serviceCheckboxes.forEach(checkbox => {
    checkbox.checked = stay.serviciosAdicionales && stay.serviciosAdicionales.includes(checkbox.value);
  });
}

// Make functions globally available for onclick handlers
window.editPet = editPet;
window.deletePet = deletePet;
window.editStay = editStay;
window.deleteStay = deleteStay;
window.completeStay = completeStay;
