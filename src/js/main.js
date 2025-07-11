// API Configuration
const API_BASE_URL = 'http://localhost:3001';

// Global state
let currentUser = null;
let editingPet = null;
let editingStay = null;

console.log('PetCare Center SPA - JavaScript loaded correctly');

// DOM Elements
const views = {
  landing: document.getElementById('landing'),
  login: document.getElementById('login'),
  register: document.getElementById('register'),
  dashboard: document.getElementById('dashboard'),
  notFound: document.getElementById('not-found')
};

// Check that all elements exist
console.log('Checking DOM elements:');
Object.entries(views).forEach(([name, element]) => {
  console.log(`${name}:`, element ? ' Found' : ' Not found');
});

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
  setupEventListeners();
  setupRouting();
  checkAuthStatus();
});

// Initialize the application
function initializeApp() {
  console.log('Initializing application...');
  // Check if user is already logged in
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    console.log('User found in localStorage:', currentUser);
  } else {
    console.log('No user in localStorage');
  }
  // The routing system will handle which view to show
}

// Setup all event listeners
function setupEventListeners() {
  console.log('Setting up event listeners...');
  // Landing page navigation
  document.getElementById('go-to-login').addEventListener('click', () => showLogin());
  document.getElementById('go-to-register').addEventListener('click', () => showRegister());
  document.getElementById('cta-login').addEventListener('click', () => showLogin());
  document.getElementById('cta-register').addEventListener('click', () => showRegister());

  // Login form
  const loginForm = document.getElementById('login-form');
  console.log('Login form found:', loginForm);
  loginForm.addEventListener('submit', handleLogin);
  document.getElementById('login-go-register').addEventListener('click', (e) => {
    e.preventDefault();
    showRegister();
  });
  document.getElementById('login-go-landing').addEventListener('click', (e) => {
    e.preventDefault();
    showLanding();
  });

  // Register form
  document.getElementById('register-form').addEventListener('submit', handleRegister);
  document.getElementById('register-go-login').addEventListener('click', (e) => {
    e.preventDefault();
    showLogin();
  });
  document.getElementById('register-go-landing').addEventListener('click', (e) => {
    e.preventDefault();
    showLanding();
  });

  // Dashboard actions
  document.getElementById('logout-btn').addEventListener('click', handleLogout);
  document.getElementById('add-pet-btn').addEventListener('click', () => showPetModal());
  document.getElementById('add-stay-btn').addEventListener('click', () => showStayModal());

  // Modal actions
  document.getElementById('cancel-pet').addEventListener('click', () => hidePetModal());
  document.getElementById('cancel-stay').addEventListener('click', () => hideStayModal());
  document.getElementById('pet-form').addEventListener('submit', handlePetSubmit);
  document.getElementById('stay-form').addEventListener('submit', handleStaySubmit);

  // Dashboard tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.target.dataset.tab;
      switchTab(tab);
    });
  });

  // 404 page
  document.getElementById('go-home').addEventListener('click', () => showLanding());

  // Close modals when clicking outside
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });
  });
}

// Setup routing
function setupRouting() {
  console.log('Setting up routing system...');
  // Handle browser back/forward buttons
  window.addEventListener('popstate', (e) => {
    console.log('Navigation detected:', window.location.pathname);
    handleRoute(window.location.pathname);
  });
  // Handle initial route
  handleRoute(window.location.pathname);
}

function handleRoute(pathname) {
  console.log('Handling route:', pathname);
  // Handle root path
  if (pathname === '/' || pathname === '') {
    if (currentUser) {
      showDashboard();
    } else {
      showLanding();
    }
    return;
  }
  switch (pathname) {
    case '/landing':
      showLanding();
      break;
    case '/login':
      showLogin();
      break;
    case '/register':
      showRegister();
      break;
    case '/dashboard':
      if (currentUser) {
        showDashboard();
      } else {
        showLogin();
      }
      break;
    default:
      showNotFound();
      break;
  }
}

