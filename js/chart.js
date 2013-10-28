var chart = (function(){
    var padding = 20;
    var lineWidth = 3;

    function chart(data){
        //初始化数据
        this.temp = [];
        this.min=100;
        this.max=0;
        this.length = data.length;

        for(var i in data){
            this.temp.push(new detailedWeather({
                id       : data[i].weather[0].id,
                humidity : data[i].humidity,
                temp     : data[i].temp.day,
                temp_max : data[i].temp.max,
                temp_min : data[i].temp.min,
                speed    : data[i].speed,
                deg      : data[i].deg,
                time     : data[i].dt,
                temp_all : [
                    data[i].temp.morn,
                    data[i].temp.day,
                    data[i].temp.night,
                    data[i].temp.eve,
                ]
            }));
            var max   = this.temp[this.temp.length-1].temp.max;
            var min   = this.temp[this.temp.length-1].temp.min;
            var feels = this.temp[this.temp.length-1].temp.feels;
            if( max > this.max ){
                this.max = max;
            }
            if( min < this.min ){
                this.min = min;
            }
            if( feels > this.max ){
                this.max = feels;
            }
            if( feels < this.min ){
                this.min = feels;
            }
        }
        this.max = Math.ceil(this.max);
        this.min = Math.floor(this.min);

        //初始化元素
        this.init();

        var self = this;
        var resizing = false;
        $(window).resize(function(){
            if( ! resizing ){
                clearTimeout(resizing);
            }
            resizing = setTimeout(function(){
                self.init();
                resizing = false;
            }, 300);
        });
    }

    chart.prototype.init = function() {
        this.canvas = document.getElementById('forecast');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight - this.canvas.offsetTop;
        this.ctx = this.canvas.getContext('2d');

        this.width  = parseFloat(this.canvas.offsetWidth);
        this.height = parseFloat(this.canvas.offsetHeight);

        this.xintv = parseInt((this.width - 2*padding) / this.length);

        this.begin = (this.width - this.length*this.xintv) / 2;
        this.bodyHeight = this.height - 3*padding - this.xintv*0.7;

        this.yintv = this.bodyHeight/(this.max-this.min);

        this.drawBackground();
        this.drawHLine();
        this.drawMinMaxArea();
        this.drawFeelsLike();
        this.drawDayTemp();
    }

    chart.prototype.drawDayTemp = function(){
        this.ctx.strokeStyle = "red";
        this.ctx.lineWidth = lineWidth;
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.getY(this.temp[0].temp.cur));
        for( var i=0; i < this.temp.length; i++ ){
            this.ctx.lineTo(this.getX(i), this.getY(this.temp[i].temp.cur));
        }
        this.ctx.lineTo(this.width, this.getY(this.temp[i-1].temp.cur));
        this.ctx.stroke();
    }

    chart.prototype.drawFeelsLike = function(){
        this.ctx.strokeStyle = "green";
        this.ctx.lineWidth = lineWidth;
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.getY(this.temp[0].temp.feels));
        for( var i=0; i < this.temp.length; i++ ){
            this.ctx.lineTo(this.getX(i), this.getY(this.temp[i].temp.feels));
        }
        this.ctx.lineTo(this.width, this.getY(this.temp[i-1].temp.feels));
        this.ctx.stroke();
    }

    chart.prototype.drawMinMaxArea = function(){
        this.ctx.fillStyle = "rgba(250, 200, 80, .6)";
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.getY(this.temp[0].temp.max));
        for( var i=0; i < this.temp.length; i++ ){
            this.ctx.lineTo(this.getX(i), this.getY(this.temp[i].temp.max));
        }

        //横向贯穿
        this.ctx.lineTo(this.width, this.getY(this.temp[i-1].temp.max));
        this.ctx.lineTo(this.width, this.getY(this.temp[i-1].temp.min));

        for( var i=this.temp.length-1; i >= 0; i-- ){
            this.ctx.lineTo(this.getX(i), this.getY(this.temp[i].temp.min));
        }

        //横向贯穿
        this.ctx.lineTo(0, this.getY(this.temp[0].temp.min));
        this.ctx.lineTo(0, this.getY(this.temp[0].temp.max));
        this.ctx.fill();
    }

    chart.prototype.drawBackground = function(){
        for( var i=0; i <= this.temp.length+1; i++ ){
            if( i % 2 != 0 ) {
                continue;
            }
            this.ctx.fillStyle = "#edf6fa";
            this.ctx.fillRect(this.getX(i-1)-this.xintv/2, 0, this.xintv, this.height);
        }

        for(var i in this.temp){
            this.ctx.font = "12px Times New Roman";
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "top";
            this.ctx.fillStyle = "#15556d";
            this.ctx.fillText(["周日", "周一", "周二", "周三", "周四", "周五", "周六"][this.temp[i].time.getDay()], this.getX(i), 5);
            var img = new Image();
            var chart = this;
            var width = this.xintv * 0.7;
            var left = this.xintv * 0.35;
            img.src = '.'+this.temp[i].img;
            img.i   = i;
            img.onload = function(){
                chart.ctx.drawImage(this, 0, 0, 300, 300, chart.getX(this.i)-left, 25, width, width);
            }
        }
    }

    chart.prototype.drawHLine = function(){
        //横线
        var max = Math.ceil(this.max);
        var min = Math.floor(this.min);
        this.ctx.beginPath();
        for( var y = min; y <= max; y++ ){
            if( y % 5 == 0 || y == min || y == max ){
                this.ctx.fillStyle = "#aaaaaa";
                console.log(y, this.getY(y));
                this.ctx.fillRect( 0, this.getY(y), 5, 1);
                this.ctx.fillRect( 35, this.getY(y), this.width, 1);
                this.ctx.font = "10px Times New Roman";
                this.ctx.textAlign = "left";
                this.ctx.textBaseline = "middle";
                this.ctx.fillStyle = "#15556d";
                this.ctx.fillText(y+"℃", 8, this.getY(y));
            } else {
                this.ctx.fillStyle = "#eeeeee";
                this.ctx.fillRect( 0, this.getY(y), this.width, 1);
            }
        }
    }

    chart.prototype.getX = function( index ){
        return parseInt(this.begin + index * this.xintv) + this.xintv/2;
    }

    chart.prototype.getY = function( temp ){
        return parseInt(this.height - this.yintv * ( temp - this.min ) - padding);
    }
    
    return chart;
})();
