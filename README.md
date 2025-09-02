# 🌦️ Weather App (Lahore Example)

This is a simple weather application that fetches real-time weather data using the **Open-Meteo API**.  
It shows the current temperature, wind speed, and weather conditions for Lahore, Pakistan (or any other city by changing coordinates).

---

## 🚀 Features
- 🌡️ Get **current temperature** in Celsius
- 💨 Display **wind speed and direction**
- ☁️ Show **weather conditions** (clear, cloudy, rainy, etc.)
- 📍 Works with **any city** (just change latitude & longitude)

---

## 🛠️ Technologies Used
- **HTML** – For basic structure  
- **CSS** – For styling  
- **JavaScript (Fetch API)** – To call the weather API and update UI  

## How to Run

- Clone or download this project.

- Open index.html in your browser.

- weather data for Lahore will load automatically.

## 🌍 API Used
We are using [Open-Meteo](https://open-meteo.com/) which is **free** and does **not require an API key**.

Example API call for Lahore:
```bash
https://api.open-meteo.com/v1/forecast?latitude=31.5497&longitude=74.3436&current_weather=true