// Navigation functions
function showView(viewId) {
  // Hide all views
  Object.values(views).forEach(view => {
    view.classList.remove('active');
  });
  // Show only the selected view
  views[viewId].classList.add('active');
}

function showLanding() {
  showView('landing');
  updateURL('/landing');
}

function showLogin() {
  showView('login');
  document.getElementById('login-form').reset();
  updateURL('/login');
}

function showRegister() {
  showView('register');
  document.getElementById('register-form').reset();
  updateURL('/register');
}

function showDashboard() {
  console.log('Showing dashboard...');
  showView('dashboard');
  console.log('Dashboard view activated, loading data...');
  loadDashboard();
  updateURL('/dashboard');
}

function showNotFound() {
  showView('notFound');
  updateURL('/404');
}

// Authentication functions
async function handleLogin(e) {
  e.preventDefault();
  
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;

  console.log('Attempting login with:', { username, password });

  try {
    // Get all users and search by email or identity
    const response = await fetch(`${API_BASE_URL}/users`);
    const users = await response.json();
    
    console.log('Users found:', users.length);
    
    const user = users.find(u => 
      (u.email === username || u.identidad === username) && u.contrasena === password
    );

    console.log('User found:', user);

    if (user) {
      // Get user role
      const roleResponse = await fetch(`${API_BASE_URL}/roles/${user.rolId}`);
      const role = await roleResponse.json();
      
      currentUser = { ...user, role: role.name };
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      
      console.log('Login successful:', currentUser);
      showDashboard();
    } else {
      console.log('Incorrect credentials');
      alert('Incorrect credentials');
    }
  } catch (error) {
    console.error('Error during login:', error);
    alert('Error logging in');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  
  const userData = {
    nombre: document.getElementById('register-nombre').value.trim(),
    identidad: document.getElementById('register-identidad').value.trim(),
    telefono: document.getElementById('register-telefono').value.trim(),
    direccion: document.getElementById('register-direccion').value.trim(),
    email: document.getElementById('register-email').value.trim(),
    contrasena: document.getElementById('register-contrasena').value,
    rolId: 2 // Customer role
  };

  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    if (response.ok) {
      alert('User registered successfully. You can now log in.');
      showLogin();
    } else {
      alert('Error registering user');
    }
  } catch (error) {
    console.error('Error during registration:', error);
    alert('Error registering user');
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
    showDashboard();
  }
}

// Dashboard functions
async function loadDashboard() {
  console.log('Loading dashboard for user:', currentUser);
  
  if (!currentUser) {
    console.log('No current user, returning');
    return;
  }

  console.log('Setting dashboard title...');
  document.getElementById('dashboard-title').textContent = `Welcome, ${currentUser.nombre}`;

  if (currentUser.role === 'customer') {
    console.log('Showing customer dashboard');
    showCustomerDashboard();
  } else if (currentUser.role === 'worker') {
    console.log('Showing worker dashboard');
    showWorkerDashboard();
  } else {
    console.log('Unknown role:', currentUser.role);
  }
}

function showCustomerDashboard() {
  document.getElementById('customer-dashboard').classList.remove('hidden');
  document.getElementById('worker-dashboard').classList.add('hidden');
  document.getElementById('add-pet-btn').classList.remove('hidden');
  document.getElementById('add-stay-btn').classList.add('hidden');
  
  loadCustomerPets();
}

function showWorkerDashboard() {
  console.log('Configuring worker dashboard...');
  
  document.getElementById('customer-dashboard').classList.add('hidden');
  document.getElementById('worker-dashboard').classList.remove('hidden');
  document.getElementById('add-pet-btn').classList.add('hidden');
  document.getElementById('add-stay-btn').classList.remove('hidden');
  
  console.log('Loading worker data...');
  loadAllPets();
  loadAllUsers();
  loadAllStays();
  
  // Verify dashboard is visible
  setTimeout(() => {
    const dashboard = document.getElementById('dashboard');
    const workerDashboard = document.getElementById('worker-dashboard');
    console.log('Main dashboard:', dashboard);
    console.log('Worker dashboard:', workerDashboard);
    console.log('Main dashboard visible:', window.getComputedStyle(dashboard).display !== 'none');
    console.log('Worker dashboard visible:', window.getComputedStyle(workerDashboard).display !== 'none');
    console.log('Worker dashboard hidden:', workerDashboard.classList.contains('hidden'));
  }, 1000);
}

