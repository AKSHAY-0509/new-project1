const STORAGE_KEY = 'vignan_student_app';
const CURRENT_STAFF_KEY = 'vignan_current_staff';

const DEFAULT_CLUBS = [
  {
    id: 'sports',
    name: 'Sports Club',
    color: 'sports',
    events: [
      { id: 'sports-1', name: 'Football League', date: '2026-10-12', time: '4:00 PM', description: 'Inter-college football tournament with knockout rounds.' },
      { id: 'sports-2', name: 'Cricket Sprint Cup', date: '2026-10-20', time: '10:00 AM', description: 'Indoor cricket challenge and team open match.' }
    ]
  },
  {
    id: 'dance',
    name: 'Dance Club',
    color: 'dance',
    events: [
      { id: 'dance-1', name: 'Street Beat Night', date: '2026-10-15', time: '6:30 PM', description: 'Dance battle finale with freestyle and team choreography.' },
      { id: 'dance-2', name: 'Fusion Dance Fest', date: '2026-10-28', time: '5:00 PM', description: 'Cultural dance showcase and solo performer rounds.' }
    ]
  },
  {
    id: 'music',
    name: 'Music Club',
    color: 'music',
    events: [
      { id: 'music-1', name: 'Acoustic Evening', date: '2026-10-18', time: '7:00 PM', description: 'Open mic and acoustic performances across all genres.' },
      { id: 'music-2', name: 'Band Jam Weekend', date: '2026-10-29', time: '1:00 PM', description: 'Live band competition with student-led performances.' }
    ]
  },
  {
    id: 'coding',
    name: 'Coding Club',
    color: 'coding',
    events: [
      { id: 'coding-1', name: 'Hackathon Sprint', date: '2026-11-05', time: '9:00 AM', description: 'Fast-paced team coding challenge and innovation ideas.' },
      { id: 'coding-2', name: 'Code Debugging Contest', date: '2026-11-16', time: '11:30 AM', description: 'Solve logic problems and debug real code in teams.' }
    ]
  }
];

function loadAppData() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) return JSON.parse(data);

  const initial = {
    students: [],
    staffMembers: [],
    clubEvents: DEFAULT_CLUBS.flatMap((club) =>
      club.events.map((event) => ({
        ...event,
        clubName: club.name,
        color: club.color
      }))
    ),
    eventRegistrations: [],
    odRequests: []
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

function saveAppData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getCurrentStaff() {
  const staffId = localStorage.getItem(CURRENT_STAFF_KEY);
  const appData = loadAppData();
  return appData.staffMembers.find((staff) => staff.id === staffId) || null;
}

function setCurrentStaff(staffId) {
  localStorage.setItem(CURRENT_STAFF_KEY, staffId);
}

function formatEventDate(dateValue) {
  if (!dateValue) return 'Date TBD';

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function getClubEvents() {
  const appData = loadAppData();

  if (!Array.isArray(appData.clubEvents) || appData.clubEvents.length === 0) {
    appData.clubEvents = DEFAULT_CLUBS.flatMap((club) =>
      club.events.map((event) => ({
        ...event,
        clubName: club.name,
        color: club.color
      }))
    );
    saveAppData(appData);
  }

  return appData.clubEvents;
}

function renderStaffRequests() {
  const container = document.getElementById('staffOdRequests');
  if (!container) return;

  const appData = loadAppData();
  const requests = appData.odRequests;

  if (!requests.length) {
    container.innerHTML = '<p class="empty-state">No OD requests available.</p>';
    return;
  }

  container.innerHTML = requests
    .map(
      (request) => `
        <div class="od-item ${request.status}">
          <div>
            <strong>${request.studentName}</strong>
            <p>${request.reason} • ${request.date} • ${request.duration}</p>
            <p>${request.email}</p>
          </div>
          <div style="display:flex; gap:8px; flex-wrap:wrap; justify-content:flex-end;">
            <button class="mini-btn accept-btn" data-request-id="${request.id}" data-action="accepted">Accept</button>
            <button class="btn-danger reject-btn" data-request-id="${request.id}" data-action="rejected">Reject</button>
          </div>
          <span class="status-badge ${request.status}">${request.status}</span>
        </div>
      `
    )
    .join('');

  document.querySelectorAll('[data-request-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const requestId = button.dataset.requestId;
      const action = button.dataset.action;
      const appData = loadAppData();
      const requestIndex = appData.odRequests.findIndex((request) => request.id === requestId);

      if (requestIndex === -1) return;

      appData.odRequests[requestIndex].status = action;
      saveAppData(appData);
      renderStaffRequests();
      alert(`OD request ${action}.`);
    });
  });
}

