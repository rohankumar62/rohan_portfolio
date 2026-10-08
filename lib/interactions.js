export function initInteractions(scope) {
const {listen,IntersectionObserver,ResizeObserver,MutationObserver,requestAnimationFrame,cancelAnimationFrame}=scope;
const filters = document.querySelectorAll('[data-filter]');
filters.forEach(button => listen(button,'click', () => {
  filters.forEach(item => { item.classList.toggle('active', item === button); item.setAttribute('aria-pressed', String(item === button)); });
  let visible = 0;
  document.querySelectorAll('[data-category]').forEach(card => { card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter; if (!card.hidden) visible++; });
  document.getElementById('filter-status').textContent = `${visible} expertise ${visible === 1 ? 'category' : 'categories'} shown`;
}));
// A single motion preference controls the 3D scene, floating labels and parallax.
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let motionEnabled = !motionQuery.matches;
const motionButton = document.getElementById('motion-toggle');
function setMotion(enabled) {
  motionEnabled = enabled;
  window.portfolioMotion = { enabled };
  document.body.classList.toggle('motion-paused', !enabled);
  motionButton.textContent = enabled ? 'Pause motion' : 'Enable motion';
  motionButton.setAttribute('aria-pressed', String(!enabled));
  window.dispatchEvent(new CustomEvent('portfolio-motion', { detail: { enabled } }));
}
setMotion(motionEnabled);
listen(motionButton,'click', () => setMotion(!motionEnabled));
listen(motionQuery,'change', event => setMotion(!event.matches));
const portraitStage = document.getElementById('portrait-stage');
listen(portraitStage,'pointermove', event => {
  if (!motionEnabled || event.pointerType !== 'mouse') return;
  const rect = portraitStage.getBoundingClientRect();
  portraitStage.style.setProperty('--tilt-x', `${((event.clientX-rect.left)/rect.width-.5)*6}deg`);
  portraitStage.style.setProperty('--tilt-y', `${-((event.clientY-rect.top)/rect.height-.5)*4}deg`);
});
listen(portraitStage,'pointerleave', () => {
  portraitStage.style.setProperty('--tilt-x', '0deg');
  portraitStage.style.setProperty('--tilt-y', '0deg');
});
if ('IntersectionObserver' in window && motionEnabled) {
  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.remove('is-pending'); revealObserver.unobserve(entry.target); }
  }), { threshold: .08 });
  document.querySelectorAll('.reveal').forEach(element => { element.classList.add('is-pending'); revealObserver.observe(element); });
}

// Avoid a second WhatsApp action while the contact directory is on screen.
const contactSection = document.getElementById('contact');
const floatingWhatsApp = document.getElementById('floating-whatsapp');
if ('IntersectionObserver' in window) {
  new IntersectionObserver(entries => {
    floatingWhatsApp.hidden = entries[0].isIntersecting;
  }, { threshold: 0 }).observe(contactSection);
} else {
  const updateContactShortcut = () => {
    const rect = contactSection.getBoundingClientRect();
    floatingWhatsApp.hidden = rect.top < window.innerHeight && rect.bottom > 0;
  };
  listen(window,'scroll', updateContactShortcut, { passive: true });
  listen(window,'resize', updateContactShortcut);
  updateContactShortcut();
}

 scope.cleanup(() => { document.body.classList.remove("motion-paused"); document.querySelectorAll(".is-pending").forEach(el=>el.classList.remove("is-pending")); });

}
