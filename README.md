# PetCare Center - SPA

Una Single Page Application (SPA) para un centro vacacional de cuidado de mascotas, desarrollada con HTML5, CSS3 y JavaScript Vanilla.

##  Características

- **Autenticación de usuarios** con roles (worker/customer)
- **Gestión de mascotas** - registro, edición y eliminación
- **Gestión de estancias** - creación y seguimiento de reservas
- **Cálculo automático** del valor total de estancias
- **Interfaz responsiva** y moderna
- **Navegación fluida** sin recargas de página
- **API REST** simulada con json-server

##  Requisitos Previos

- Node.js (versión 14 o superior)
- npm o yarn

## 🛠 Instalación

1. **Clona o descarga el proyecto**
   ```bash
   git clone <url-del-repositorio>
   cd project-auth
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Inicia el servidor de desarrollo**
   ```bash
   npm run dev
   ```

4. **En otra terminal, inicia json-server**
   ```bash
   npm run server
   ```

##  Cómo usar la aplicación

### Acceso inicial
- Abre tu navegador y ve a `http://localhost:5173`
- Verás la página de bienvenida del PetCare Center

### Usuarios de prueba

#### Trabajador (Worker)
- **Email:** ana@mail.com
- **Contraseña:** 123456

#### Cliente (Customer)
- **Email:** carlos@mail.com
- **Contraseña:** 123456

### Funcionalidades por rol

#### Trabajador (Worker)
- Ver todas las mascotas del sistema
- Ver todos los usuarios registrados
- Crear estancias para mascotas
- Editar y completar estancias
- Calcular valores totales de estancias

#### Cliente (Customer)
- Ver solo sus mascotas
- Registrar nuevas mascotas
- Editar o eliminar mascotas (solo si no tienen estancias)
- Cerrar sesión

##  Estructura de la Base de Datos

### Colecciones en `database.json`

#### Roles
```json
{
  "id": 1,
  "name": "worker"
}
{
  "id": 2,
  "name": "customer"
}
```

#### Usuarios
```json
{
  "id": 1,
  "nombre": "Ana García",
  "identidad": "12345678",
  "telefono": "3001234567",
  "direccion": "Calle 123 #45-67, Bogotá",
  "email": "ana@mail.com",
  "contrasena": "123456",
  "rolId": 1
}
```

#### Mascotas
```json
{
  "id": 1,
  "nombre": "Luna",
  "peso": 15.5,
  "edad": 3,
  "raza": "Golden Retriever",
  "anotaciones": "Muy juguetona y sociable",
  "temperamento": "Amigable",
  "userId": 2
}
```

#### Estancias
```json
{
  "id": 1,
  "ingreso": "2025-01-15",
  "salida": "2025-01-20",
  "petId": 1,
  "serviciosAdicionales": ["Paseo diario", "Cepillado"],
  "valorDia": 40000,
  "completada": true
}
```

##  API Endpoints

### Base URL: `http://localhost:3001`

#### Roles
- `GET /roles` - Obtener todos los roles
- `GET /roles/:id` - Obtener rol por ID

#### Usuarios
- `GET /users` - Obtener todos los usuarios
- `GET /users/:id` - Obtener usuario por ID
- `GET /users?email=email@example.com` - Buscar por email
- `GET /users?rolId=1` - Filtrar por rol
- `POST /users` - Crear nuevo usuario
- `PATCH /users/:id` - Actualizar usuario
- `DELETE /users/:id` - Eliminar usuario

#### Mascotas
- `GET /pets` - Obtener todas las mascotas
- `GET /pets/:id` - Obtener mascota por ID
- `GET /pets?userId=1` - Filtrar por dueño
- `POST /pets` - Crear nueva mascota
- `PATCH /pets/:id` - Actualizar mascota
- `DELETE /pets/:id` - Eliminar mascota

#### Estancias
- `GET /stays` - Obtener todas las estancias
- `GET /stays/:id` - Obtener estancia por ID
- `GET /stays?petId=1` - Filtrar por mascota
- `POST /stays` - Crear nueva estancia
- `PATCH /stays/:id` - Actualizar estancia
- `DELETE /stays/:id` - Eliminar estancia

## Cálculo de Estancias

El sistema calcula automáticamente el valor total de cada estancia:

1. **Cálculo de días:** Diferencia entre fecha de ingreso y salida (incluyendo ambos días)
2. **Valor total:** Días × Valor por día

**Ejemplo:**
- Ingreso: 2025-07-10
- Salida: 2025-07-15
- Valor por día: $40,000
- Días: 6 (incluyendo 10 y 15)
- **Total: $240,000**

##  Características de la UI

- **Diseño responsivo** que se adapta a diferentes tamaños de pantalla
- **Animaciones suaves** para transiciones entre vistas
- **Modales** para formularios de creación/edición
- **Tabs** en el dashboard del trabajador
- **Cards** para mostrar información de mascotas, usuarios y estancias
- **Badges** para mostrar roles y estados
- **Gradientes** y efectos visuales modernos

##  Seguridad y Validaciones

- **Autenticación** mediante localStorage
- **Validación de roles** para acceso a funcionalidades
- **Prevención de eliminación** de mascotas con estancias activas
- **Validación de formularios** en el frontend
- **Manejo de errores** en llamadas a la API

##  Scripts Disponibles

```bash
npm run dev          # Inicia el servidor de desarrollo (Vite)
npm run build        # Construye la aplicación para producción
npm run preview      # Previsualiza la build de producción
npm run server       # Inicia json-server en puerto 3001
```

##  Estructura del Proyecto

```
project-auth/
├── index.html              # Archivo principal HTML
├── database.json           # Base de datos JSON
├── package.json            # Configuración del proyecto
├── README.md              # Este archivo
└── src/
    ├── css/
    │   └── styles.css     # Estilos CSS
    └── js/
        └── main.js        # Lógica principal JavaScript
```

##  Solución de Problemas

### El servidor no inicia
- Verifica que el puerto 3001 esté disponible
- Asegúrate de que json-server esté instalado: `npm install json-server`

### Error de CORS
- El servidor de desarrollo (Vite) y json-server deben estar corriendo simultáneamente
- Verifica que las URLs en el código apunten a `http://localhost:3001`

### Problemas de autenticación
- Limpia el localStorage del navegador
- Verifica que los usuarios de prueba existan en `database.json`

##  Notas de Desarrollo

- La aplicación utiliza **JavaScript Vanilla** sin frameworks
- **json-server** simula una API REST completa
- **LocalStorage** maneja la sesión del usuario
- **Fetch API** para las comunicaciones HTTP
- **CSS Grid y Flexbox** para el diseño responsivo

##  Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

##  Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

**Desarrollado para el cuidado de mascotas** 
