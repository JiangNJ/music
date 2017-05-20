var audio = new Audio(),       			//创建一个audio对象
	musicList = [],			   			//用于保存已经播放过的音乐
	num = 0,				   			//播放音乐的数量
	songPhoto = $('.songphoto')			//歌曲图片
	songName = $('.songname')			//歌名
	prep = $('.prep')					//上一首歌
	porp = $('.porp')					//播放
	pause1 = $('.pause1')				//暂停
	next = $('.next')					//下一首歌
	loop = $('.loop')					//循环播放
	proGress = $('.progress')			//控制条
	nowTime = $('.nowtime')				//现在时间
	endTime = $('.endtime')				//结束时间
	singLyrics = $('.singlyrics')		//歌词显示
	lyrics = $('.lyrics')				//歌词显示框
	volume = $('.volume')				//音量控制
	volpro = $('.volpro')				//音量控制框
	audio.autoPlay = true  				//设置为自动播放，下次更换 audioObject.src 后会自动播放音乐
	audio.volume = 1                    //默认音量
	//获取歌曲
	var getMusic = function(){
		$.get('http://api.jirengu.com/fm/getSong.php',{channel:'public_fengge_xiaoqingxin'})
			.done(function(data){
				var message = JSON.parse(data);
				audio.src = message.song[0].url;
				var title = message.song[0].title;
				var lrc = message.song[0].lrc;
				lyrics.text(lrc);
				songName.text(title);
				// songphoto.css({'backgroundImage':'src('+message.song[0].picture+')'})
				var musicMessage = {};
				musicMessage.songName = title;
				musicMessage.url = audio.src;
				musicList.push(musicMessage);
			});
	}


	//绑定暂停和播放
	porp.on('click',function(){
		if(audio.src){
			audio.play();
			$(this).addClass('show');
			pause1.removeClass('show');
		}else{
			getMusic();
			num++;
			$(this).addClass('show');
			pause1.removeClass('show');
		}
	})
	pause1.on('click',function(){
		audio.pause();
		$(this).addClass('show');
		porp.removeClass('show');
	})

	//音乐结束自动播放下一首
	audio.addEventListener('ended',function(){
		getMusic();
		num++;
	},false)


	//下一首歌
	next.on('click',function(){
		if(musicList[num]){
			songName.text(musicList[num].songName);
			audio.src = musicList[num].url;
			pause1.removeClass('show');
			porp.addClass('show');
			num++
		}else{
			getMusic();
			num++;
			pause1.removeClass('show');
			porp.addClass('show');
		}
	})


	//上一首歌
	prep.on('click',function(){
		if((num - 2) < 0){
			alert('前面木有了')
		}else{
			songName.text(musicList[num - 2].singName);
			audio.src = musicList[num - 2].url;
			num--;
		}
	})


	//音量调节显示
	volume.on('click',function(){
		if(volpro.hasClass('show')){
			volpro.removeClass('show')
		}else{
			volpro.addClass('show')
		}
	})


	//歌词调节显示
	singLyrics.on('click',function(){
		if(lyrics.hasClass('show')){
			lyrics.removeClass('show')
		}else{
			lyrics.addClass('show')
		}
	})


	//音乐时间
	function getTime(){
		setInterval(function(){
			var time = audio.currentTime;
			var min = parseInt(time/60);
			var sec = parseInt(time%60);
			if(sec >= 10){
				sec = sec;
			}else{
				sec = '0'+ sec;
			}
			if(minute >= 10){
				min = min;
			}else{
				min = '0'+ min;
			}
			endtime.text(min+':'+sec);
			var offset = time/audio.duration*300;
			realTimeLine.width(offset);
		},1000);
	}
	audio.addEventListener('play',function(){
		getTime()
	},false);


	