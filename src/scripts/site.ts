const root = document.documentElement;
const themeButton = document.querySelector<HTMLButtonElement>('.theme-toggle');
function updateThemeLabel() {
  if (!themeButton) return;
  const dark = root.dataset.theme === 'dark';
  themeButton.setAttribute('aria-label', (dark ? themeButton.dataset.lightLabel : themeButton.dataset.darkLabel)!);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#102c22' : '#f8f4ea');
}
updateThemeLabel();
themeButton?.addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('theme', root.dataset.theme); } catch { /* Theme still works without storage. */ }
  updateThemeLabel();
});
const menuButton = document.querySelector<HTMLButtonElement>('.menu-toggle');
const menu = document.querySelector<HTMLElement>('#mobile-menu');
function closeMenu() {
  if (!menu || !menuButton) return;
  menu.hidden = true; menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', menuButton.dataset.openLabel!);
}
menuButton?.addEventListener('click', () => {
  if (!menu) return;
  const expanded=menuButton.getAttribute('aria-expanded')==='true';
  menu.hidden=expanded; menuButton.setAttribute('aria-expanded', String(!expanded));
  menuButton.setAttribute('aria-label', (expanded?menuButton.dataset.openLabel:menuButton.dataset.closeLabel)!);
});
menu?.querySelectorAll('a').forEach(link=>link.addEventListener('click', closeMenu));
document.addEventListener('keydown', e=>{if(e.key==='Escape'&&menu&&!menu.hidden){closeMenu();menuButton?.focus();}});
function updateLanguageLinks() {
  document.querySelectorAll<HTMLAnchorElement>('[data-language-link]').forEach(link=>{link.hash=location.hash;});
}
updateLanguageLinks();window.addEventListener('hashchange',updateLanguageLinks);
const contactBar=document.querySelector<HTMLElement>('.mobile-contact');
document.addEventListener('focusin',e=>{if(contactBar&&e.target instanceof Element&&e.target.closest('form'))contactBar.hidden=true;});
document.addEventListener('focusout',()=>{if(contactBar)requestAnimationFrame(()=>{contactBar.hidden=!!document.activeElement?.closest('form');});});
