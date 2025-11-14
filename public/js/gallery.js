// Update main image and stats from a shelf item
const main = document.getElementById('mainImg');
const statTitle = document.getElementById('statTitle');
const statList = document.getElementById('statList');
const cards = document.querySelectorAll('.shelf .thumb-card');

function updateStatsFromCard(card) {
  const title = card.dataset.title || 'Product';
  const specs = (card.dataset.specs || '').split('|').filter(Boolean);
  if (statTitle) statTitle.textContent = title;

  if (statList) {
    statList.innerHTML = '';
    specs.forEach(s => {
      const li = document.createElement('li');
      li.textContent = s;
      statList.appendChild(li);
    });
  }
}

function setMain(src, card){
  if (!main) return;
  main.src = src;
  cards.forEach(c => { 
    c.classList.remove('active'); 
    c.setAttribute('aria-selected','false'); 
  });
  card.classList.add('active');
  card.setAttribute('aria-selected','true');
  updateStatsFromCard(card);
}

cards.forEach(card => {
  const large = card.getAttribute('data-large');
  card.addEventListener('mouseover', () => setMain(large, card));
  card.addEventListener('click', () => setMain(large, card));
});

// Shelf arrows (simple scroll)
const track = document.querySelector('.shelf-track');
const leftBtn = document.querySelector('.shelf-arrow.left');
const rightBtn = document.querySelector('.shelf-arrow.right');

function scrollByAmount(x){
  if (!track) return;
  track.scrollBy({ left: x, behavior: 'smooth' });
}
if (leftBtn) leftBtn.addEventListener('click', () => scrollByAmount(-300));
if (rightBtn) rightBtn.addEventListener('click', () => scrollByAmount(300));

// Mobile menu toggle (burger)
const menuBtn = document.querySelector('.menu-toggle');
const nav = document.getElementById('mainNav');
if (menuBtn && nav) {
  menuBtn.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
}

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
