function require( list, callback ){
    var requiredloading = 0;
    
    if( typeof list != "object" ){
        list = [[list, list]];
    } else if( typeof list[0] != "object" && 1 in list ){
        list = [list];
    }

    for( var i in list ){
        if( typeof list[i] == "string" ){
            list[i] = [list[i], list[i]];
        } else if(! ( 1 in list[i] )) {
            list[i][1] = list[i][0];
        }
        if( eval("typeof "+list[i][0]) == "undefined" ){
            loadJS( list[i][1] );
        }
    }

    function onLoad(){
        if( requiredloading === 0 ) {
            callback();
        }
    }

    function loadJS( filename ){
        requiredloading++;
        var script = document.createElement('script'); 
        script.type = 'text/javascript'; 
        script.onload = function(){
            requiredloading--;
            onLoad();
        }
        script.src = '/js/'+filename+'.js';
        var s = document.getElementsByTagName('script')[0]; 
        s.parentNode.insertBefore(script, s);
    }

    onLoad();
}

require([
    ["$", "zepto.min"],
    ["detailedWeather"],

], function(){

    $.ajax({
        url      : 'http://api.openweathermap.org/data/2.5/forecast/daily?q=上海&mode=json&cnt=7', 
        dataType : "jsonp",
        success  : function(data){
            require([["chart"], ["detailedWeather"]], function(){
                new chart(data.list);
            })
        },
        error    : function(jqXHR, textStatus, errorThrown){
            alert("网络问题，无法请求天气API，请重试");
        }
    });
    
    $.ajax({
        url      : 'http://api.openweathermap.org/data/2.5/weather?q=%E4%B8%8A%E6%B5%B7', 
        dataType :"jsonp", 
        success  : function(data){
            var weather = new detailedWeather({
                id       : data.weather[0].id,
                humidity : data.main.humidity,
                temp     : data.main.temp,
                temp_max : data.main.temp_max,
                temp_min : data.main.temp_min,
                speed    : data.wind.speed,
                deg      : data.wind.deg,
                time     : data.dt
            });

            $('#weather .icon').css('background-image', 'url('+ weather.img +')');

            $('#weather .temp').text(weather.formatedTemp('cur'));
            $('#weather .name').text(weather.formatedName());
            $('#weather .apparent').text("体感" + weather.formatedTemp('feels'));
            $('#weather .wind').text(weather.formatedWind());
            $('#weather .time').text(weather.formatedTime());
        },
        error    : function(jqXHR, textStatus, errorThrown){
            alert("网络问题，无法请求天气API，请重试");
        }
    });
});