function renderCreatedEvents() {
  const container = document.getElementById('staffCreatedEvents');
  if (!container) return;

  const events = getClubEvents();

  if (!events.length) {
    container.innerHTML = '<p class="empty-state">No events created yet.</p>';
    return;
  }

  container.innerHTML = events
    .map(
      (event) => `
        <div class="od-item">
          <div>
            <strong>${event.name}</strong>
            <p>${event.clubName} • ${formatEventDate(event.date)} • ${event.time || 'Time TBD'}</p>
            <p>${event.description}</p>
          </div>
          <button class="btn-danger remove-event-btn" data-event-id="${event.id}">Remove</button>
        </div>
      `
    )
    .join('');

  document.querySelectorAll('.remove-event-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const eventId = button.dataset.eventId;
      const appData = loadAppData();
      appData.clubEvents = (appData.clubEvents || []).filter((event) => event.id !== eventId);
      saveAppData(appData);
      renderCreatedEvents();
      alert('Event removed successfully.');
    });
  });
}

const staffSignupForm = document.getElementById('staffSignupForm');
if (staffSignupForm) {
  staffSignupForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const appData = loadAppData();
    const email = document.getElementById('staffEmail').value.trim();

    if (appData.staffMembers.some((member) => member.email.toLowerCase() === email.toLowerCase())) {
      alert('This staff email already exists.');
      return;
    }

    const staff = {
      id: Date.now().toString(),
      firstName: document.getElementById('staffFirstName').value.trim(),
      lastName: document.getElementById('staffLastName').value.trim(),
      email,
      phone: document.getElementById('staffPhone').value.trim(),
      password: document.getElementById('staffPassword').value,
      role: 'staff'
    };

    appData.staffMembers.push(staff);
    saveAppData(appData);
    alert('Staff account created successfully.');
    window.location.href = 'login.html';
  });
}

const staffLoginForm = document.getElementById('staffLoginForm');
if (staffLoginForm) {
  staffLoginForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const appData = loadAppData();
    const email = document.getElementById('staffLoginEmail').value.trim();
    const password = document.getElementById('staffLoginPassword').value;

    const staff = appData.staffMembers.find(
      (member) => member.email.toLowerCase() === email.toLowerCase() && member.password === password
    );

    if (!staff) {
      alert('Invalid staff credentials.');
      return;
    }

    setCurrentStaff(staff.id);
    alert('Staff login successful.');
    window.location.href = 'dashboard.html';
  });
}

const staffUpdateForm = document.getElementById('staffUpdateForm');
if (staffUpdateForm) {
  const currentStaff = getCurrentStaff();
  if (currentStaff) {
    document.getElementById('staffUpdateFirstName').value = currentStaff.firstName || '';
    document.getElementById('staffUpdateLastName').value = currentStaff.lastName || '';
    document.getElementById('staffUpdateEmail').value = currentStaff.email || '';
    document.getElementById('staffUpdatePhone').value = currentStaff.phone || '';
  }

  staffUpdateForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const current = getCurrentStaff();
    if (!current) {
      alert('Please log in first.');
      return;
    }

    const appData = loadAppData();
    const index = appData.staffMembers.findIndex((member) => member.id === current.id);

    if (index !== -1) {
      appData.staffMembers[index] = {
        ...appData.staffMembers[index],
        firstName: document.getElementById('staffUpdateFirstName').value.trim(),
        lastName: document.getElementById('staffUpdateLastName').value.trim(),
        email: document.getElementById('staffUpdateEmail').value.trim(),
        phone: document.getElementById('staffUpdatePhone').value.trim()
      };
      saveAppData(appData);
      alert('Staff profile updated successfully.');
    }
  });
}

const createEventForm = document.getElementById('createEventForm');
if (createEventForm) {
  createEventForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const appData = loadAppData();
    const clubName = document.getElementById('eventClub').value.trim();
    const eventName = document.getElementById('eventName').value.trim();
    const eventDate = document.getElementById('eventDate').value;
    const eventTime = document.getElementById('eventTime').value;
    const eventDescription = document.getElementById('eventDescription').value.trim();

    if (!clubName || !eventName || !eventDate || !eventDescription) {
      alert('Please complete all event details.');
      return;
    }

    const clubColor = DEFAULT_CLUBS.find((club) => club.name === clubName)?.color || 'sports';
    appData.clubEvents = appData.clubEvents || [];
    appData.clubEvents.push({
      id: Date.now().toString(),
      clubName,
      color: clubColor,
      name: eventName,
      date: eventDate,
      time: eventTime,
      description: eventDescription
    });

    saveAppData(appData);
    createEventForm.reset();
    renderCreatedEvents();
    alert('Event created successfully.');
  });
}

const staffDashboardPage = document.body.dataset.page === 'staff-dashboard';
if (staffDashboardPage) {
  const currentStaff = getCurrentStaff();
  if (!currentStaff) {
    window.location.href = 'login.html';
  } else {
    document.getElementById('staffName').textContent = `${currentStaff.firstName} ${currentStaff.lastName}`;
    document.getElementById('staffEmail').textContent = currentStaff.email;
    renderStaffRequests();
    renderCreatedEvents();
  }
}
