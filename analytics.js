(() => {
  const GA_MEASUREMENT_ID = window.GA_MEASUREMENT_ID || "G-S78DHNBZVV";
  if (!/^G-[A-Z0-9]+$/.test(GA_MEASUREMENT_ID)) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  gtag("js", new Date());
  gtag("config", GA_MEASUREMENT_ID, { anonymize_ip: true });
})();
