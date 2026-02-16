(function() {
    // ---------- Configuration ----------
    const API_KEY = 'a3d9eb01d4de82b9b8d0849ef604dbed';   // Replace with your key
    const BASE_URL = 'https://api.openweathermap.org/data/2.5';

    // DOM elements
    const cityInput = document.getElementById('cityInput');
    const unitBtns = document.querySelectorAll('.unit-btn');
    const viewBtns = document.querySelectorAll('[data-view]');
    const chartView = document.getElementById('chartView');
    const listView = document.getElementById('listView');
    const currentWeatherDiv = document.getElementById('currentWeather');
    const errorDiv = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const cacheInfo = document.getElementById('cacheText');
    const refreshBtn = document.getElementById('refreshBtn');
    const ctx = document.getElementById('forecastChart').getContext('2d');

    // ---------- State ----------
    let currentUnit = 'metric';           // 'metric' or 'imperial'
    let currentCity = 'Dhaka';
    let chartInstance = null;

    // Cache (in‑memory + localStorage for preferences)
    let lastFetchCity = '';
    let lastFetchUnit = '';
    let cachedWeather = null;              // current weather data
    let cachedForecast = null;              // forecast list

    // ---------- localStorage ----------
    function loadPreferences() {
        const savedCity = localStorage.getItem('pref_city');
        const savedUnit = localStorage.getItem('pref_unit');
        if (savedCity) {
            currentCity = savedCity;
            cityInput.value = savedCity;
        }
        if (savedUnit && (savedUnit === 'metric' || savedUnit === 'imperial')) {
            currentUnit = savedUnit;
            updateUnitButtons();
        }
    }

    function savePreferences() {
        localStorage.setItem('pref_city', currentCity);
        localStorage.setItem('pref_unit', currentUnit);
    }

    function updateUnitButtons() {
        unitBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.unit === currentUnit);
        });
    }

    // ---------- UI Helpers ----------
    function showLoading() {
        loadingOverlay.classList.add('show');
    }

    function hideLoading() {
        loadingOverlay.classList.remove('show');
    }

    function showError(message) {
        errorText.textContent = message;
        errorDiv.classList.add('show');
    }

    function hideError() {
        errorDiv.classList.remove('show');
    }

    function updateCacheInfo(usedCache) {
        cacheInfo.textContent = usedCache ? 'Cached data' : 'Live data';
    }

    // ---------- Data fetching with conditional strategy ----------
    async function fetchWeatherData(forceRefresh = false) {
        // Check if we already have cached data for same city & unit
        const city = currentCity.trim();
        if (!city) {
            showError('Please enter a city name.');
            return;
        }

        // If not forced refresh and we have cached data for same city/unit, use it
        if (!forceRefresh && lastFetchCity === city && lastFetchUnit === currentUnit && cachedWeather && cachedForecast) {
            console.log('Using cached data');
            updateCacheInfo(true);
            displayCurrentWeather(cachedWeather);
            processForecast(cachedForecast);
            hideError();
            return;
        }

        // Otherwise fetch new data
        showLoading();
        hideError();
        updateCacheInfo(false);

        try {
            const weatherUrl = `${BASE_URL}/weather?q=${city}&units=${currentUnit}&appid=${API_KEY}`;
            const forecastUrl = `${BASE_URL}/forecast?q=${city}&units=${currentUnit}&appid=${API_KEY}`;

            const [weatherRes, forecastRes] = await Promise.all([
                fetch(weatherUrl),
                fetch(forecastUrl)
            ]);

            // Handle specific HTTP errors
            if (!weatherRes.ok) {
                if (weatherRes.status === 404) throw new Error(`City "${city}" not found.`);
                if (weatherRes.status === 401) throw new Error('Invalid API key. Please check your key.');
                if (weatherRes.status === 429) throw new Error('Rate limit exceeded. Please try later.');
                throw new Error(`Weather API error: ${weatherRes.status}`);
            }

            if (!forecastRes.ok) {
                throw new Error(`Forecast API error: ${forecastRes.status}`);
            }

            const weatherData = await weatherRes.json();
            const forecastData = await forecastRes.json();

            // Update cache
            cachedWeather = weatherData;
            cachedForecast = forecastData;
            lastFetchCity = city;
            lastFetchUnit = currentUnit;

            // Save city to localStorage (preference)
            currentCity = city;
            savePreferences();

            // Update UI
            displayCurrentWeather(weatherData);
            processForecast(forecastData);
        } catch (error) {
            console.error('Fetch error:', error);
            showError(error.message);
            // Optionally fall back to cached data if available
            if (cachedWeather && cachedForecast) {
                displayCurrentWeather(cachedWeather);
                processForecast(cachedForecast);
                updateCacheInfo(true);
            } else {
                // Clear previous content
                currentWeatherDiv.innerHTML = '<p style="color:white;">No data available</p>';
            }
        } finally {
            hideLoading();
        }
    }

    // ---------- Display current weather ----------
    function displayCurrentWeather(data) {
        const tempUnit = currentUnit === 'metric' ? '°C' : '°F';
        const speedUnit = currentUnit === 'metric' ? 'km/h' : 'mph';
        const windSpeed = currentUnit === 'metric'
            ? Math.round(data.wind.speed * 3.6)
            : Math.round(data.wind.speed * 2.237);

        const date = new Date().toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });

        const iconClass = getWeatherIcon(data.weather[0].icon);

        currentWeatherDiv.innerHTML = `
            <div style="flex:1;">
                <h2>${data.name}, ${data.sys.country}</h2>
                <div class="date">${date}</div>
                <div class="condition">
                    <i class="${iconClass}"></i>
                    <span>${data.weather[0].description}</span>
                </div>
            </div>
            <div style="text-align:right;">
                <div class="temp-main">${Math.round(data.main.temp)}${tempUnit}</div>
                <div>Feels like ${Math.round(data.main.feels_like)}${tempUnit}</div>
            </div>
            <div class="details">
                <div class="detail-item"><i class="fas fa-droplet"></i> <span>${data.main.humidity}%</span></div>
                <div class="detail-item"><i class="fas fa-wind"></i> ${windSpeed} ${speedUnit}</div>
                <div class="detail-item"><i class="fas fa-compress-alt"></i> ${data.main.pressure} hPa</div>
                <div class="detail-item"><i class="fas fa-eye"></i> ${(data.visibility/1000).toFixed(1)} km</div>
            </div>
        `;
    }

    // ---------- Process forecast (for chart & list) ----------
    function processForecast(data) {
        // Group by day (simple: take one per day at 12:00)
        const dailyMap = new Map();
        data.list.forEach(item => {
            const date = new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short', month:'short', day:'numeric' });
            if (!dailyMap.has(date)) {
                dailyMap.set(date, {
                    max: item.main.temp_max,
                    min: item.main.temp_min,
                    icon: item.weather[0].icon,
                    desc: item.weather[0].description
                });
            } else {
                const existing = dailyMap.get(date);
                existing.max = Math.max(existing.max, item.main.temp_max);
                existing.min = Math.min(existing.min, item.main.temp_min);
            }
        });

        const labels = [...dailyMap.keys()].slice(0,5);
        const maxTemps = labels.map(d => Math.round(dailyMap.get(d).max));
        const minTemps = labels.map(d => Math.round(dailyMap.get(d).min));
        const icons = labels.map(d => dailyMap.get(d).icon);
        const descs = labels.map(d => dailyMap.get(d).desc);

        updateChart(labels, maxTemps, minTemps);
        updateListView(labels, maxTemps, minTemps, icons, descs);
    }

    function updateChart(labels, maxTemps, minTemps) {
        if (chartInstance) chartInstance.destroy();

        const tempUnit = currentUnit === 'metric' ? '°C' : '°F';
        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    { label: `Max (${tempUnit})`, data: maxTemps, borderColor: '#ef4444', backgroundColor: 'transparent', tension:0.3, pointBackgroundColor:'#ef4444' },
                    { label: `Min (${tempUnit})`, data: minTemps, borderColor: '#10b981', backgroundColor: 'transparent', tension:0.3, pointBackgroundColor:'#10b981' }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { tooltip: { mode:'index', intersect:false } }
            }
        });
    }

    function updateListView(labels, maxTemps, minTemps, icons, descs) {
        const tempUnit = currentUnit === 'metric' ? '°C' : '°F';
        listView.innerHTML = labels.map((date,i) => `
            <div class="forecast-card">
                <div style="font-weight:600;">${date.split(',')[0]}</div>
                <div style="font-size:0.8rem; color:#64748b;">${date.split(',').slice(1).join(',')}</div>
                <i class="${getWeatherIcon(icons[i])}" style="font-size:2rem; margin:0.5rem 0;"></i>
                <div><span style="color:#ef4444;">${maxTemps[i]}${tempUnit}</span> / <span style="color:#10b981;">${minTemps[i]}${tempUnit}</span></div>
                <div style="font-size:0.8rem; color:#64748b;">${descs[i]}</div>
            </div>
        `).join('');
    }

    // Weather icon mapping
    function getWeatherIcon(iconCode) {
        const map = {
            '01d':'fas fa-sun','01n':'fas fa-moon',
            '02d':'fas fa-cloud-sun','02n':'fas fa-cloud-moon',
            '03d':'fas fa-cloud','03n':'fas fa-cloud',
            '04d':'fas fa-cloud','04n':'fas fa-cloud',
            '09d':'fas fa-cloud-rain','09n':'fas fa-cloud-rain',
            '10d':'fas fa-cloud-sun-rain','10n':'fas fa-cloud-moon-rain',
            '11d':'fas fa-cloud-bolt','11n':'fas fa-cloud-bolt',
            '13d':'fas fa-snowflake','13n':'fas fa-snowflake',
            '50d':'fas fa-smog','50n':'fas fa-smog'
        };
        return map[iconCode] || 'fas fa-cloud';
    }

    // ---------- View toggle ----------
    function setView(view) {
        viewBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.view === view));
        if (view === 'chart') {
            chartView.style.display = 'block';
            listView.style.display = 'none';
        } else {
            chartView.style.display = 'none';
            listView.style.display = 'grid';
        }
    }

    // ---------- Event listeners ----------
    cityInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') {
            currentCity = cityInput.value.trim();
            fetchWeatherData(true);  // force refresh on explicit search
        }
    });

    unitBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const newUnit = btn.dataset.unit;
            if (newUnit === currentUnit) return;
            currentUnit = newUnit;
            updateUnitButtons();
            savePreferences();
            // If we have cached data for the new unit? No, different unit requires new fetch.
            // But we can fetch without force if city same
            fetchWeatherData(false);
        });
    });

    refreshBtn.addEventListener('click', () => {
        fetchWeatherData(true);
    });

    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => setView(btn.dataset.view));
    });

    // ---------- Initialisation ----------
    loadPreferences();
    setView('chart');
    // Try to load from cache on startup
    fetchWeatherData(false).then(() => {
        // Ensure we save preferences after first successful load
        savePreferences();
    });
})();