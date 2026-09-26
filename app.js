const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';
const GEOCODING_API = 'https://geocoding-api.open-meteo.com/v1/search';

const state = {
  location: loadLocation(),
  weather: null,
  page: 'home'
};

const app = document.getElementById('app');
const locationLabel = document.getElementById('locationLabel');
const locationButton = document.getElementById('locationButton');
const locationModal = document.getElementById('locationModal');
const locationForm = document.getElementById('locationForm');
const citySearch = document.getElementById('citySearch');
const locationResults = document.getElementById('locationResults');
const closeLocation = document.getElementById('closeLocation');
const useGps = document.getElementById('useGps');
const toast = document.getElementById('toast');

const weatherText = {
  0: ['Klar', '☀️'],
  1: ['Überwiegend klar', '🌤️'],
  2: ['Teilweise bewölkt', '⛅'],
  3: ['Bedeckt', '☁️'],
  45: ['Nebel', '🌫️'],
  48: ['Reifnebel', '🌫️'],
  51: ['Leichter Nieselregen', '🌦️'],
  53: ['Nieselregen', '🌦️'],
  55: ['Starker Nieselregen', '🌧️'],
  56: ['Gefrierender Nieselregen', '🌧️'],
  57: ['Starker gefrierender Nieselregen', '🌧️'],
  61: ['Leichter Regen', '🌦️'],
  63: ['Regen', '🌧️'],
  65: ['Starker Regen', '🌧️'],
  66: ['Gefrierender Regen', '🌧️'],
  67: ['Starker gefrierender Regen', '🌧️'],
  71: ['Leichter Schneefall', '🌨️'],
  73: ['Schneefall', '🌨️'],
  75: ['Starker Schneefall', '❄️'],
  77: ['Schneekörner', '❄️'],
  80: ['Leichte Regenschauer', '🌦️'],
  81: ['Regenschauer', '🌧️'],
  82: ['Starke Regenschauer', '🌧️'],
  85: ['Leichte Schneeschauer', '🌨️'],
  86: ['Starke Schneeschauer', '🌨️'],
  95: ['Gewitter', '⛈️'],
  96: ['Gewitter mit Hagel', '⛈️'],
  99: ['Starkes Gewitter mit Hagel', '⛈️']
};

