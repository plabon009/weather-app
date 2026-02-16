Weather Dashboard 🌦️
A dynamic, responsive weather application that provides real‑time weather data and 5‑day forecasts for any city worldwide. Built with vanilla JavaScript, Chart.js, and the OpenWeatherMap API.

🚀 Live Demos
Netlify: https://abu-syed-excelerate-app.netlify.app

GitHub Pages: https://plabon009.github.io/weather-app/



✨ Features
Current Weather: Temperature, humidity, wind speed, pressure, and conditions

5‑Day Forecast: Daily min/max temperatures with chart and list views

Location Search: Search any city; uses OpenWeatherMap API

Geolocation: Automatically fetch weather for your current location

Unit Toggle: Switch between Celsius (°C) and Fahrenheit (°F)

Smart Caching: Avoids redundant API calls (data cached per city/unit)

Local Storage: Remembers your last searched city and preferred unit

Error Handling: User-friendly messages for invalid cities or network issues

Fully Responsive: Works on mobile, tablet, and desktop


🛠️ Built With
HTML5, CSS3, JavaScript (ES6+)

OpenWeatherMap API

Chart.js for temperature charts

Font Awesome for icons

Hosted on Netlify & GitHub Pages



📡 API Endpoints Used
Current Weather: https://api.openweathermap.org/data/2.5/weather?q={city}&units={unit}&appid={API_KEY}

5‑Day Forecast: https://api.openweathermap.org/data/2.5/forecast?q={city}&units={unit}&appid={API_KEY}