// Tab switching
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

// Pet functions
async function loadCustomerPets() {
  try {
    const response = await fetch(`${API_BASE_URL}/pets?userId=${currentUser.id}`);
    const pets = await response.json();
    displayPets(pets, 'customer-pets');
  } catch (error) {
    console.error('Error loading customer pets:', error);
  }
}

async function loadAllPets() {
  try {
    const response = await fetch(`${API_BASE_URL}/pets`);
    const pets = await response.json();
    displayPets(pets, 'all-pets');
  } catch (error) {
    console.error('Error loading all pets:', error);
  }
}

function displayPets(pets, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  if (pets.length === 0) {
    container.innerHTML = '<p>No pets registered</p>';
    return;
  }

  pets.forEach(pet => {
    const petCard = document.createElement('div');
    petCard.className = 'pet-card';
    petCard.innerHTML = `
      <h3>${pet.nombre}</h3>
      <p><strong>Weight:</strong> ${pet.peso} kg</p>
      <p><strong>Age:</strong> ${pet.edad} years</p>
      <p><strong>Breed:</strong> ${pet.raza}</p>
      <p><strong>Temperament:</strong> ${pet.temperamento}</p>
      ${pet.anotaciones ? `<p><strong>Notes:</strong> ${pet.anotaciones}</p>` : ''}
      <div class="card-actions">
        <button class="edit-btn" data-pet-id="${pet.id}">Edit</button>
        <button class="delete-btn" data-pet-id="${pet.id}">Delete</button>
      </div>
    `;
    container.appendChild(petCard);
  });

  // Add event listeners to buttons
  container.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const petId = parseInt(e.target.dataset.petId);
      editPet(petId);
    });
  });

  container.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const petId = parseInt(e.target.dataset.petId);
      deletePet(petId);
    });
  });
}

function showPetModal(pet = null) {
  editingPet = pet;
  const modal = document.getElementById('pet-modal');
  const title = document.getElementById('pet-modal-title');
  const form = document.getElementById('pet-form');

  if (pet) {
    title.textContent = 'Edit Pet';
    form['pet-nombre'].value = pet.nombre;
    form['pet-peso'].value = pet.peso;
    form['pet-edad'].value = pet.edad;
    form['pet-raza'].value = pet.raza;
    form['pet-temperamento'].value = pet.temperamento;
    form['pet-anotaciones'].value = pet.anotaciones || '';
  } else {
    title.textContent = 'Add Pet';
    form.reset();
  }

  modal.classList.remove('hidden');
}

function hidePetModal() {
  document.getElementById('pet-modal').classList.add('hidden');
  editingPet = null;
}

