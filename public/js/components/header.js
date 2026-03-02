// Header component

import { router } from '../router.js';

export function renderHeader() {
  const header = document.getElementById('header');

  header.innerHTML = `
    <div class="header-content">
      <div class="logo" data-link="/">StayBook</div>
      <nav>
        <ul>
          <li><a href="/" data-link>Hotels</a></li>
          <li><a href="/reservations" data-link>My Reservations</a></li>
        </ul>
      </nav>
    </div>
  `;

  // Add click handlers for navigation
  header.querySelectorAll('[data-link]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const path = link.getAttribute('href') || link.getAttribute('data-link');
      router.navigate(path);
    });
  });
}
