var smarttime = (function(){
    var SECOND = 1000,
        MINUTE = SECOND * 60,
        HOUR   = MINUTE * 60,
        DAY    = HOUR   * 24;

    return function (time){
        var now = (new Date()).getTime();
        var timestamp;

        if( typeof time != 'object' || ! ('getTime' in time) ) {
            time = new Date(time);
        }
        timestamp = time.getTime();

        if( timestamp > now - SECOND * 10){
            return "刚刚";
        } else if( timestamp > now - MINUTE){
            return parseInt((now - time) / ONE_SECOND / 10).toString() + "0秒前";
        } else if( timestamp > now - HOUR){
            return parseInt((now - time) / ONE_MINUTE) + "分钟前";
        } else if( timestamp > now - DAY){
            return "今天" + time.getHours() + "点";
        } else if( timestamp > now - 2*DAY){
            return "昨天" + time.getHours() + "点";
        } else if( timestamp > now - 3*DAY){
            return "前天" + time.getHours() + "点";
        } else {
            return "很久以前";
        }
    }
})();

var detailedWeather =  (function() {
    var weatherCode = {
        //Thunderstorm
        "200" : ["thunderstorm with light rain", "11"],
        "201" : ["thunderstorm with rain", "11"],
        "202" : ["thunderstorm with heavy rain", "11"],
        "210" : ["light thunderstorm", "11"],
        "211" : ["thunderstorm", "11"],
        "212" : ["heavy thunderstorm", "11"],
        "221" : ["ragged thunderstorm", "11"],
        "230" : ["thunderstorm with light drizzle", "11"],
        "231" : ["thunderstorm with drizzle", "11"],
        "232" : ["thunderstorm with heavy drizzle", "11"],
        //Drizzle
        "300" : ["light intensity drizzle", "09"],
        "301" : ["drizzle", "09"],
        "302" : ["heavy intensity drizzle", "09"],
        "310" : ["light intensity drizzle rain", "09"],
        "311" : ["drizzle rain", "09"],
        "312" : ["heavy intensity drizzle rain", "09"],
        "313" : ["shower rain and drizzle", "09"],
        "314" : ["heavy shower rain and drizzle", "09"],
        "321" : ["shower drizzle", "09"],
        //Rain
        "500" : ["light rain", "10"],
        "501" : ["moderate rain", "10"],
        "502" : ["heavy intensity rain", "10"],
        "503" : ["very heavy rain", "10"],
        "504" : ["extreme rain", "10"],
        "511" : ["freezing rain", "13"],
        "520" : ["light intensity shower rain", "09"],
        "521" : ["shower rain", "09"],
        "522" : ["heavy intensity shower rain", "09"],
        "531" : ["ragged shower rain", "09"],
        //Snow
        "600" : ["light snow", "13"],
        "601" : ["snow", "13"],
        "602" : ["heavy snow", "13"],
        "611" : ["sleet", "13"],
        "612" : ["shower sleet", "13"],
        "615" : ["light rain and snow", "13"],
        "616" : ["rain and snow", "13"],
        "620" : ["light shower snow", "13"],
        "621" : ["shower snow", "13"],
        "622" : ["heavy shower snow", "13"],
        //Atmosphere
        "701" : ["mist", "50"],
        "711" : ["smoke", "50"],
        "721" : ["haze", "50"],
        "731" : ["Sand/Dust Whirls", "50"],
        "741" : ["Fog", "50"],
        "751" : ["sand", "50"],
        "761" : ["dust", "50"],
        "762" : ["VOLCANIC ASH", "50"],
        "771" : ["SQUALLS", "50"],
        "781" : ["TORNADO", "50"],
        //Clouds
        "800" : ["sky is clear", "01"],
        "801" : ["few clouds", "02"],
        "802" : ["scattered clouds", "03"],
        "803" : ["broken clouds", "04"],
        "804" : ["overcast clouds", "04"],
        //Extreme
        "900" : ["tornado"],
        "901" : ["tropical storm"],
        "902" : ["hurricane"],
        "903" : ["cold"],
        "904" : ["hot"],
        "905" : ["windy"],
        "906" : ["hail"],
        //Additional"
        "950" : ["Setting"],
        "951" : ["Calm"],
        "952" : ["Light breeze"],
        "953" : ["Gentle Breeze"],
        "954" : ["Moderate breeze"],
        "955" : ["Fresh Breeze"],
        "956" : ["Strong breeze"],
        "957" : ["High wind, near gale"],
        "958" : ["Gale"],
        "959" : ["Severe Gale"],
        "960" : ["Storm"],
        "961" : ["Violent Storm"],
        "962" : ["Hurricane"]
    };
    var imgRoot = "/imgs/";

    //名词翻译：http://wiki.moztw.org/index.php?title=ForecastFox/WeatherFox
    //http://bugs.openweathermap.org/projects/api/boards/3
    function getWeatherName( code ) {
        return getWeatherByCode( code )[0];
    }

    function getWeatherImg( code ) {
        return imgRoot + getWeatherByCode( code )[1] + getSuffixOfImg();
    }

    function getSuffixOfImg () {
        var hour = (new Date()).getHours();
        return (hour < 8 || hour >= 18 ? 'n' : 'd') + '.png';
    }

    function getWeatherByCode( code ) {
        var config = weatherCode[code.toString()];
        if( typeof config == "object" ) {
            if( 1 in config ){
                return config;
            } else {
                return [config[0], "03"];//默认第三个图标
            }
        } else {
            return ["unknow", "03"];
        }
    }

    //http://www.srh.noaa.gov/images/epz/wxcalc/tempConvert.pdf
    function KelvinToCelsius( kelvin ){
        return keepADot( kelvin - 273.15 );
    }

    function CelsiusToKelvin( celsius ){
        return keepADot( celsius + 273.15 );
    }

    function CelsiusToFahrenheit( celsius ){
        return keepADot((212-32)/100 * celsius + 32);
    }

    function FahrenheitToCelsius( fahrenheit ){
        return keepADot(100/(212-32) * (fahrenheit - 32));
    }

    function keepADot( num ){
        return parseInt(num * 10)/10;
    }

    function mphTokph( mph ){
        return parseInt(mph*1.609344);
    }

    //http://www.onlineconversion.com/windchill.htm
    function feelsLike(temp, wind){
        wind = parseFloat(wind);
        temp = parseFloat(CelsiusToFahrenheit(temp));

        return FahrenheitToCelsius(35.74+0.6215*temp-35.75*Math.pow(wind,0.16)+0.4275*temp*Math.pow(wind,0.16));
    };

    function detailedWeather( data ) {
        this.name = getWeatherName( data.id );
        this.img  = getWeatherImg( data.id ); 
        this.humidity = data.humidity;
        this.temp = {
            cur: KelvinToCelsius( data.temp ),
            max: KelvinToCelsius( data.temp_max ),
            min: KelvinToCelsius( data.temp_min ),
            feels: 0
        };
        this.wind = {
            speed: data.speed,
            deg: data.deg
        }

        if( "temp_all" in data ){
            this.temp_all = [];
            for( var time in data.temp_all ){
                this.temp_all[time] = KelvinToCelsius(data.temp_all[time]);
            }
        }
        this.time = new Date(data.time*1000);

        this.temp.feels = feelsLike(this.temp.cur, this.wind.speed);
    }

    detailedWeather.prototype.formatedWind = function(){
        var kph = mphTokph(this.wind.speed);
        var dir = parseInt( (this.wind.deg + 22.5) / 45 );
        var dirs = ["北", "东北", "东", "东南", "南", "西南", "西", "西北"]
        var windName = ["无风", "软风", "轻风", "微风", "和风", "清风", "强风", "劲风", "大风", "烈风", "狂风", "暴风", "台风（飓风）"];
        var speed = [1, 6, 12, 20, 29, 39, 50, 62, 75, 89, 103, 118, 134, 150, 167, 184, 202, 221];
        var level = 0, name = "无风";
        for ( var i in speed ) {
            if ( kph >= speed[i] ) {
                level = parseInt(i)+1;
                if( level in windName ){
                    name = windName[level];
                } else {
                    name = windName[windName.length-1];
                }
            } else {
                break;
            }
        }
        return !level ? name : level+"级" + dirs[dir] + name;
    }

    detailedWeather.prototype.formatedHumidity = function(){
        return this.humidity + "%";
    };

    detailedWeather.prototype.formatedName = function(){
        return this.name.replace(/(?:\b| )[a-z]/g, function(c){return c.toUpperCase()});
    };

    detailedWeather.prototype.formatedTemp = function( type ){
        if( ! ( type in this.temp ) ) tepe = 'cur';
        return this.temp[type] + " ℃";
    };

    detailedWeather.prototype.formatedTime = function(){
        return smarttime(this.time) + "更新";
    }

    return detailedWeather;
})();
