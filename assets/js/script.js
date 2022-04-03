
var searchHistory = []
var lastCitySearched = "";

// api call 
var getCityWeather = function(city) {
    // format the OpenWeather api url
    var apiUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=eb1f5528e093e46e1671d62eca019668&units=imperial";

    // make a request to the url
    fetch(apiUrl)
        .then(function(response) {
        //successful
            if (response.ok) {
                response.json().then(function(data) {
                    displayWeather(data);
                });
            // request fails
            } else {
                console.log("error")
            }
        })  

        .catch(function(error) {
            console.log('Unable to connect');
        })
};


var SubmitHandler = function(event) {
    // stop page from refreshing
    event.preventDefault();

    // get value from input element
    var cityName = $("#cityName").val().trim();

    // check if the search field has a value
    if(cityName) {
        // pass the value to getCityWeather function
        getCityWeather(cityName);

        // clear the search input
        $("#cityName").val("");
    } else {
        console.log("Nothing was entered");
        // if nothing was entered alert the user
        ;
    }
};

// function to display the information collected from openweathermap.org
var displayWeather = function(weatherData) {

    // format and display the values
    $("#city-name").text(weatherData.name + " (" + dayjs(weatherData.dt * 1000).format("MM/DD/YYYY") + ") ").append(`<img src="https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png"></img>`);
    $("#city-temp").text("Temperature: " + weatherData.main.temp.toFixed(1) + "°F");
    $("#city-humid").text("Humidity: " + weatherData.main.humidity + "%");
    $("#city-wind").text("Wind Speed: " + weatherData.wind.speed.toFixed(1) + " mph");

    fetch("https://api.openweathermap.org/data/2.5/uvi?lat=" + weatherData.coord.lat + "&lon="+ weatherData.coord.lon + "&appid=eb1f5528e093e46e1671d62eca019668")
        .then(function(response) {
            response.json().then(function(data) {

                // display the uv index value
                $("#uv-box").text(data.value);

                // highlight the value using the EPA's UV Index Scale colors
                if(data.value >= 11) {
                    $("#uv-box").css("background-color", "#6c49cb")
                } else if (data.value < 11 && data.value >= 8) {
                    $("#uv-box").css("background-color", "#d90011")
                } else if (data.value < 8 && data.value >= 6) {
                    $("#uv-box").css("background-color", "#f95901")
                } else if (data.value < 6 && data.value >= 3) {
                    $("#uv-box").css("background-color", "#f7e401")
                } else {
                    $("#uv-box").css("background-color", "#299501")
                }      
            })
        });

    // five-day api call
    fetch("https://api.openweathermap.org/data/2.5/forecast?q=" + weatherData.name + "&appid=eb1f5528e093e46e1671d62eca019668&units=imperial")
        .then(function(response) {
            response.json().then(function(data) {

                // clear any previous entries in the five-day forecast
                $("#five-day").empty();

                // get every 8th value (24hours) in the returned array from the api call
                for(i = 7; i <= data.list.length; i += 8){

                    // insert data into my day forecast card template
                    var fiveDayCard =`
                    <div class="col-md-2 m-2 py-2 card text-white bg-primary">
                        <div class="card-body p-1">
                            <h5 card-text>` + dayjs(data.list[i].dt * 1000).format("MM/DD/YYYY") + `</h5>
                            <img src="https://openweathermap.org/img/wn/` + data.list[i].weather[0].icon + `.png" alt="rain">
                            <p class="card-text">Temp: ` + data.list[i].main.temp + `</p>
                            <p class="card-text">Humidity: ` + data.list[i].main.humidity + `</p>
                            <p class="card-text">Wind: ` + data.list[i].wind.speed + `</p>
                        </div>
                    </div>
                    `;

                    // append the day to the five-day forecast
                    $("#five-day").append(fiveDayCard);
               }
            })
        });

    // save the last city searched
    lastCitySearched = weatherData.name;

    // save to the search history using the api's name value for consistancy
    // this also keeps searches that did not return a result from populating the array
    saveSearchHistory(weatherData.name);

    
};

// function to save the city search history to local storage
var saveSearchHistory = function (city) {
    if(!searchHistory.includes(city)){
        searchHistory.push(city);
        $("#search-history").append("<a href='#' class='list-group-item list-group-item-action' id='" + city + "'>" + city + "</a>")
    } 

    // save the searchHistory array to local storage
    localStorage.setItem("weatherSearchHistory", JSON.stringify(searchHistory));

    // save the lastCitySearched to local storage
    localStorage.setItem("lastCitySearched", JSON.stringify(lastCitySearched));

    // display the searchHistory 
    loadSearchHistory();
};

// load saved city search history from local storage
var loadSearchHistory = function() {
    searchHistory = JSON.parse(localStorage.getItem("weatherSearchHistory"));
    lastCitySearched = JSON.parse(localStorage.getItem("lastCitySearched"));
  
    if (!searchHistory) {
        searchHistory = []
    }

    if (!lastCitySearched) {
        lastCitySearched = ""
    }

    // clear any previous values from th search-history ul
    $("#search-history").empty();

    // for loop that will run through all the citys found in the array
    for(i = 0 ; i < searchHistory.length ;i++) {

        // add the city as a link, set it's id, and append it to the search-history ul
        $("#search-history").append("<a href='#' class='list-group-item list-group-item-action' id='" + searchHistory[i] + "'>" + searchHistory[i] + "</a>");
    }
  };

// load search history from local storage
loadSearchHistory();

// start page with the last city searched if there is one
if (lastCitySearched != ""){
    getCityWeather(lastCitySearched);
}

// event handlers
$("#search-form").submit(SubmitHandler);
$("#search-history").on("click", function(event){
    // get the links id value
    var pastCity = $(event.target).closest("a").attr("id");
    // pass it's id value to the getCityWeather function
    getCityWeather(pastCity);
});