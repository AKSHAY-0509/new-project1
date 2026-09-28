const STORAGE_KEY = 'vignan_student_app';
const CURRENT_STUDENT_KEY = 'vignan_current_student';

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

function getCurrentStudent() {
  const id = localStorage.getItem(CURRENT_STUDENT_KEY);
  const appData = loadAppData();
  return appData.students.find((student) => student.id === id) || null;
}

function setCurrentStudent(studentId) {
  localStorage.setItem(CURRENT_STUDENT_KEY, studentId);
}

function getStudentByEmail(email) {
  const appData = loadAppData();
  return appData.students.find((student) => student.email.toLowerCase() === email.toLowerCase()) || null;
}

function getStudentRegistrations(studentId) {
  const appData = loadAppData();
  return appData.eventRegistrations.filter((item) => item.studentId === studentId);
}

function getStudentOdRequests(studentId) {
  const appData = loadAppData();
  return appData.odRequests.filter((item) => item.studentId === studentId);
}

function renderClubEvents() {
  const eventsGrid = document.getElementById('clubEventsGrid');
  if (!eventsGrid) return;

  const currentStudent = getCurrentStudent();
  if (!currentStudent) return;

  const registrations = getStudentRegistrations(currentStudent.id);
  const registeredIds = new Set(registrations.map((item) => item.eventId));
  const clubEvents = getClubEvents();
  const groupedEvents = clubEvents.reduce((groups, event) => {
    const clubName = event.clubName || 'General Events';
    if (!groups[clubName]) groups[clubName] = [];
    groups[clubName].push(event);
    return groups;
  }, {});

  eventsGrid.innerHTML = Object.entries(groupedEvents)
    .map(([clubName, events]) => {
      const clubColor = events[0]?.color || 'sports';
      const clubIcon = clubName.split(' ')[0][0];

      return `
        <div class="club-group">
          <div class="club-title">${clubName}</div>
          <div class="club-events">
            ${events
              .map((event) => {
                const isRegistered = registeredIds.has(event.id);
                const eventDateLabel = formatEventDate(event.date);
                const timeText = event.time ? ` • ${event.time}` : '';

                return `
                  <article class="club-card ${clubColor}">
                    <div class="club-icon">${clubIcon}</div>
                    <div class="club-body">
                      <h3>${event.name}</h3>
                      <p class="club-date">${eventDateLabel}${timeText}</p>
                      <p>${event.description}</p>
                      <button class="mini-btn ${isRegistered ? 'registered' : ''}" data-event-id="${event.id}" data-event-name="${event.name}">
                        ${isRegistered ? 'Registered' : 'Register'}
                      </button>
                    </div>
                  </article>
                `;
              })
              .join('')}
          </div>
        </div>
      `;
    })
    .join('');

  document.querySelectorAll('[data-event-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const appData = loadAppData();
      const eventId = button.dataset.eventId;
      const eventName = button.dataset.eventName;
      const studentId = currentStudent.id;

      const exists = appData.eventRegistrations.some(
        (item) => item.studentId === studentId && item.eventId === eventId
      );

      if (exists) {
        alert('You already registered for this event.');
        return;
      }

      appData.eventRegistrations.push({
        id: Date.now().toString(),
        studentId,
        eventId,
        eventName,
        registeredAt: new Date().toISOString()
      });

      saveAppData(appData);
      renderClubEvents();
      renderOdList();
      alert(`Registered successfully for ${eventName}.`);
    });
  });
}

function renderOdList() {
  const odList = document.getElementById('studentOdList');
  if (!odList) return;

  const currentStudent = getCurrentStudent();
  if (!currentStudent) return;

  const requests = getStudentOdRequests(currentStudent.id);

  if (!requests.length) {
    odList.innerHTML = '<p class="empty-state">No OD requests yet.</p>';
    return;
  }

  odList.innerHTML = requests
    .map(
      (request) => `
        <div class="od-item ${request.status}">
          <div>
            <strong>${request.reason}</strong>
            <p>${request.date} • ${request.duration}</p>
          </div>
          <span class="status-badge ${request.status}">${request.status}</span>
        </div>
      `
    )
    .join('');
}

