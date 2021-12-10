var searchHistory = [];
var weatherApiBaseUrl = 'https://api.openweathermap.org/';
var weatherApiKey = 'dfa21c069092f79b9e867621fc81e29b';

var city;
var cities = [];

$( document ).ready(function() {
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
        renderFutureForecast(weather.daily);
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
        var uviBtn = '';


        // check for UVI
        if (uvi < 3) {
            var uviBtn = 'uvi-btn uviFavorable disabled';
          } else if (uvi < 7) {
            var uviBtn = 'uvi-btn uviFModerate disabled';
          } else {
            var uviBtn = 'uvi-btn uviSevere disabled';
          }

        var currentForecast = [`<h2 id ="city-name">${cityName} (${today}) <img src=${weatherIcon} alt='${iconAlt}'></h2>`,
                                `<h4 id="currentTempF">Current Temp (F): ${currentTempF}</h4>`,
                                `<h4 id="currentHumidity">Current Humidity: ${currentHumidity}%</h4>`,
                                `<h4 id="windSpeedMph">Wind Speed (mph): ${windSpeedMph}</h4>`,
                                `<h4 id="uvi" class="${uviBtn}">UV Index: ${uvi}</h4>`
                            ];


        for (var i=0; i<currentForecast.length; i++) {
            $(currentForecast[i]).appendTo("#forecast-today");
        }
    }

    function renderFutureForecast(fiveDayForecast) {
        console.log("top of renderFutureForecast")
        var day1 = moment().add(1, "days").startOf('day').unix();
        var day6 = moment().add(6, "days").startOf('day').unix();

        $( "#divider" ).removeClass( "hidden" );

        for (var i=0; i<fiveDayForecast.length; i++) {
            if (fiveDayForecast[i].dt >= day1 && fiveDayForecast[i].dt < day6) {
                console.log(fiveDayForecast[i]);
                buildForecastCard(fiveDayForecast[i]);
              };
        };
    }

    function buildForecastCard(fiveDayForecast) {
        var dayDate = moment.unix(fiveDayForecast.dt).format('l');
        var icon = `https://openweathermap.org/img/w/${fiveDayForecast.weather[0].icon}.png`;
        var alt = fiveDayForecast.weather[0].description;
        var humidity = fiveDayForecast.humidity;
        var wind = fiveDayForecast.wind_speed;
        var temp = fiveDayForecast.temp.day;

        console.log(humidity);
        var cardName = `forecastCard-${fiveDayForecast.dt}`; // each card has a unique name

        $(`<div id= ${cardName} class="weatherCard m-1"> </div>`).appendTo(".forecastsCards"); 
        $(`<h5 id="forecastDate" class="text-center"> ${dayDate} </h5>`).appendTo(`#${cardName}`);
        $(`<img id= "icon" src=${icon} alt=${alt}>`).appendTo(`#${cardName}`);
        $(`<p id="forecastTemp"> Temp (F): ${temp} </p>`).appendTo(`#${cardName}`);
        $(`<p id="windMph"> Wind (mph): ${wind} </p>`).appendTo(`#${cardName}`);
        $(`<p id="humidity"> Humidity: ${humidity}% </p>`).appendTo(`#${cardName}`);
    }


})