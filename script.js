document.addEventListener('DOMContentLoaded', () => {

    // --- Variables Globales y Selectores ---
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const mainContent = document.getElementById('mainContent');
    const loginModalElement = document.getElementById('loginModal');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginRegisterBtn = document.getElementById('loginRegisterBtn');
    const loggedInUserControls = document.getElementById('loggedInUserControls');
    const userNameDisplay = document.getElementById('userNameDisplay');

    let loginModal;

    // --- FUNCIONES DE ALMACENAMIENTO (LOCALSTORAGE) ---

    /**
     * Guarda un nuevo usuario en localStorage con una marca de tiempo.
     * @returns {boolean} true si el registro fue exitoso, false si el email ya existe.
     */
    function saveUser(name, email, password) {
        const users = JSON.parse(localStorage.getItem('registeredUsers')) || {};

        if (users[email]) {
            return false; // Email ya existe
        }

        // AGREGAR: registrationTime (marca de tiempo en milisegundos)
        users[email] = { 
            name: name, 
            password: password, 
            email: email,
            registrationTime: Date.now() 
        };
        
        localStorage.setItem('registeredUsers', JSON.stringify(users));
        return true; 
    }

    // Obtener un usuario por email y contraseña (para Login)
    function getUser(email, password) {
        const users = JSON.parse(localStorage.getItem('registeredUsers')) || {};
        const user = users[email];

        if (user && user.password === password) {
            return user;
        }
        return null;
    }

    /**
     * Muestra en la consola la lista de usuarios ordenados por tiempo de registro.
     * Orden: Del más antiguo al más reciente (Primero en registrarse = #1)
     */
    function logAllUsersInOrder() {
        const usersMap = JSON.parse(localStorage.getItem('registeredUsers')) || {};
        let usersArray = Object.values(usersMap);

        // ORDENAR: Del MÁS ANTIGUO al MÁS RECIENTE (Ascendente)
        // Si quieres del más reciente al más antiguo, usa: b.registrationTime - a.registrationTime
        usersArray.sort((a, b) => a.registrationTime - b.registrationTime);
        
        console.log("-----------------------------------------------------");
        console.log("LISTA DE USUARIOS REGISTRADOS (Orden Cronológico):");
        console.log("-----------------------------------------------------");
        
        if (usersArray.length === 0) {
            console.log("Aún no hay usuarios registrados.");
        }

        usersArray.forEach((user, index) => {
            const registrationDate = new Date(user.registrationTime).toLocaleString();
            console.log(`[#${index + 1}] Nombre: ${user.name} | Email: ${user.email} | Registro: ${registrationDate}`);
        });
        console.log("-----------------------------------------------------");
    }

    // --- FUNCIONES DE UI Y ACCESO ---

    // Función para verificar y restaurar la sesión al cargar
    function checkSession() {
        const loggedInUser = localStorage.getItem('currentUser');
        if (loggedInUser) {
            grantAccess(loggedInUser);
        } else {
            // Si no hay sesión, forzar la apertura del modal
            if (loginModalElement) {
                loginModal = new bootstrap.Modal(loginModalElement, {
                    backdrop: 'static',
                    keyboard: false
                });
                loginModal.show();
            }
        }
    }

    // Función para dar acceso y actualizar la interfaz
    function grantAccess(username) {
        localStorage.setItem('currentUser', username);

        if (mainContent) {
            mainContent.classList.remove('d-none');
        }
        if (loginModal) {
            loginModal.hide();
        }

        // Actualizar la barra de navegación: ocultar login, mostrar cerrar sesión
        loginRegisterBtn.classList.add('d-none');
        loggedInUserControls.classList.remove('d-none');
        userNameDisplay.textContent = `Hola, ${username}`;

        // Mostrar un mensaje de bienvenida
        alert(`¡Acceso Aprobado! Bienvenido, ${username}.`);
    }

    // Función de Cerrar Sesión
    function logout() {
        localStorage.removeItem('currentUser'); // Eliminar la sesión
        mainContent.classList.add('d-none'); // Ocultar contenido
        
        // Actualizar la barra de navegación: mostrar login, ocultar cerrar sesión
        loggedInUserControls.classList.add('d-none');
        loginRegisterBtn.classList.remove('d-none');
        
        // Forzar la reapertura del modal de login
        if (loginModalElement) {
            // Aseguramos que se inicialice si aún no lo está
            loginModal = new bootstrap.Modal(loginModalElement, {
                backdrop: 'static',
                keyboard: false
            });
            loginModal.show();
        }

        alert('Sesión cerrada exitosamente. ¡Hasta pronto!');
    }
    
    // --- LÓGICA DE VALIDACIÓN Y EVENT LISTENERS ---

    // Iniciar la verificación de sesión al cargar
    checkSession();
    
    // Evento para Cerrar Sesión
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }


    // Función genérica para validar que todos los campos requeridos estén llenos
    function validateForm(form) {
        let isValid = true;
        const requiredInputs = form.querySelectorAll('input[required]');

        requiredInputs.forEach(input => {
            if (input.value.trim() === '') {
                input.classList.add('is-invalid');
                isValid = false;
            } else {
                input.classList.remove('is-invalid');
            }
        });
        return isValid;
    }

    // Validación y Lógica del Formulario de LOGIN
    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();

            if (!validateForm(loginForm)) {
                alert('Por favor, rellena todos los campos para iniciar sesión.');
                return;
            }

            const email = document.getElementById('loginName').value.trim();
            const password = document.getElementById('loginPassword').value.trim();

            const user = getUser(email, password);

            if (user) {
                grantAccess(user.name); 
            } else {
                alert('¡Error! Credenciales incorrectas o usuario no registrado.');
            }
        });
    }


    // Validación y Lógica del Formulario de REGISTRO
    if (registerForm) {
        registerForm.addEventListener('submit', (event) => {
            event.preventDefault();

            if (!validateForm(registerForm)) {
                alert('Por favor, rellena todos los campos para registrarte.');
                return;
            }

            const name = document.getElementById('registerName').value.trim();
            const email = document.getElementById('registerEmail').value.trim();
            const password = document.getElementById('registerPassword').value.trim();

            // Validaciones de formato
            const passwordRegex = /.{8,}/;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if (!passwordRegex.test(password)) {
                document.getElementById('registerPassword').classList.add('is-invalid');
                alert('La contraseña debe tener al menos 8 caracteres.');
                return;
            } else {
                document.getElementById('registerPassword').classList.remove('is-invalid');
            }

            if (!emailRegex.test(email)) {
                document.getElementById('registerEmail').classList.add('is-invalid');
                alert('Por favor, introduce un correo electrónico válido.');
                return;
            } else {
                document.getElementById('registerEmail').classList.remove('is-invalid');
            }

            // SIMULACIÓN DE REGISTRO
            if (saveUser(name, email, password)) {
                grantAccess(name); // Dar acceso después del registro
                logAllUsersInOrder(); // << REQUISITO CUMPLIDO: Mostrar la lista ordenada en la consola
            } else {
                alert('Error de Registro: El correo electrónico ya está registrado. Intenta iniciar sesión.');
            }
        });
    }

    // Validación en tiempo real (al perder el foco)
    document.querySelectorAll('input[required]').forEach(input => {
        input.addEventListener('blur', () => {
            if (input.value.trim() === '') {
                input.classList.add('is-invalid');
            } else {
                input.classList.remove('is-invalid');
            }
        });
    });

});