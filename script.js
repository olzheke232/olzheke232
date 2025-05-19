// Initial events data
const initialEvents = [
    {
        id: 1,
        title: "Экологический субботник «Чистый берег» в районе Есиль",
        description: "Волонтёры собираются на берегу реки Есиль (или в парке «Жеруйык»), чтобы очистить территорию от мусора и провести инвентаризацию зелёных насаждений. Мероприятие включает в себя уборку, сортировку отходов и посадку деревьев. Цель: улучшение экологической ситуации на левом берегу и повышение осведомлённости о важности сохранения природы.",
        datetime: "2025-05-25T10:00",
        category: "ecology",
        address: "Набережная реки Есиль, район Есиль, Нур-Султан",
        maxParticipants: 100,
        participants: [],
        requirements: "Удобная одежда, вода, перчатки (при наличии). Все желающие — от школьников до пенсионеров.",
        createdBy: "admin"
    },
    {
        id: 2,
        title: "«Тёплый визит» — помощь пожилым людям в районе Сарыарка",
        description: "Волонтёры посещают одиноких пожилых людей в районе Сарыарка, чтобы помочь по дому (уборка, мелкие поручения) и просто поговорить. Мероприятие направлено на снижение уровня одиночества и укрепление связи поколений. Цель: поддержка пожилых граждан и создание тёплой атмосферы общения.",
        datetime: "2025-05-31T09:00",
        category: "social",
        address: "Район Сарыарка, Нур-Султан",
        maxParticipants: 30,
        participants: [],
        requirements: "Возраст от 18 лет. Ответственные, доброжелательные люди. Проходит краткий инструктаж по этике общения и безопасности.",
        createdBy: "admin"
    }
];

// State management
const state = {
    currentUser: null,
    events: [],
    currentPage: 'home',
    filters: {
        category: '',
        city: ''
    }
};

// Load data from localStorage
function loadFromStorage() {
    state.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Check if events exist in localStorage
    const storedEvents = localStorage.getItem('events');
    if (!storedEvents) {
        // If no events in localStorage, use initial events
        state.events = initialEvents;
        // Save initial events to localStorage
        localStorage.setItem('events', JSON.stringify(initialEvents));
    } else {
        // Load events from localStorage
        state.events = JSON.parse(storedEvents);
        // If events array is empty, reset to initial events
        if (!state.events || state.events.length === 0) {
            state.events = initialEvents;
            localStorage.setItem('events', JSON.stringify(initialEvents));
        }
    }
    
    console.log('Loaded events:', state.events); // Debug log
    updateUI();
    renderEvents(); // Explicitly call renderEvents
}

// Save data to localStorage
function saveToStorage() {
    localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
    localStorage.setItem('events', JSON.stringify(state.events));
}

// Navigation
document.querySelectorAll('.nav-links a[data-page]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = e.target.dataset.page;
        navigateToPage(page);
    });
});

function navigateToPage(page) {
    console.log('Navigating to page:', page); // Debug log
    
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    
    // Show selected page
    const targetPage = document.getElementById(`${page}Page`);
    if (targetPage) {
        targetPage.classList.remove('hidden');
        
        // Update active nav link
        document.querySelectorAll('.nav-links a').forEach(a => {
            a.classList.toggle('active', a.dataset.page === page);
        });

        // Special handling for pages
        if (page === 'home') {
            renderEvents();
        } else if (page === 'profile') {
            updateProfileInfo();
        } else if (page === 'add_event') {
            if (!state.currentUser) {
                alert('Пожалуйста, войдите в систему, чтобы добавить мероприятие');
                navigateToPage('auth');
                return;
            }
            // Reset form when navigating to add event page
            document.getElementById('addEventForm').reset();
        }

        state.currentPage = page;
    } else {
        console.error('Page not found:', page);
    }
}

// Authentication
document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const form = tab.dataset.form;
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(f => f.classList.add('hidden'));
        tab.classList.add('active');
        document.getElementById(`${form}Form`).classList.remove('hidden');
    });
});

document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = e.target.elements[0].value;
    const password = e.target.elements[1].value;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        state.currentUser = user;
        saveToStorage();
        updateUI();
        navigateToPage('home');
    } else {
        alert('Неверные учетные данные');
    }
});

document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const firstName = e.target.elements[0].value;
    const lastName = e.target.elements[1].value;
    const email = e.target.elements[2].value;
    const password = e.target.elements[3].value;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    if (users.some(u => u.email === email)) {
        alert('Email уже зарегистрирован');
        return;
    }

    const newUser = {
        id: Date.now(),
        firstName,
        lastName,
        email,
        password,
        preferences: {
            city: '',
            interests: []
        }
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    state.currentUser = newUser;
    saveToStorage();
    updateUI();
    navigateToPage('profile');
});

