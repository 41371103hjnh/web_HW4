
// Mobile nav
const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('[data-nav]');
if (toggle && nav){
  toggle.addEventListener('click', ()=>{
    const open = nav.getAttribute('data-open') === 'true';
    nav.setAttribute('data-open', String(!open));
    toggle.setAttribute('aria-expanded', String(!open));
  });
}

// Year
const y = document.getElementById('year');
if (y) y.textContent = new Date().getFullYear();

document.addEventListener('DOMContentLoaded', () => {
  const hero = document.querySelector('[data-hero-img]');
  if (hero) hero.src = 'assets/home/sea.jpg';

  mountSlider('[data-about-track]', [
    'assets/about_me/mirror.jpg',
    'assets/about_me/IMG_5258.jpg',
    'assets/about_me/IMG_5726.jpg',
  ]);

  mountSlider('[data-dance-track]', [
    'assets/dance/IMG_2378.JPG',
    'assets/dance/IMG_2379.JPG',
    'assets/dance/DSC00808.JPEG',
    'assets/dance/DSC06483.JPEG',
    'assets/dance/DSC06329_Original.JPG',
    'assets/dance/IMG_4634.JPG',
  ]);
  mountSlider('[data-family-track]', [
    'assets/family/IMG_8594.JPG',
    'assets/family/IMG_3703.jpg',
    'assets/family/IMG_2799.jpg',
    'assets/family/IMG_2768.jpg',
    'assets/family/IMG_1496.JPG',
  ]);
  mountSlider('[data-friends-track]', [
    'assets/friends/IMG_7249.JPG',
    'assets/friends/IMG_8044.JPG',
    'assets/friends/IMG_5107.PNG',
    'assets/friends/IMG_0658.jpg',
    'assets/friends/IMG_6130.jpg',
  ]);
  mountSlider('[data-japan-track]', [
    'assets/japan/IMG_6576.JPG',
    'assets/japan/IMG_2256.jpg',
    'assets/japan/IMG_2902.jpg',
    'assets/japan/IMG_3247.jpg',
    'assets/japan/IMG_6157.JPG',
    'assets/japan/IMG_6167.JPG',
    'assets/japan/IMG_6272.JPG',
    'assets/japan/IMG_6563.JPG',
  ]);

  mountCards('[data-design-grid]', [
    'assets/design_sketching/project1.JPG',
    'assets/design_sketching/project2.JPG',
    'assets/design_sketching/project3.JPG',
    'assets/design_sketching/project4.JPG',
    'assets/design_sketching/project5.JPG',
    'assets/design_sketching/project6.JPG',
  ]);
  mountCards('[data-basic-grid]', [
    'assets/basic_design/IMG_7343.JPG',
    'assets/basic_design/Wood Handmade Craft Presentation.jpg',
  ]);
});

function mountSlider(trackSelector, srcList){
  const track = document.querySelector(trackSelector);
  if (!track) return;
  track.innerHTML = '';
  srcList.forEach(src => {
    const slide = document.createElement('div');
    slide.className = 'slider__slide';
    const img = document.createElement('img');
    img.loading = 'lazy';
    img.src = src;
    slide.appendChild(img);
    track.appendChild(slide);
  });
  const root = track.closest('[data-slider]');
  if (root) initSlider(root);
}

function mountCards(gridSelector, srcList){
  const grid = document.querySelector(gridSelector);
  if (!grid) return;
  grid.innerHTML = '';
  srcList.forEach(src => {
    const card = document.createElement('article');
    card.className = 'card';
    const img = document.createElement('img');
    img.loading = 'lazy';
    img.src = src;
    card.appendChild(img);
    grid.appendChild(card);
  });
}

// Generic slider
document.querySelectorAll('[data-slider]').forEach(initSlider);
function initSlider(root){
  const track = root.querySelector('.slider__track');
  if (!track) return;
  const btnPrev = root.querySelector('[data-prev]');
  const btnNext = root.querySelector('[data-next]');
  let index = 0;
  const refresh = () => {
    const count = track.children.length;
    if (!count) return;
    index = Math.max(0, Math.min(index, count-1));
    track.style.transform = `translateX(${-index * 100}%)`;
    if (btnPrev) btnPrev.disabled = (index === 0);
    if (btnNext) btnNext.disabled = (index === track.children.length - 1);
  };
  btnPrev?.addEventListener('click', ()=>{ index--; refresh(); });
  btnNext?.addEventListener('click', ()=>{ index++; refresh(); });
  window.addEventListener('resize', refresh);
  refresh();
}

// Contact → Gmail compose
const form = document.getElementById('contactForm');
form?.addEventListener('submit', (e)=>{
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();
  const to = 'jiaen.ho.06@gmail.com';
  const subject = encodeURIComponent(`Website contact from ${name || 'Someone'}`);
  const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
  const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`;
  window.open(gmail, '_blank', 'noopener');
});

// Toy Description 文字輪播
document.addEventListener('DOMContentLoaded', () => {
  const toyBox   = document.querySelector('[data-toy]');
  const prevBtn  = document.querySelector('[data-toy-prev]');
  const nextBtn  = document.querySelector('[data-toy-next]');
  const idxEl    = document.querySelector('[data-toy-index]');
  const totalEl  = document.querySelector('[data-toy-total]');

  if (toyBox && prevBtn && nextBtn && idxEl && totalEl) {
    const slides = Array.from(toyBox.querySelectorAll('p'));
    const total = slides.length;
    let i = 0;

    function render() {
      slides.forEach((p, k) => {
        p.classList.toggle('is-active', k === i);
      });
      idxEl.textContent = String(i + 1);
      totalEl.textContent = String(total);
    }

    prevBtn.addEventListener('click', () => {
      i = (i - 1 + total) % total;  // 循環切換
      render();
    });

    nextBtn.addEventListener('click', () => {
      i = (i + 1) % total;
      render();
    });

    render(); // 初始化顯示第一段
  }
});