async function handlePetSubmit(e) {
  e.preventDefault();

  const petData = {
    nombre: document.getElementById('pet-nombre').value.trim(),
    peso: parseFloat(document.getElementById('pet-peso').value),
    edad: parseInt(document.getElementById('pet-edad').value),
    raza: document.getElementById('pet-raza').value.trim(),
    temperamento: document.getElementById('pet-temperamento').value.trim(),
    anotaciones: document.getElementById('pet-anotaciones').value.trim(),
    userId: currentUser.id
  };

  console.log('Saving pet:', petData);

  try {
    const url = editingPet 
      ? `${API_BASE_URL}/pets/${editingPet.id}`
      : `${API_BASE_URL}/pets`;
    
    const method = editingPet ? 'PATCH' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(petData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Pet saved successfully:', result);
      alert(editingPet ? 'Pet updated successfully' : 'Pet created successfully');
      hidePetModal();
      loadDashboard();
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error saving pet:', error);
    alert('Error saving pet: ' + error.message);
  }
}

async function editPet(petId) {
  console.log('Editing pet with ID:', petId);
  try {
    const response = await fetch(`${API_BASE_URL}/pets/${petId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const pet = await response.json();
    console.log('Pet loaded for editing:', pet);
    showPetModal(pet);
  } catch (error) {
    console.error('Error loading pet:', error);
    alert('Error loading pet: ' + error.message);
  }
}

async function deletePet(petId) {
  console.log('Deleting pet with ID:', petId);
  
  if (!confirm('Are you sure you want to delete this pet?')) return;

  try {
    // Check if pet has stays
    const staysResponse = await fetch(`${API_BASE_URL}/stays?petId=${petId}`);
    if (!staysResponse.ok) {
      throw new Error(`Error checking stays: ${staysResponse.status}`);
    }
    const stays = await staysResponse.json();
    
    if (stays.length > 0) {
      alert('Cannot delete a pet that has registered stays');
      return;
    }

    const response = await fetch(`${API_BASE_URL}/pets/${petId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      console.log('Pet deleted successfully');
      alert('Pet deleted successfully');
      loadDashboard();
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting pet:', error);
    alert('Error deleting pet: ' + error.message);
  }
}

// User functions (for workers)
async function loadAllUsers() {
  try {
    const response = await fetch(`${API_BASE_URL}/users`);
    const users = await response.json();
    displayUsers(users);
  } catch (error) {
    console.error('Error loading users:', error);
  }
}

function displayUsers(users) {
  const container = document.getElementById('all-users');
  container.innerHTML = '';

  if (users.length === 0) {
    container.innerHTML = '<p>No users registered</p>';
    return;
  }

  users.forEach(user => {
    const userCard = document.createElement('div');
    userCard.className = 'user-card';
    userCard.innerHTML = `
      <h3>${user.nombre}</h3>
      <p><strong>Identity:</strong> ${user.identidad}</p>
      <p><strong>Phone:</strong> ${user.telefono}</p>
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>Address:</strong> ${user.direccion}</p>
      <span class="role-badge role-${user.rolId === 1 ? 'worker' : 'customer'}">
        ${user.rolId === 1 ? 'Worker' : 'Customer'}
      </span>
    `;
    container.appendChild(userCard);
  });
}

// Stay functions
async function loadAllStays() {
  try {
    const response = await fetch(`${API_BASE_URL}/stays`);
    const stays = await response.json();
    displayStays(stays);
  } catch (error) {
    console.error('Error loading stays:', error);
  }
}

function displayStays(stays) {
  const container = document.getElementById('all-stays');
  container.innerHTML = '';

  if (stays.length === 0) {
    container.innerHTML = '<p>No stays registered</p>';
    return;
  }

  stays.forEach(stay => {
    const totalValue = calculateStayTotal(stay);
    const stayCard = document.createElement('div');
    stayCard.className = 'stay-card';
    stayCard.innerHTML = `
      <h3>Stay #${stay.id}</h3>
      <p><strong>Check-in:</strong> ${formatDate(stay.ingreso)}</p>
      <p><strong>Check-out:</strong> ${formatDate(stay.salida)}</p>
      <p><strong>Value per day:</strong> $${stay.valorDia.toLocaleString()}</p>
      <p><strong>Services:</strong> ${stay.serviciosAdicionales.join(', ')}</p>
      <div class="total-value">Total value: $${totalValue.toLocaleString()}</div>
      <span class="status-badge status-${stay.completada ? 'completed' : 'active'}">
        ${stay.completada ? 'Completed' : 'Active'}
      </span>
      <div class="card-actions">
        ${!stay.completada ? `<button class="complete-btn" data-stay-id="${stay.id}">Complete</button>` : ''}
        <button class="edit-btn" data-stay-id="${stay.id}">Edit</button>
        <button class="delete-btn" data-stay-id="${stay.id}">Delete</button>
      </div>
    `;
    container.appendChild(stayCard);
  });

  // Add event listeners to buttons
  container.querySelectorAll('.complete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const stayId = parseInt(e.target.dataset.stayId);
      completeStay(stayId);
    });
  });

  container.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const stayId = parseInt(e.target.dataset.stayId);
      editStay(stayId);
    });
  });

  container.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const stayId = parseInt(e.target.dataset.stayId);
      deleteStay(stayId);
    });
  });
}

