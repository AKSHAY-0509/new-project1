const STUDENT_KEY = 'student_profile';

const clubEvents = [
  {
    name: 'Sports Club',
    date: '12 Oct 2026',
    description: 'Inter-college football tournament and athletics sprint finals.',
    color: 'sports'
  },
  {
    name: 'Dance Club',
    date: '18 Oct 2026',
    description: 'Street dance showcase with team performances and live DJ music.',
    color: 'dance'
  },
  {
    name: 'Music Club',
    date: '25 Oct 2026',
    description: 'Acoustic night featuring singing, instrumental jams, and vocals.',
    color: 'music'
  },
  {
    name: 'Coding Club',
    date: '02 Nov 2026',
    description: 'Hackathon challenge and coding sprint for innovative projects.',
    color: 'coding'
  }
];

function getStudentProfile() {
  const profile = localStorage.getItem(STUDENT_KEY);
  return profile ? JSON.parse(profile) : null;
}

function saveStudentProfile(profile) {
  localStorage.setItem(STUDENT_KEY, JSON.stringify(profile));
}

function renderClubEvents() {
  const eventsGrid = document.getElementById('clubEventsGrid');

  if (!eventsGrid) return;

  eventsGrid.innerHTML = clubEvents
    .map(
      (event) => `
        <article class="club-card ${event.color}">
          <div class="club-icon">${event.name.split(' ')[0][0]}</div>
          <div class="club-body">
            <h3>${event.name}</h3>
            <p class="club-date">${event.date}</p>
            <p>${event.description}</p>
          </div>
        </article>
      `
    )
    .join('');
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

    const profile = {
      firstName: document.getElementById('firstName').value,
      lastName: document.getElementById('lastName').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      password: password,
    };

    saveStudentProfile(profile);
    alert('Signup successful! You can now log in.');
    window.location.href = 'login.html';
  });
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const profile = getStudentProfile();

    if (!profile) {
      alert('No student account found. Please sign up first.');
      return;
    }

    if (profile.email === email && profile.password === password) {
      alert('Login successful!');
      window.location.href = 'update-profile.html';
    } else {
      alert('Invalid email or password.');
    }
  });
}

const updateProfileForm = document.getElementById('updateProfileForm');
if (updateProfileForm) {
  const profile = getStudentProfile();

  if (profile) {
    document.getElementById('updateFirstName').value = profile.firstName || '';
    document.getElementById('updateLastName').value = profile.lastName || '';
    document.getElementById('updateEmail').value = profile.email || '';
    document.getElementById('updatePhone').value = profile.phone || '';
    document.getElementById('updateCourse').value = profile.course || '';
    document.getElementById('updateAddress').value = profile.address || '';
  }

  renderClubEvents();

  updateProfileForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const updatedProfile = {
      ...getStudentProfile(),
      firstName: document.getElementById('updateFirstName').value,
      lastName: document.getElementById('updateLastName').value,
      email: document.getElementById('updateEmail').value,
      phone: document.getElementById('updatePhone').value,
      course: document.getElementById('updateCourse').value,
      address: document.getElementById('updateAddress').value,
    };

    saveStudentProfile(updatedProfile);

    const profileStatus = document.getElementById('profileStatus');
    if (profileStatus) {
      profileStatus.textContent = `Profile updated for ${updatedProfile.firstName || 'Student'}!`;
    }

    alert('Profile updated successfully!');
  });
}
