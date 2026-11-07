// The root selects the reading language. Explicit English and region links keep theirs.
(() => {
  if (location.pathname !== '/') return;
  // A mobile visitor following the Russian home link has already chosen its language.
  if (matchMedia('(max-width:700px)').matches && document.referrer) {
    const previous = new URL(document.referrer);
    if (previous.origin === location.origin && !previous.pathname.startsWith('/en/')) return;
  }
  let language;
  try {
    language = localStorage.getItem('yuraseek-language');
  } catch {}
  if (language !== 'ru' && language !== 'en') {
    if (document.referrer && new URL(document.referrer).origin === location.origin) return;
    language = /^ru(?:-|$)/i.test(navigator.language || 'ru') ? 'ru' : 'en';
  }
  if (language === 'en') location.replace('/en/' + location.search + location.hash);
})();
