var searchHistory = [];
var weatherApiBaseUrl = 'https://api.openweathermap.org/';
var weatherApiKey = 'dfa21c069092f79b9e867621fc81e29b';

var city;
var cities = [];

$( document ).ready(function() {
    // current date
    var currentDate = moment().format('l');
    // dates for the next 5 days
    let day1 = moment().add(1, 'days').format('l');
    let day2 = moment().add(2, 'days').format('l');
    let day3 = moment().add(3, 'days').format('l');
    let day4 = moment().add(4, 'days').format('l');
    let day5 = moment().add(5, 'days').format('l');

    // Begin by taking care of the historical searches list
    //
    // Ability to save searches
    function saveRecentSearches () {
        cities.push(city);
        localStorage.setItem('cities', JSON.stringify(cities));
    }
    // Retrieve historical city searches
    function retrieveHistoricalSearches () {
        let recentCitySearches = JSON.parse(localStorage.getItem('cities'));
        // if there are recent searches, put them in the cities array
        if (recentCitySearches) {
            cities = recentCitySearches;
        } else {
            cities=[];
        }
    }
    retrieveHistoricalSearches();
    // Render recently searched cities to page
    function renderHistoricalSearches() {
        $("#historical-list").text("");
        cities.forEach((city) => {
            $("#historical-list").prepend("<button class='historical-btn btn'>" + city + "</button>");
        });
    }
    renderHistoricalSearches();

    // Now add search capabilities
    //
    // Event listener for search button (click, get the city, make the search, add to historical list)
    $("#submit-btn").on("click", (e) => {
        e.preventDefault();
        retrieveCity();
        fetchWeather();
        $("#city-search").val("");
        renderHistoricalSearches();
      });
    // Retrieve the input
    function retrieveCity () {
        city = $('#city-search').val();
        if (city && cities.includes(city) === false) {
            saveRecentSearches();
            return city;
        }
    };

    function fetchWeather () {
        // City call to get coords
        var geoCall = `${weatherApiBaseUrl}/geo/1.0/direct?q=${city}&appid=${weatherApiKey}`;

        
        console.log(geoCall);
        $.ajax({
            url: geoCall,
            method: "GET",
          }).then(function (response) {
              if (!response[0]) {
                  alert('Location not found');
              } else {
                  var {lat} = response[0];
                  var {lon} = response[0];
                  var cityName = response[0].name
                  // Use Openweather's onecall api to get weather info
                  var oneCall = `${weatherApiBaseUrl}/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=minutely,hourly&appid=${weatherApiKey}`;

                  console.log(oneCall);
                  $.ajax({
                      url: oneCall,
                      method: "GET",
                  }) .then(function (response) {
                      renderWeatherItems(cityName, response);
                  })
              }
            });
    };
    
    // Render the forecast cards
    function renderWeatherItems(cityName, weather) {
        renderCurrentForecast(cityName, weather.current);
    }

    function renderCurrentForecast(cityName, weather) {
        console.log(weather.weather[0].icon);
        var weatherIcon = `https://openweathermap.org/img/w/${weather.weather[0].icon}.png`;
        var iconAlt = weather.weather[0].description;
        var currentTempF = weather.temp;
        var windSpeedMph = weather.wind_speed;
        var uvi = weather.uvi;
        var currentHumidity = weather.humidity;
        var today = moment.unix(weather.dt).format('l');
        console.log(cityName, today);

        var currentForecast = [`<h2 id ="city-name">${cityName} (${today}) <img src=${weatherIcon} alt='${iconAlt}'></h2>`,
                                `<h4 id="currentTempF">Current Temp (F): ${currentTempF}</h4>`,
                                `<h4 id="currentHumidity">Current Humidity: ${currentHumidity}%</h4>`,
                                `<h4 id="windSpeedMph">Wind Speed (mph): ${windSpeedMph}</h4>`,
                                `<h4 id="uvi">UV Index: ${uvi}</h4>`
                            ];

        for (var i=0; i<currentForecast.length; i++) {
            $(currentForecast[i]).appendTo("#forecast-today");
        }



    }




})