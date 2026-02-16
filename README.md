# Weather Dashboard 🌦️
A dynamic, responsive weather application that provides real‑time weather data and 5‑day forecasts for any city worldwide. Built with vanilla JavaScript, Chart.js, and the OpenWeatherMap API.

# 🚀 Live Demos

* Netlify: https://abu-syed-excelerate-app.netlify.app

* GitHub Pages: https://plabon009.github.io/weather-app/



# ✨ Features

* Current Weather: Temperature, humidity, wind speed, pressure, and conditions

* 5‑Day Forecast: Daily min/max temperatures with chart and list views

* Location Search: Search any city; uses OpenWeatherMap API

* Geolocation: Automatically fetch weather for your current location

* Unit Toggle: Switch between Celsius (°C) and Fahrenheit (°F)

* Smart Caching: Avoids redundant API calls (data cached per city/unit)

* Local Storage: Remembers your last searched city and preferred unit

* Error Handling: User-friendly messages for invalid cities or network issues

* Fully Responsive: Works on mobile, tablet, and desktop


# 🛠️ Built With
HTML5, CSS3, JavaScript (ES6+)

OpenWeatherMap API

Chart.js for temperature charts

Font Awesome for icons

Hosted on Netlify & GitHub Pages



# 📡 API Endpoints Used

* Current Weather: https://api.openweathermap.org/data/2.5/weather?q={city}&units={unit}&appid={API_KEY}

* 5‑Day Forecast: https://api.openweathermap.org/data/2.5/forecast?q={city}&units={unit}&appid={API_KEY}

------------------------------------------------------------------------------------------------------------


# Instruction Methods for Weather Dashboard

## Method 1: Direct Download (Easiest)

Download the HTML file
* Go to your GitHub repository: https://github.com/plabon009/weather-app
* Click on index.html
* Click the "Raw" button
* Right-click anywhere on the page and select "Save As"
* Save it as index.html on your computer

Double-click to open
* Find the downloaded index.html file
* Double-click it
* It will open in your default web browser

Add your API key (if needed)
* Open the file with Notepad or any text editor
* Find const API_KEY = 'a3d9eb01d4de82b9b8d0849ef604dbed';
* Replace with your own OpenWeatherMap API key
* Save the file and refresh the browser

---------------------------------------------------------------
## Method 2: Download ZIP from GitHub

Go to the repository
* Visit: https://github.com/plabon009/weather-app

Download ZIP
* Click the green "Code" button
* Select "Download ZIP"
* Save the file to your computer

Extract the ZIP
* Right-click the downloaded ZIP file
* Select "Extract All" (Windows) or double-click (Mac)
* Choose a folder to extract to

Open the project
* Go to the extracted folder
* Double-click index.html
* It will open in your browser

------------------------------------------------------------------
## Method 3: Use Git Clone (For Developers)

Open Terminal/Command Prompt
* Windows: Press Win + R, type cmd, press Enter
* Mac: Open "Terminal" from Applications
* Clone the repository

git clone https://github.com/plabon009/weather-app.git

Navigate to the folder
* cd weather-app

Open the project
On Windows
* start index.html

On Mac
* open index.html

On Linux
* xdg-open index.html
