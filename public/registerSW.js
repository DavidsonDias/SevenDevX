if ('serviceWorker' in navigator) {
  const register = () => {
    Promise.resolve(window.sevendevxApplicationReady)
      .then(() => navigator.serviceWorker.register('/sw.js', { scope: '/' }))
      .catch(error => console.error('SevenDevX: application or service worker startup failed', error));
  };
  if (document.readyState === 'complete') register();
  else window.addEventListener('load', register, { once: true });
}
