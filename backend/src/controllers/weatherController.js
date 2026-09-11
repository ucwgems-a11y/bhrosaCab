/**
 * Weather Controller
 * Handles weather forecast integration with WeatherAPI.
 */

/**
 * Function 107: getWeatherForecast
 * PHP: eightyOne
 * Route: GET /api/weather-forcast-api
 */
exports.getWeatherForecast = async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ message: "Invalid Method" });
    }

    const city = req.query?.q || req.query?.city || "USA";
    const apiKey = process.env.WEATHER_API_KEY || "0fe30f741c7643c2a4e63235250402";
    const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(city)}&aqi=no`;

    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
      if (response.ok) {
        const data = await response.json();
        const temp_c = data?.current?.temp_c ?? null;
        const temp_f = data?.current?.temp_f ?? null;
        const condition = data?.current?.condition?.text ?? null;

        return res.status(200).json({
          temp_c,
          temp_f,
          condition,
        });
      } else {
        return res.status(500).json({
          error: "Unable to fetch weather data",
        });
      }
    } catch (fetchErr) {
      console.error("Weather fetch failed:", fetchErr.message);
      return res.status(500).json({
        error: "Unable to fetch weather data",
      });
    }
  } catch (ex) {
    console.error("getWeatherForecast error:", ex);
    return res.status(500).json({
      error: "Unable to fetch weather data",
    });
  }
};