function loadLocation() {
  try {
    const raw = localStorage.getItem('wetterCoachLocation');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveLocation(location) {
  state.location = location;
  localStorage.setItem('wetterCoachLocation', JSON.stringify(location));
  updateLocationLabel();
}

function updateLocationLabel() {
  locationLabel.textContent = state.location?.name || 'Standort';
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatDate(dateString, options = { weekday: 'long', day: '2-digit', month: '2-digit' }) {
  return new Intl.DateTimeFormat('de-DE', options).format(new Date(`${dateString}T12:00:00`));
}

function formatHour(dateString) {
  return new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' }).format(new Date(dateString));
}

function formatDayShort(dateString) {
  return new Intl.DateTimeFormat('de-DE', { weekday: 'short' }).format(new Date(`${dateString}T12:00:00`));
}

function weatherInfo(code) {
  return weatherText[Number(code)] || ['Unbekannt', '🌡️'];
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 2300);
}

function openLocationModal() {
  locationModal.classList.remove('hidden');
  locationModal.setAttribute('aria-hidden', 'false');
  window.setTimeout(() => citySearch.focus(), 50);
}

function closeLocationModal() {
  locationModal.classList.add('hidden');
  locationModal.setAttribute('aria-hidden', 'true');
  locationResults.innerHTML = '';
}

function renderHome() {
  state.page = 'home';
  app.innerHTML = `
    <section class="page-title">
      <div class="eyebrow">DEIN WETTER</div>
      <h1>Heute im Blick</h1>
    </section>
    <section class="home-grid">
      <button class="tile" type="button" data-page="today">
        <div class="tile-icon">☀️</div>
        <div class="tile-arrow">›</div>
        <h2>Wetter heute</h2>
        <p>Stündliche Wettervorhersage für den kompletten heutigen Tag.</p>
      </button>
      <button class="tile" type="button" data-page="week">
        <div class="tile-icon">📅</div>
        <div class="tile-arrow">›</div>
        <h2>Wochenübersicht</h2>
        <p>Wetter, Temperaturen und Regenwahrscheinlichkeit für die nächsten 7 Tage.</p>
      </button>
    </section>
    <section class="panel" style="margin-top:16px; padding:15px 18px;">
      <div class="section-head" style="padding:0 0 10px; border-bottom:0;">
        <h2>Standort</h2>
        <span>${escapeHtml(state.location?.name || 'Noch nicht festgelegt')}</span>
      </div>
      <div style="font-size:12px; color:var(--muted); line-height:1.55;">
        Der Standort wird nur auf diesem Gerät gespeichert. Über „Standort“ oben kannst du eine Stadt suchen oder den GPS-Standort verwenden.
      </div>
    </section>`;

  app.querySelectorAll('[data-page]').forEach(button => {
    button.addEventListener('click', async () => openPage(button.dataset.page));
  });
}

function pageHeader(title, subtitle) {
  return `
    <section class="page-title">
      <div class="page-nav">
        <button class="back-button" type="button" id="backHome" aria-label="Zurück">‹</button>
        <div class="page-heading">
          <h1>${escapeHtml(title)}</h1>
          <p>${escapeHtml(subtitle)}</p>
        </div>
      </div>
    </section>`;
}

function renderLoading(title) {
  app.innerHTML = `${pageHeader(title, state.location?.name || 'Standort')}
    <section class="panel loading"><div class="spinner"></div><strong>Wetterdaten werden geladen …</strong></section>`;
  document.getElementById('backHome').addEventListener('click', renderHome);
}

function renderError(title, message) {
  app.innerHTML = `${pageHeader(title, state.location?.name || 'Standort')}
    <section class="panel error-panel">
      <h2>Wetterdaten nicht verfügbar</h2>
      <p>${escapeHtml(message)}</p>
      <button class="primary-button" type="button" id="retry">Erneut versuchen</button>
    </section>`;
  document.getElementById('backHome').addEventListener('click', renderHome);
  document.getElementById('retry').addEventListener('click', () => openPage(state.page));
}

function renderToday() {
  const today = state.weather?.daily?.time?.[0];
  if (!today) return;
  const hourly = state.weather.hourly;
  const hours = hourly.time
    .map((time, index) => ({
      time,
      temp: hourly.temperature_2m[index],
      rain: hourly.precipitation_probability?.[index],
      code: hourly.weather_code[index]
    }))
    .filter(item => item.time.startsWith(today));

  const currentHour = new Date().getHours();
  const todayIndex = 0;
  const info = weatherInfo(state.weather.daily.weather_code[todayIndex]);
  const high = state.weather.daily.temperature_2m_max[todayIndex];
  const low = state.weather.daily.temperature_2m_min[todayIndex];

  app.innerHTML = `${pageHeader('Wetter heute', formatDate(today, { weekday: 'long', day: '2-digit', month: 'long' }))}
    <section class="panel summary-card">
      <div>
        <div class="summary-label">HEUTE</div>
        <div class="summary-temp">${Math.round(state.weather.current?.temperature_2m ?? hourly.temperature_2m[0])}°</div>
        <div class="summary-desc">${escapeHtml(info[0])}</div>
        <div class="summary-meta">Tageshöchstwert ${Math.round(high)}° · Tiefstwert ${Math.round(low)}°</div>
      </div>
      <div class="big-weather-icon" aria-hidden="true">${info[1]}</div>
    </section>
    <section class="panel">
      <div class="section-head"><h2>Stundenübersicht</h2><span>${hours.length} Stunden</span></div>
      <div class="hour-list">
        ${hours.map((item) => {
          const h = new Date(item.time).getHours();
          const w = weatherInfo(item.code);
          const rainText = Number.isFinite(item.rain) ? `${Math.round(item.rain)}%` : '–';
          return `<div class="hour-row ${h === currentHour ? 'current' : ''}">
            <div class="hour-time">${String(h).padStart(2, '0')}:00</div>
            <div class="hour-icon">${w[1]}</div>
            <div class="hour-desc">${escapeHtml(w[0])}</div>
            <div class="hour-temp">${Math.round(item.temp)}°</div>
            <div class="rain">💧 ${rainText}</div>
          </div>`;
        }).join('')}
      </div>
    </section>`;
  document.getElementById('backHome').addEventListener('click', renderHome);
}

function renderWeek() {
  const daily = state.weather.daily;
  app.innerHTML = `${pageHeader('Wochenübersicht', 'Die nächsten 7 Tage')}
    <section class="panel">
      <div class="section-head"><h2>7-Tage-Prognose</h2><span>${escapeHtml(state.location?.name || '')}</span></div>
      <div class="week-list">
        ${daily.time.slice(0, 7).map((date, i) => {
          const w = weatherInfo(daily.weather_code[i]);
          const rain = daily.precipitation_probability_max?.[i];
          const rainText = Number.isFinite(rain) ? `${Math.round(rain)}% Regenwahrscheinlichkeit` : 'Keine Regenangabe';
          const dayLabel = i === 0 ? 'Heute' : formatDayShort(date);
          return `<div class="day-card">
            <div><div class="day-name">${escapeHtml(dayLabel)}</div><div class="day-date">${formatDate(date, { day: '2-digit', month: '2-digit' })}</div></div>
            <div class="day-icon">${w[1]}</div>
            <div><div class="day-desc">${escapeHtml(w[0])}</div><div class="day-rain">💧 ${escapeHtml(rainText)}</div></div>
            <div class="day-temps"><span class="min">${Math.round(daily.temperature_2m_min[i])}°</span>${Math.round(daily.temperature_2m_max[i])}°</div>
          </div>`;
        }).join('')}
      </div>
    </section>`;
  document.getElementById('backHome').addEventListener('click', renderHome);
}

async function fetchWeather() {
  if (!state.location) throw new Error('Bitte zuerst einen Standort festlegen.');
  const params = new URLSearchParams({
    latitude: state.location.latitude,
    longitude: state.location.longitude,
    timezone: 'auto',
    forecast_days: '7',
    current: 'temperature_2m,weather_code',
    hourly: 'temperature_2m,precipitation_probability,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,sunrise,sunset'
  });
  const response = await fetch(`${WEATHER_API}?${params.toString()}`, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Wetter-API antwortet mit HTTP ${response.status}.`);
  const data = await response.json();
  if (!data.hourly || !data.daily) throw new Error('Die Wetterdaten waren unvollständig.');
  return data;
}

async function openPage(page) {
  if (!state.location) {
    openLocationModal();
    showToast('Bitte zuerst einen Standort auswählen.');
    return;
  }
  state.page = page;
  renderLoading(page === 'today' ? 'Wetter heute' : 'Wochenübersicht');
  try {
    state.weather = await fetchWeather();
    if (page === 'today') renderToday(); else renderWeek();
  } catch (error) {
    renderError(page === 'today' ? 'Wetter heute' : 'Wochenübersicht', error.message || 'Unbekannter Fehler.');
  }
}

async function searchLocations(query) {
  const params = new URLSearchParams({ name: query, count: '8', language: 'de', format: 'json' });
  const response = await fetch(`${GEOCODING_API}?${params.toString()}`);
  if (!response.ok) throw new Error(`Ortssuche fehlgeschlagen (HTTP ${response.status}).`);
  return (await response.json()).results || [];
}

function renderLocationResults(results) {
  if (!results.length) {
    locationResults.innerHTML = '<div style="padding:8px 2px;color:var(--muted);font-size:12px;">Kein passender Ort gefunden.</div>';
    return;
  }
  locationResults.innerHTML = results.map((place, i) => {
    const parts = [place.name, place.admin1, place.country].filter(Boolean);
    return `<button type="button" class="location-result" data-result-index="${i}">
      <strong>${escapeHtml(place.name || 'Unbekannter Ort')}</strong>
      <span>${escapeHtml(parts.slice(1).join(', '))}</span>
    </button>`;
  }).join('');
  locationResults.querySelectorAll('[data-result-index]').forEach(button => {
    button.addEventListener('click', () => {
      const place = results[Number(button.dataset.resultIndex)];
      saveLocation({
        name: [place.name, place.admin1].filter(Boolean).join(', '),
        latitude: Number(place.latitude),
        longitude: Number(place.longitude),
        country: place.country
      });
      closeLocationModal();
      renderHome();
      showToast(`Standort: ${place.name}`);
    });
  });
}

function useGeolocation() {
  if (!navigator.geolocation) {
    showToast('GPS wird von diesem Gerät nicht unterstützt.');
    return;
  }
  useGps.disabled = true;
  useGps.textContent = 'Standort wird ermittelt …';
  navigator.geolocation.getCurrentPosition(
    position => {
      saveLocation({
        name: 'Mein Standort',
        latitude: Number(position.coords.latitude.toFixed(5)),
        longitude: Number(position.coords.longitude.toFixed(5))
      });
      useGps.disabled = false;
      useGps.textContent = 'Aktuellen Standort verwenden';
      closeLocationModal();
      renderHome();
      showToast('Aktueller Standort gespeichert.');
    },
    error => {
      useGps.disabled = false;
      useGps.textContent = 'Aktuellen Standort verwenden';
      showToast(error.code === 1 ? 'Standortzugriff wurde nicht erlaubt.' : 'Standort konnte nicht ermittelt werden.');
    },
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 15 * 60 * 1000 }
  );
}

locationButton.addEventListener('click', openLocationModal);
closeLocation.addEventListener('click', closeLocationModal);
locationModal.addEventListener('click', event => {
  if (event.target === locationModal) closeLocationModal();
});
useGps.addEventListener('click', useGeolocation);
locationForm.addEventListener('submit', async event => {
  event.preventDefault();
  const query = citySearch.value.trim();
  if (!query) return;
  locationResults.innerHTML = '<div class="loading" style="padding:20px 5px"><div class="spinner"></div><div style="font-size:12px">Suche Orte …</div></div>';
  try {
    const results = await searchLocations(query);
    renderLocationResults(results);
  } catch (error) {
    locationResults.innerHTML = `<div style="padding:8px 2px;color:var(--danger);font-size:12px;">${escapeHtml(error.message)}</div>`;
  }
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !locationModal.classList.contains('hidden')) closeLocationModal();
});

updateLocationLabel();
renderHome();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
