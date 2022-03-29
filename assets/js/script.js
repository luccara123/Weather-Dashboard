// store the user's search history
var searchHistory = [];
var lastCitySearched = "";

//apiUrl
var getCityWeather = function(city){
    var apiUrl ="https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=eb1f5528e093e46e1671d62eca019668&units=imperial";

    //make a resquest to the url
    fetch(apiUrl)
    .then(function(response){
        //request successful
        if (response.ok){
            response.json()
            .then(function(data){
                console.log(data);
            })
        } else{
            console.log("Error");
        }
    })

    //no response form OpenWeather
    .catch(function(error){
        console.log("Unable to connect to OpenWeather")
    })
}

var searchHandler = function(event){
    //stop page from refreshing
    event.preventDefault();
    //value from input element
    var cityName = $("#cityName").val().trim();

    //check if search input has a value
    if(cityName){
        getCityWeather(cityName);
        $("#cityName").val("");
    }else{
        console.log("No value")
    }
};


// Event buttons
$("#search-form").submit(searchHandler);
$("#search-history").on("click", function(event){
    var pastCity = $(event.target).closest("a").attr("id");
    getCityWeather(pastCity)
})