// Update UI with profile information
function updateProfileInfo() {
    if (state.currentUser) {
        document.getElementById('profileName').textContent = `${state.currentUser.firstName} ${state.currentUser.lastName}`;
        document.getElementById('profileEmail').textContent = state.currentUser.email;
        
        // Update stats
        const userEvents = state.events.filter(event => 
            event.participants.includes(state.currentUser.id)
        );
        document.getElementById('eventsJoined').textContent = userEvents.length;
        
        // Estimate hours (assuming average 3 hours per event)
        const estimatedHours = userEvents.length * 3;
        document.getElementById('hoursVolunteered').textContent = estimatedHours;
        
        // Calculate achievements (simple logic - can be expanded)
        let achievements = 0;
        if (userEvents.length >= 1) achievements++; // First event
        if (userEvents.length >= 5) achievements++; // Regular volunteer
        if (userEvents.length >= 10) achievements++; // Dedicated volunteer
        document.getElementById('achievementsCount').textContent = achievements;
        
        // Update email notifications checkbox
        document.getElementById('emailNotifications').checked = 
            state.currentUser.preferences?.emailNotifications || false;
    }
}

// Profile Management
document.getElementById('preferencesForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const city = document.getElementById('cityInput').value;
    const interests = Array.from(document.querySelectorAll('.interest-item input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    const emailNotifications = document.getElementById('emailNotifications').checked;

    state.currentUser.preferences = { 
        city, 
        interests,
        emailNotifications 
    };
    
    // Update user in users array
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.id === state.currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = state.currentUser;
        localStorage.setItem('users', JSON.stringify(users));
    }

    saveToStorage();
    alert('Настройки профиля сохранены!');
    updateProfileInfo();
});

// Events Management
document.getElementById('addEventForm').addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('Form submitted'); // Debug log

    if (!state.currentUser) {
        alert('Пожалуйста, войдите в систему, чтобы добавить мероприятие');
        navigateToPage('auth');
        return;
    }

    const title = document.getElementById('eventTitle').value.trim();
    const description = document.getElementById('eventDescription').value.trim();
    const datetime = document.getElementById('eventDate').value;
    const category = document.getElementById('eventCategory').value;
    const address = document.getElementById('eventAddress').value.trim();
    const maxParticipants = parseInt(document.getElementById('eventParticipants').value) || null;
    const requirements = document.getElementById('eventRequirements').value.trim();

    // Validation
    if (!title || !description || !datetime || !category || !address) {
        alert('Пожалуйста, заполните все обязательные поля');
        return;
    }

    const newEvent = {
        id: Date.now(),
        title,
        description,
        datetime,
        category,
        address,
        maxParticipants,
        requirements,
        createdBy: state.currentUser.id,
        participants: []
    };

    console.log('New event:', newEvent); // Debug log

    state.events.push(newEvent);
    saveToStorage();
    e.target.reset();
    alert('Мероприятие успешно добавлено!');
    navigateToPage('home');
});

// Event Filtering
document.getElementById('categoryFilter').addEventListener('change', (e) => {
    state.filters.category = e.target.value;
    renderEvents();
});

document.getElementById('cityFilter').addEventListener('input', (e) => {
    state.filters.city = e.target.value.toLowerCase();
    renderEvents();
});

function filterEvents(events) {
    console.log('Filtering events. Current filters:', state.filters); // Debug log
    console.log('Total events before filtering:', events.length); // Debug log
    
    if (!events) return [];
    
    return events.filter(event => {
        const matchesCategory = !state.filters.category || event.category === state.filters.category;
        const matchesCity = !state.filters.city || event.address.toLowerCase().includes(state.filters.city.toLowerCase());
        
        // Remove the interests filter as it might be too restrictive
        // const matchesInterests = !state.currentUser?.preferences?.interests?.length || 
        //     state.currentUser.preferences.interests.includes(event.category);
        
        const result = matchesCategory && matchesCity;
        
        if (!result) {
            console.log('Event filtered out:', {
                event: event.title,
                category: matchesCategory ? 'matched' : 'filtered',
                city: matchesCity ? 'matched' : 'filtered'
            });
        }
        
        return result;
    });
}

function formatDateTime(dateStr) {
    const date = new Date(dateStr);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('ru-RU', options);
}