function showStayModal(stay = null) {
  editingStay = stay;
  const modal = document.getElementById('stay-modal');
  const title = document.getElementById('stay-modal-title');
  const form = document.getElementById('stay-form');

  if (stay) {
    title.textContent = 'Edit Stay';
    form.pet.value = stay.petId;
    form.ingreso.value = stay.ingreso;
    form.salida.value = stay.salida;
    form['valor-dia'].value = stay.valorDia;
    
    // Reset checkboxes
    form.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      checkbox.checked = stay.serviciosAdicionales.includes(checkbox.value);
    });
  } else {
    title.textContent = 'Create Stay';
    form.reset();
    loadPetsForStay();
  }

  modal.classList.remove('hidden');
}

function hideStayModal() {
  document.getElementById('stay-modal').classList.add('hidden');
  editingStay = null;
}

async function loadPetsForStay() {
  try {
    const response = await fetch(`${API_BASE_URL}/pets`);
    const pets = await response.json();
    const select = document.getElementById('stay-pet');
    
    select.innerHTML = '<option value="">Select a pet</option>';
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

async function handleStaySubmit(e) {
  e.preventDefault();

  const selectedServices = Array.from(document.querySelectorAll('.services-checkboxes input:checked'))
    .map(checkbox => checkbox.value);

  const stayData = {
    petId: parseInt(document.getElementById('stay-pet').value),
    ingreso: document.getElementById('stay-ingreso').value,
    salida: document.getElementById('stay-salida').value,
    valorDia: parseInt(document.getElementById('stay-valor-dia').value),
    serviciosAdicionales: selectedServices,
    completada: false
  };

  console.log('Saving stay:', stayData);

  try {
    const url = editingStay 
      ? `${API_BASE_URL}/stays/${editingStay.id}`
      : `${API_BASE_URL}/stays`;
    
    const method = editingStay ? 'PATCH' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(stayData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Stay saved successfully:', result);
      alert(editingStay ? 'Stay updated successfully' : 'Stay created successfully');
      hideStayModal();
      loadDashboard();
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error saving stay:', error);
    alert('Error saving stay: ' + error.message);
  }
}

async function editStay(stayId) {
  console.log('Editing stay with ID:', stayId);
  try {
    const response = await fetch(`${API_BASE_URL}/stays/${stayId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const stay = await response.json();
    console.log('Stay loaded for editing:', stay);
    await loadPetsForStay();
    showStayModal(stay);
  } catch (error) {
    console.error('Error loading stay:', error);
    alert('Error loading stay: ' + error.message);
  }
}

async function completeStay(stayId) {
  console.log('Completing stay with ID:', stayId);
  
  if (!confirm('Are you sure you want to mark this stay as completed?')) return;

  try {
    const response = await fetch(`${API_BASE_URL}/stays/${stayId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ completada: true })
    });

    if (response.ok) {
      console.log('Stay marked as completed');
      alert('Stay marked as completed successfully');
      loadDashboard();
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error completing stay:', error);
    alert('Error completing stay: ' + error.message);
  }
}

async function deleteStay(stayId) {
  console.log('Deleting stay with ID:', stayId);
  
  if (!confirm('Are you sure you want to delete this stay?')) return;

  try {
    const response = await fetch(`${API_BASE_URL}/stays/${stayId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      console.log('Stay deleted successfully');
      alert('Stay deleted successfully');
      loadDashboard();
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting stay:', error);
    alert('Error deleting stay: ' + error.message);
  }
}

// Utility functions
function calculateStayTotal(stay) {
  const startDate = new Date(stay.ingreso);
  const endDate = new Date(stay.salida);
  const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  return days * stay.valorDia;
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US');
}

// Update URL without page reload
function updateURL(path) {
  console.log('Updating URL to:', path);
  window.history.pushState({}, '', path);
}
