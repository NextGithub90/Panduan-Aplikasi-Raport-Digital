const progress = document.querySelector('.reading-progress span');
const sections = [...document.querySelectorAll('.guide-section')];
const sidebarNavLinks = [...document.querySelectorAll('.sidebar nav a')];
const search = document.querySelector('#guide-search');
const noResults = document.querySelector('#no-results');

const tocToggle = document.querySelector('#toc-toggle');
const tocDrawer = document.querySelector('#toc-drawer');
const tocBackdrop = document.querySelector('#toc-backdrop');
const tocClose = document.querySelector('#toc-close');
const tocSearch = document.querySelector('#toc-search');
const tocDrawerNav = document.querySelector('#toc-drawer-nav');
const tocEmpty = document.querySelector('#toc-empty');

[
  ['#top', 'Beranda panduan'],
  ['#alur-cepat', 'Alur cepat'],
  ['#contoh-tampilan', 'Contoh tampilan'],
  ['#panduan-lengkap', 'Panduan lengkap'],
].forEach(([href, label]) => {
  const link = document.createElement('a');
  link.href = href;
  link.textContent = label;
  link.className = 'toc-shortcut';
  tocDrawerNav.append(link);
});

const chapterLabel = document.createElement('span');
chapterLabel.className = 'toc-group-label';
chapterLabel.textContent = 'Bab panduan';
tocDrawerNav.append(chapterLabel);
sidebarNavLinks.forEach((link) => tocDrawerNav.append(link.cloneNode(true)));

const drawerLinks = [...tocDrawerNav.querySelectorAll('a')];
const navLinks = [...sidebarNavLinks, ...drawerLinks];
let lastFocusedElement = null;

const setTocOpen = (open) => {
  document.body.classList.toggle('toc-open', open);
  tocToggle.setAttribute('aria-expanded', String(open));
  tocToggle.setAttribute('aria-label', open ? 'Tutup daftar isi' : 'Buka daftar isi');
  tocDrawer.setAttribute('aria-hidden', String(!open));
  tocBackdrop.setAttribute('aria-hidden', String(!open));

  if (open) {
    lastFocusedElement = document.activeElement;
    tocClose.focus();
  } else if (lastFocusedElement) {
    lastFocusedElement.focus();
  }
};

tocToggle.addEventListener('click', () => setTocOpen(!document.body.classList.contains('toc-open')));
tocClose.addEventListener('click', () => setTocOpen(false));
tocBackdrop.addEventListener('click', () => setTocOpen(false));
drawerLinks.forEach((link) => link.addEventListener('click', () => setTocOpen(false)));

tocSearch.addEventListener('input', () => {
  const query = tocSearch.value.trim().toLocaleLowerCase('id');
  let found = 0;
  drawerLinks.forEach((link) => {
    const matches = !query || link.textContent.toLocaleLowerCase('id').includes(query);
    link.hidden = !matches;
    if (matches) found += 1;
  });
  tocEmpty.hidden = found !== 0;
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && document.body.classList.contains('toc-open')) {
    setTocOpen(false);
    return;
  }

  if (event.key !== 'Tab' || !document.body.classList.contains('toc-open')) return;
  const focusable = [...tocDrawer.querySelectorAll('button, input, a:not([hidden])')];
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

const updateProgress = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
};
addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

const observer = new IntersectionObserver((entries) => {
  const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  navLinks.forEach((link) => link.classList.toggle('active', link.hash === `#${visible.target.id}`));
}, { rootMargin: '-15% 0px -70%', threshold: [0, .2, .6] });
sections.forEach((section) => observer.observe(section));

search.addEventListener('input', () => {
  const query = search.value.trim().toLocaleLowerCase('id');
  let found = 0;
  sections.forEach((section) => {
    const matches = !query || section.textContent.toLocaleLowerCase('id').includes(query);
    section.hidden = !matches;
    if (matches) found += 1;
  });
  noResults.hidden = found !== 0;
});

const checkboxes = [...document.querySelectorAll('.checklist input')];
checkboxes.forEach((box, index) => {
  const key = `raport-guide-check-${index}`;
  box.checked = localStorage.getItem(key) === '1';
  box.addEventListener('change', () => localStorage.setItem(key, box.checked ? '1' : '0'));
});

document.querySelector('#print-guide').addEventListener('click', () => print());

const lightbox = document.querySelector('#lightbox');
const lightboxImage = lightbox.querySelector('img');
document.querySelectorAll('.shot-button').forEach((button) => {
  button.addEventListener('click', () => {
    const source = button.querySelector('img');
    lightboxImage.src = source.src;
    lightboxImage.alt = source.alt;
    lightbox.showModal();
  });
});
lightbox.querySelector('button').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', (event) => { if (event.target === lightbox) lightbox.close(); });