function renderEvents() {
    console.log('Rendering events...'); // Debug log
    const eventsList = document.getElementById('eventsList');
    const noEventsMessage = eventsList.querySelector('.no-events');
    const filteredEvents = filterEvents(state.events);
    
    console.log('Filtered events:', filteredEvents); // Debug log

    // Clear existing events
    Array.from(eventsList.children).forEach(child => {
        if (!child.classList.contains('no-events')) {
            child.remove();
        }
    });

    if (!filteredEvents || filteredEvents.length === 0) {
        console.log('No events to display'); // Debug log
        noEventsMessage.classList.remove('hidden');
    } else {
        console.log('Displaying events:', filteredEvents.length); // Debug log
        noEventsMessage.classList.add('hidden');
        
        filteredEvents
            .sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
            .forEach(event => {
                const isParticipating = state.currentUser && event.participants.includes(state.currentUser.id);
                const isFull = event.maxParticipants && event.participants.length >= event.maxParticipants;
                
                const eventCard = document.createElement('div');
                eventCard.className = 'event-card';
                eventCard.innerHTML = `
                    <h3>${event.title}</h3>
                    <p class="event-description">${event.description}</p>
                    <div class="event-meta">
                        <p><i class='bx bx-calendar'></i> ${formatDateTime(event.datetime)}</p>
                        <p><i class='bx bx-map'></i> ${event.address}</p>
                        <p><i class='bx bx-category'></i> ${event.category}</p>
                        <p><i class='bx bx-user'></i> ${event.participants.length}${event.maxParticipants ? ` / ${event.maxParticipants}` : ''} участников</p>
                    </div>
                    ${event.requirements ? `
                    <div class="event-requirements">
                        <p><i class='bx bx-info-circle'></i> <strong>Требования:</strong> ${event.requirements}</p>
                    </div>
                    ` : ''}
                    <div class="event-actions">
                        ${state.currentUser ? `
                            <button onclick="joinEvent(${event.id})" 
                                class="button-primary ${isParticipating ? 'participating' : ''} ${isFull && !isParticipating ? 'disabled' : ''}"
                                ${isFull && !isParticipating ? 'disabled' : ''}>
                                ${isParticipating ? 
                                    '<i class="bx bx-check"></i> Вы участвуете' : 
                                    isFull ? 
                                        '<i class="bx bx-x"></i> Мест нет' : 
                                        '<i class="bx bx-plus"></i> Участвовать'}
                            </button>
                            ${isParticipating ? `
                                <button onclick="joinEvent(${event.id})" class="button-secondary">
                                    <i class="bx bx-x"></i> Отменить участие
                                </button>
                            ` : ''}
                        ` : `
                            <button onclick="navigateToPage('auth')" class="button-primary">
                                <i class="bx bx-log-in"></i> Войдите, чтобы участвовать
                            </button>
                        `}
                    </div>
                `;
                eventsList.appendChild(eventCard);
            });
    }
}

// Join/Leave Event
function joinEvent(eventId) {
    if (!state.currentUser) {
        alert('Пожалуйста, войдите в систему, чтобы принять участие в мероприятии');
        navigateToPage('auth');
        return;
    }

    const event = state.events.find(e => e.id === eventId);
    if (!event) return;

    const userIndex = event.participants.indexOf(state.currentUser.id);
    if (userIndex === -1) {
        // Trying to join
        if (event.maxParticipants && event.participants.length >= event.maxParticipants) {
            alert('К сожалению, все места уже заняты');
            return;
        }
        event.participants.push(state.currentUser.id);
        alert('Вы успешно присоединились к мероприятию!');
    } else {
        // Leaving event
        if (confirm('Вы уверены, что хотите отменить участие в мероприятии?')) {
            event.participants.splice(userIndex, 1);
            alert('Вы отменили участие в мероприятии');
        } else {
            return;
        }
    }

    saveToStorage();
    renderEvents();
}

// UI Updates
function updateUI() {
    const authLink = document.getElementById('authLink');
    const profileLink = document.getElementById('profileLink');
    
    if (state.currentUser) {
        authLink.textContent = 'Выйти';
        authLink.onclick = (e) => {
            e.preventDefault();
            state.currentUser = null;
            saveToStorage();
            navigateToPage('home');
            updateUI();
        };
        profileLink.classList.remove('hidden');

        // Update profile form if on profile page
        if (state.currentPage === 'profile') {
            document.getElementById('cityInput').value = state.currentUser.preferences?.city || '';
            document.querySelectorAll('.interest-item input[type="checkbox"]').forEach(cb => {
                cb.checked = state.currentUser.preferences?.interests?.includes(cb.value) || false;
            });
            updateProfileInfo();
        }
    } else {
        authLink.textContent = 'Войти';
        authLink.onclick = (e) => {
            e.preventDefault();
            navigateToPage('auth');
        };
        profileLink.classList.add('hidden');
    }
}

// Initialize app
window.addEventListener('load', () => {
    console.log('App initializing...'); // Debug log
    
    // Clear existing events from localStorage
    localStorage.removeItem('events');
    
    // Initialize state
    state.events = initialEvents;
    
    // Save initial state
    saveToStorage();
    
    loadFromStorage();
    navigateToPage('home');
}); 