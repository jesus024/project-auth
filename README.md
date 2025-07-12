#  PetCare Center - SPA

A complete Single Page Application (SPA) for a pet care center, developed with HTML, CSS and Vanilla JavaScript, that consumes a simulated API through json-server.

##  Description

PetCare Center is a web application that allows managing a pet care vacation center. Customers can register their pets and workers can manage animal stays.

### Main Features

- **User authentication** with roles (worker/customer)
- **Pet management** (registration, editing, deletion)
- **Stay management** (care bookings)
- **Automatic calculation** of total stay value
- **Responsive interface** and modern
- **Smooth navigation** without page reloads

##  Installation and Setup

### Prerequisites

- Node.js (version 14 or higher)
- npm (included with Node.js)

### Installation Steps

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd project-auth
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the database server (json-server)**
   ```bash
   npm run server
   ```
   This will start json-server on `http://localhost:3001`

4. **Start the development server (Vite)**
   ```bash
   npm run dev
   ```
   This will start the application on `http://localhost:5173`

5. **Open the application**
   Navigate to `http://localhost:5173` in your browser

##  Database Structure

The application uses json-server with the following collections:

### Roles (`/roles`)
- `id`: Unique identifier
- `name`: Role name ("worker" or "customer")

### Users (`/users`)
- `id`: Unique identifier
- `nombre`: Full name
- `identidad`: Identity number
- `telefono`: Phone number
- `direccion`: Address
- `email`: Email
- `contrasena`: Password
- `rolId`: Role ID (1=worker, 2=customer)

### Pets (`/pets`)
- `id`: Unique identifier
- `nombre`: Pet name
- `peso`: Weight in kilograms
- `edad`: Age in years
- `raza`: Pet breed
- `anotaciones`: Additional notes (optional)
- `temperamento`: Pet temperament
- `userId`: Owner ID

### Stays (`/stays`)
- `id`: Unique identifier
- `ingreso`: Check-in date (YYYY-MM-DD)
- `salida`: Check-out date (YYYY-MM-DD)
- `petId`: Pet ID
- `serviciosAdicionales`: Array of services
- `valorDia`: Daily rate
- `completada`: Stay status (boolean)

##  Roles and Permissions

### Customer
- View only their pets
- Register new pets
- Edit or delete their pets
- Logout

### Worker
- View all pets in the system
- View all users
- Create stays for pets
- Edit and complete stays
- Logout

##  Application Usage

### User Registration
1. On the home page, click "Register"
2. Complete all required fields
3. Click "Register"
4. You will be redirected to login

### Login
1. On the home page, click "Login"
2. Enter your email/identity and password
3. Click "Enter"
4. You will be redirected to the dashboard according to your role

### Pet Management (Customer)
1. In the dashboard, you will see your pets
2. Click "Add Pet" to register a new one
3. Complete the form and click "Save"
4. To edit or delete, use the corresponding buttons

### Stay Management (Worker)
1. In the dashboard, navigate to the "Stays" tab
2. Click "New Stay" to create one
3. Select the pet, dates and services
4. The total value is calculated automatically
5. Use the buttons to complete, edit or delete stays

##  Total Value Calculation

The total value of a stay is calculated automatically:

```
Stay days = (Check-out date - Check-in date) + 1
Total value = Stay days × Daily rate
```

**Example:**
- Check-in: 2025-01-10
- Check-out: 2025-01-15
- Daily rate: $40,000
- Days: 6 days
- Total value: $240,000

## 📱 Technical Features

### Technologies Used
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: json-server (simulated API)
- **Development**: Vite
- **Storage**: LocalStorage for sessions

### Project Structure
```
project-auth/
├── index.html              # Main page
├── database.json           # json-server database
├── package.json            # Project configuration
├── src/
│   ├── css/
│   │   └── styles.css      # Application styles
│   ├── js/
│   │   └── main.js         # Main logic
│   └── views/
│       ├── login.html      # Login view
│       ├── register.html   # Registration view
│       ├── dashboard.html  # Dashboard view
│       └── 404.html        # 404 error view
└── PetCare_Center_API.postman_collection.json
```

##  API Testing

A Postman collection with all endpoints is included:

1. Import the `PetCare_Center_API.postman_collection.json` file in Postman
2. Make sure json-server is running on `http://localhost:3001`
3. Run the tests to verify API functionality

### Main Endpoints

#### Users
- `GET /users` - Get all users
- `GET /users?email=email@example.com` - Search by email
- `GET /users?identidad=12345678` - Search by identity
- `POST /users` - Create user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

#### Pets
- `GET /pets` - Get all pets
- `GET /pets?userId=2` - Get pets from a user
- `POST /pets` - Create pet
- `PATCH /pets/:id` - Update pet
- `DELETE /pets/:id` - Delete pet

#### Stays
- `GET /stays` - Get all stays
- `GET /stays?petId=1` - Get stays from a pet
- `POST /stays` - Create stay
- `PATCH /stays/:id` - Update stay
- `DELETE /stays/:id` - Delete stay

##  Test Data

The database includes sample data:

### Test Users
- **Worker**: maria@mail.com / 123456
- **Customer 1**: carlos@mail.com / 123456
- **Customer 2**: ana@mail.com / 123456

### Test Pets
- Rocky (Golden Retriever) - Owner: Carlos
- Luna (Persian) - Owner: Carlos
- Max (Beagle) - Owner: Ana

##  Troubleshooting

### API Connection Error
- Verify that json-server is running on port 3001
- Check the browser console for network errors

### Authentication Issues
- Clear the browser's localStorage
- Verify that user data exists in the database

### CORS Errors
- Make sure json-server is configured correctly
- Verify that the API URL is correct in `main.js`

##  Development Notes

- The application uses SPA navigation without page reloads
- Session state is maintained in localStorage
- Stay calculations are performed automatically
- The interface is fully responsive
- Error handling and validations are included

##  Contribution

To contribute to the project:

1. Fork the repository
2. Create a branch for your feature
3. Make your changes
4. Submit a pull request

##  License

This project is under the MIT License.

---