function updateStudentProfileFields() {
  const profile = getCurrentStudent();
  if (!profile) return;

  const firstName = document.getElementById('updateFirstName');
  const lastName = document.getElementById('updateLastName');
  const email = document.getElementById('updateEmail');
  const phone = document.getElementById('updatePhone');
  const course = document.getElementById('updateCourse');
  const address = document.getElementById('updateAddress');

  if (firstName) firstName.value = profile.firstName || '';
  if (lastName) lastName.value = profile.lastName || '';
  if (email) email.value = profile.email || '';
  if (phone) phone.value = profile.phone || '';
  if (course) course.value = profile.course || '';
  if (address) address.value = profile.address || '';
}

const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
      alert('Passwords do not match. Please try again.');
      return;
    }

    const appData = loadAppData();
    const email = document.getElementById('email').value.trim();

    if (appData.students.some((student) => student.email.toLowerCase() === email.toLowerCase())) {
      alert('This email already exists. Please use another one.');
      return;
    }

    const student = {
      id: Date.now().toString(),
      firstName: document.getElementById('firstName').value.trim(),
      lastName: document.getElementById('lastName').value.trim(),
      email,
      phone: document.getElementById('phone').value.trim(),
      password,
      course: '',
      address: '',
      role: 'student'
    };

    appData.students.push(student);
    saveAppData(appData);
    alert('Signup successful! You can now log in.');
    window.location.href = 'login.html';
  });
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const appData = loadAppData();
    const student = appData.students.find(
      (item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password
    );

    if (!student) {
      alert('Invalid email or password.');
      return;
    }

    setCurrentStudent(student.id);
    alert('Login successful!');
    window.location.href = 'dashboard.html';
  });
}

const updateProfileForm = document.getElementById('updateProfileForm');
if (updateProfileForm) {
  updateStudentProfileFields();

  updateProfileForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const currentStudent = getCurrentStudent();
    if (!currentStudent) {
      alert('Please log in first.');
      return;
    }

    const appData = loadAppData();
    const studentIndex = appData.students.findIndex((student) => student.id === currentStudent.id);

    if (studentIndex !== -1) {
      appData.students[studentIndex] = {
        ...appData.students[studentIndex],
        firstName: document.getElementById('updateFirstName').value.trim(),
        lastName: document.getElementById('updateLastName').value.trim(),
        email: document.getElementById('updateEmail').value.trim(),
        phone: document.getElementById('updatePhone').value.trim(),
        course: document.getElementById('updateCourse').value.trim(),
        address: document.getElementById('updateAddress').value.trim()
      };
      saveAppData(appData);
      setCurrentStudent(appData.students[studentIndex].id);

      const profileStatus = document.getElementById('profileStatus');
      if (profileStatus) {
        profileStatus.textContent = `Profile updated for ${appData.students[studentIndex].firstName}!`;
      }

      alert('Profile updated successfully!');
    }
  });
}

const studentDashboardPage = document.body.dataset.page === 'student-dashboard';
if (studentDashboardPage) {
  const currentStudent = getCurrentStudent();
  if (!currentStudent) {
    window.location.href = 'login.html';
  } else {
    const nameCell = document.getElementById('studentName');
    const emailCell = document.getElementById('studentEmail');
    const courseCell = document.getElementById('studentCourse');

    if (nameCell) nameCell.textContent = `${currentStudent.firstName} ${currentStudent.lastName}`;
    if (emailCell) emailCell.textContent = currentStudent.email;
    if (courseCell) courseCell.textContent = currentStudent.course || 'Not updated yet';

    renderClubEvents();
    renderOdList();

    const odForm = document.getElementById('odRequestForm');
    if (odForm) {
      odForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const current = getCurrentStudent();
        if (!current) return;

        const appData = loadAppData();
        const request = {
          id: Date.now().toString(),
          studentId: current.id,
          studentName: `${current.firstName} ${current.lastName}`,
          email: current.email,
          reason: document.getElementById('odReason').value.trim(),
          duration: document.getElementById('odDuration').value,
          date: document.getElementById('odDate').value,
          status: 'pending',
          requestedAt: new Date().toISOString()
        };

        appData.odRequests.push(request);
        saveAppData(appData);
        odForm.reset();
        renderOdList();
        alert('OD request submitted successfully. It is pending staff approval.');
      });
    }
  }
}
