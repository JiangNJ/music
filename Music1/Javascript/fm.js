function app($node){
	 this.init($node)
	 this.bind()
}
app.prototype.init=function($node){
	this.songH = []
	this.$audio = $('audio')
	this.$node = $node
	this.$ct = $node.find('#ct')
	this.$singphoto = $node.fing('#singphoto')
	this.$singname = $node.find('#singname')
	this.$porp = this.$node.find('.porp')
	this.$prep = this.$node.find('.prep')
	this.$next = this.$node.find('.next')
	this.$loop = this.$node.find('.loop')
	this.$progress = $node.find('.progress')
	this.$nowTime = $node.find('.nowtime')
	this.$endtime = $node.find('.endtime')
	this.$singlyr = $node.find('.singlyrics')
	this.$lyrics = $node.find('.lyrics')
	this.$volume = $node.find('volume')
	this.$volpro = $node.find('volpro')
}



app.prototype.bind= function(){
	var that = this
	//  1.点击歌词显示
	this.$singlyr.on('click', function() {
		if($(this).hasClass('show')) {
			$(this).removeClass('show')
			that.$lyrics.css({'display': 'none'})
		}else{
			$(this).addClass('show')
			that.$lyrics.css({'display': 'block'})
		}
	})
	// 2.点击音量显示
	this.$volume.on('click', function(){
		if($(this).hasClass('show')){
			$(this).removeClass('show')
			that.$volpro.css({'display': 'none'})
		}else{
			$(this).addClass('show')
			that.$volpro.css({'display':'block'})
		}
	})
	//3.播放暂停
	this.$porp.on('click', function(){
			if($(this).hasClass(pause)){
				that.$audio[0].play()
				$(this).html('&#xe6d2;')
				$(this).removeClass('pause').addClass('play')
			}else 
				if($(this).hasClass('play')){
					that.$audio[0].pause()
					$(this).html('&#xe633;')
					$(this).removeClass('play').addClass('pause')
				}
		})


	//绑定播放事件
	this.$audio.on('play', function(){
			$('.pause').html('&#xe6d2;').addClass('play').removeClass('pause')
		})


	//绑定暂停事件
	this.$audio.on('pause', function(){
			$('.play').html('&#xe633;').addClass('pause').removeClass('play')
	})


	//绑定歌曲现播放时间
	this.$audio.on('timeupdata', function(){
		that.process()
		that.nowTime()
	})

	//绑定歌曲加载完成时间事件
	this.$audio.on('loadeddata', function(){
		that.endTime()
	})



	this.$audio.on('ended', function(){
		that.getSong()
	})



	this.$next.on('click', function(){
		that.playNext()
	})


	this.$prep.on('click', function(){
		that.playPorp()
	})


	this.$lyrics.on('click', function(a){
		that.controlHistroy()
	})


	this.$volpro.on('click', function(a){
		that.controlVol()
	})



	this.$loop.on('click', function(){
		if($(this).hasClass('show')){
			$(this).removeClass('show')
			that.$audio.removeAttr('loop')
		}else{
			$(this).addClass('show')
			that.$audio.attr('loop','loop')
		}
	})



}


//获取歌曲
app.prototype.getSong = function(i){
	var that = this
	$.ajax({
		url: 'http://api.jirengu.com/fm/getSong.php',
		dataType: 'jsonp',
		type: 'get',
		data:{
			channel: i || 2
		}
	}).done(function(ret){
		var a = ret.song[0],
			lrc = a.lrc
			that.singname(a)       //添加歌名
			that.songH.push(a)     //历史歌单
			that.getlyr(lrc)       //添加歌词
	})
}
//将歌曲名放入元素中（ps：没加演唱者名。= =！，需优化）
app.prototype.singname = function(a){
	this.$audio.attr('src', a.url)     //添加歌曲
	this.$singphoto.css('background-image', 'url(' + a.picture +')')  //添加专辑图片
	this.$singname.text(a.title)     //添加歌名
	this.$audio.text(a.title)     //audio内容
}


//播放下首歌
app.prototype.playNext = function(){
	var src = this.$audio.attr('src')
	if (this.songH.length > 0) {
		for (var i = 0;i<this.songH.length;i++){
			if (src === this.songH[i].url && src !== this.songH[this.songH.length-1].url) {
				this.singname(this.songH[i+1])
				this.getlyr(this.songH[i+1].lrc)
			} else if(src === this.songH[this.songH.length-1].url){
				this.getsong()
				return
			}
		}
	}else{
		this.getSong()
	}
}

//播放上一首歌
app.prototype.playPorp = function(){
	var src = this.$audio.attr('src')
	if (this.songH.length <= 1) {
		return
	} else {
		for(var i = 0;i<this.songH.length;i++){
			if(src === this.songH[i].url && src !== this.songH[0].url){
				this.singname(this.songH[i-1])
				this.getlyr(this.songH[i-1].lrc)
			}
		}
	}
}

//进度条显示
app.prototype.progress = function(){
		var totalLength = this.$audio[0].duration,
			currentTime = this.$audio[0].currentTime;
		this.$progress.css({
			'width': (currentTime / totalLength) * 100 + '%'
		}) 
	}
//控制进度条
app.prototype.controlHistroy = function(a){
	var X = a.offsetX;
	this.$audio[0].currentTime = X / this.$progress.width()* this.$audio[0].duration
	this.progress()
}

//歌曲时间
app.prototype.endTime = function(){
	var min = parseInt(this.$audio[0].duration / 60),   //分钟
		sec = parseInt(this.$audio[0].duration % 60)    //秒
	if(min < 10 && sec <10){
		this.$endtime.text('0'+ min + '0' + sec)
	} else if(min < 10 && sec >=10){
		this.$endtime.text('0' + min + ':' + sec)
	} else if(min > 10 && sec <10){
		this.$endtime.text(min + ':' + '0' + sec)
	} else {
		this.$endtime.text(min + ':' + sec)
	}
}

//歌曲现在时间
app.prototype.nowTime = function(){
	var reg = /\d+/,
		cTime = reg.exec(this.$audio[0].currentTime)[0]
	min = parseInt(parseInt(cTime) / 60)
	sec = cTime
	if(sec<10){
		this.$nowTime.text('0'+min+':'+'0'+sec)
	}else if(sec >10 && sec<60){
		this.$nowTime.text('0'+min+':'+'sec')
	}else {
		sec %= 60
		if(sec < 10){
			this.$nowTime.text('0'+min+'+'+'0'+sec)
		} else{
			this.$nowTime.text('0'+min+':'+sec)
		}
	}
}


//控制音量
app.prototype.controlVol = function(a){
	var vol = this.$audio[0].volume,
		controlBar = this.$volpro.height(),
		Y = a.offsetY;
	this.$volpro.height(volume)
	this.$audio[0].volume = Y / controlBar
	this.$volpro.height((Y / controlBar)*100 +'%')
}



//获取歌词
app.prototype.getlyr = function(lrc){
	var that = this
	if(lrc) {
		$.ajax({
			url: lrc,
			type: 'get',
			dataType: 'text'
		}).done(function(text){
			that.$lyrics.text(text)
		})
	}
}


var b = new app($('#ct'))
$(function(){
	b.getSong()
});