const apiKey =
  "https://api.open-meteo.com/v1/forecast?latitude=31.5497&longitude=74.3436&current_weather=true";
const API_BASE = "https://api.open-meteo.com/v1/forecast";

const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const statusBox = document.getElementById("status");
const currentTemp = document.getElementById("current-temp");
const currentDesc = document.getElementById("current-desc");
const currentIcon = document.getElementById("current-icon");
const locationName = document.getElementById("location-name");
const locationMeta = document.getElementById("location-meta");
const feelsLike = document.getElementById("feels-like");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const pressure = document.getElementById("pressure");
const uv = document.getElementById("uv");
const visibility = document.getElementById("visibility");
const hourlyList = document.getElementById("hourly-list");
const dailyGrid = document.getElementById("daily-grid");
const dataSourceLink = document.getElementById("data-source-link");

const unitToggle = document.getElementById("unit-toggle");
let units = "metric"; // default °C

async function geocodePlace(query) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    query
  )}&count=1&language=en&format=json`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.results || !data.results.length) {
    throw new Error("Location not found");
  }
  return data.results[0];
}

function getUnitSymbols() {
  return units === "metric"
    ? { temp: "°C", wind: "km/h" }
    : { temp: "°F", wind: "mph" };
}

async function fetchWeather(lat, lon) {
  const isMetric = units === "metric";
  const url = `${API_BASE}?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,weathercode&daily=temperature_2m_max,temperature_2m_min,weathercode&current_weather=true&timezone=auto${
    isMetric
      ? "&windspeed_unit=kmh&temperature_unit=celsius"
      : "&windspeed_unit=mph&temperature_unit=fahrenheit"
  }`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Weather fetch failed");
  return res.json();
}

const weatherMap = {
  0: { desc: "Clear sky", icon: "☀️" },
  1: { desc: "Mainly clear", icon: "🌤️" },
  2: { desc: "Partly cloudy", icon: "⛅" },
  3: { desc: "Overcast", icon: "☁️" },
  45: { desc: "Fog", icon: "🌫️" },
  48: { desc: "Rime fog", icon: "🌫️" },
  51: { desc: "Light drizzle", icon: "🌦️" },
  61: { desc: "Rain", icon: "🌧️" },
  71: { desc: "Snow", icon: "❄️" },
  95: { desc: "Thunderstorm", icon: "⛈️" },
};

function showStatus(msg, isError = false) {
  statusBox.textContent = msg;
  statusBox.className = isError ? "error" : "loading";
}

function clearStatus() {
  statusBox.textContent = "";
  statusBox.className = "";
}

function renderCurrent(data, place) {
  const current = data.current_weather;
  const sym = getUnitSymbols();
  const w = weatherMap[current.weathercode] || { desc: "Unknown", icon: "❓" };

  locationName.textContent = place.name;
  locationMeta.textContent = `${place.country}, ${place.admin1 || ""}`;
  currentTemp.textContent = `${Math.round(current.temperature)}${sym.temp}`;
  currentDesc.textContent = w.desc;
  currentIcon.src = "";
  currentIcon.alt = w.desc;
  currentIcon.textContent = w.icon;

  feelsLike.textContent = `${Math.round(current.temperature)}${sym.temp}`;
  humidity.textContent = `${data.hourly.relative_humidity_2m[0]}%`;
  wind.textContent = `${Math.round(current.windspeed)} ${sym.wind}`;
  pressure.textContent = "—"; // Open-Meteo free plan has no pressure
  uv.textContent = "—";
  visibility.textContent = "—";
}

function renderHourly(data) {
  hourlyList.innerHTML = "";
  const sym = getUnitSymbols();
  const now = new Date();
  data.hourly.time.slice(0, 24).forEach((t, i) => {
    const date = new Date(t);
    const hour = date.getHours();
    const wcode = data.hourly.weathercode[i];
    const w = weatherMap[wcode] || { icon: "❓" };
    const card = document.createElement("div");
    card.className = "hour-card";
    card.innerHTML = `<div class="hour">${hour}:00</div><div>${
      w.icon
    }</div><div class="h-temp">${Math.round(data.hourly.temperature_2m[i])}${
      sym.temp
    }</div>`;
    hourlyList.appendChild(card);
  });
}

function renderDaily(data) {
  dailyGrid.innerHTML = "";
  const sym = getUnitSymbols();
  data.daily.time.forEach((t, i) => {
    const date = new Date(t);
    const day = date.toLocaleDateString(undefined, { weekday: "short" });
    const wcode = data.daily.weathercode[i];
    const w = weatherMap[wcode] || { icon: "❓" };
    const item = document.createElement("div");
    item.className = "day-item";
    item.innerHTML = `<div class="d-day">${day}</div><div>${
      w.icon
    }</div><div class="d-range">${Math.round(
      data.daily.temperature_2m_min[i]
    )}${sym.temp} – ${Math.round(data.daily.temperature_2m_max[i])}${
      sym.temp
    }</div>`;
    dailyGrid.appendChild(item);
  });
}

async function handleSearch(e) {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (!query) return;
  try {
    showStatus("Loading...");
    const place = await geocodePlace(query);
    const data = await fetchWeather(place.latitude, place.longitude);
    clearStatus();
    renderCurrent(data, place);
    renderHourly(data);
    renderDaily(data);
    dataSourceLink.href = "https://open-meteo.com/";
    dataSourceLink.textContent = "Open‑Meteo";
  } catch (err) {
    showStatus(err.message, true);
  }
}

searchForm.addEventListener("submit", handleSearch);

unitToggle.addEventListener("change", (e) => {
  const selected = document.querySelector("input[name=units]:checked");
  units = selected.value;
  if (locationName.textContent && locationName.textContent !== "—") {
    handleSearch(new Event("submit"));
  }
});

// Optional: fetch default location on load
(async () => {
  try {
    const place = await geocodePlace("Lahore");
    const data = await fetchWeather(place.latitude, place.longitude);
    clearStatus();
    renderCurrent(data, place);
    renderHourly(data);
    renderDaily(data);
    dataSourceLink.href = "https://open-meteo.com/";
    dataSourceLink.textContent = "Open‑Meteo";
  } catch (err) {
    showStatus(err.message, true);
  }
})();
