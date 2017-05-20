function MusicPlayer(){
			this.init = function(){
				this.audio = new Audio(); //创建一个audio对象
				this.musicArr = []; //用于储存听过的每首歌的信息，歌名，歌手，url，背景图片，歌词id
				this.num = 0; //用于记录听歌的数量
				this.songName = $('.song-name'); //歌名
                this.singer = $('.singer'); //歌手
                this.musicBg = $('.music-bg');//歌曲背景
				this.audio.autoplay = true; //设置audio对象只要src改变就自动播放
				this.lockTime; //时间锁，用于同步显示时间和清除它
				this.lyricArr = []; //临时的储存歌词，储存形式是[[时间，歌词],[时间，歌词].....]
				this.lockLyric;  //歌词锁，用于同步显示歌词
				this.bind();
			}
			this.init()
		}
		MusicPlayer.prototype = {
			constructor: MusicPlayer,
			getMusic: function(channel){     //获取歌曲的函数
				var _this = this;
					$.ajax({
					url: 'http://api.jirengu.com/fm/getSong.php',
					method: 'get',
					data: {
						channel: channel
					}
				}).done(function(result){
					$('.lyric ul').empty();
					_this.lyricArr = [];
                    _this.play(result);
                    _this.num++;
                    _this.addMusic(result);
                    _this.getLyric(result);
				})
			},
			play: function(result){         //用于解析从服务器获取的歌曲数据
                var data = JSON.parse(result).song[0];
                this.addMusicInfo(data);
			},
			bind: function(){
				var _this = this;
				$('.btn-play').on('click',function(){   //绑定播放图标点击事件
	                    if(_this.audio.src){
							_this.audio.play();
							$(this).addClass('hide');
							$('.btn-pause').removeClass('hide');
						}else{
	                        _this.getChannel();
						}				
				})
				$('.btn-pause').on('click',function(){   //绑定暂停图标点击事件
                        $(this).addClass('hide');
						$('.btn-play').removeClass('hide');
						_this.audio.pause();
				})
				_this.audio.addEventListener('playing',function(){  //绑定歌曲播放中的事件，包括歌曲，进度条，歌词的同步
					    _this.lockTime = setInterval(function(){
					    	_this.progress();
					    	_this.time(_this.audio.currentTime,$('.real-music-time'))
					    },1000)
					    $('.btn-play').addClass('hide');
						$('.btn-pause').removeClass('hide');
						_this.time(_this.audio.duration,$('.music-time'))
						_this.lockLyric = setInterval(function(){
							_this.showLyric(_this.synchronous)
						},500)
				})
				_this.audio.addEventListener('pause',function(){ //绑定暂停事件
                        if(_this.lockTime){
                        	clearInterval(_this.lockTime);
                        }
                        if(_this.lockLyric){
                        	clearInterval(_this.lockLyric);
                        }
				})
				_this.audio.addEventListener('ended',function(){  //绑定歌曲播放结束事件，自动获取新歌曲
					    _this.getChannel();
				})
				$('.btn-left').on('click',function(){  //绑定上一曲图标点击事件
					if(!$(this).hasClass('lock')){
						$(this).addClass('lock')
						_this.last(_this.musicArr);
					}
				})
				$('.btn-right').on('click',function(){  //绑定下一曲图标点击事件
					if(!$(this).hasClass('lock')){
						$(this).addClass('lock')
					    _this.next(_this.musicArr);
					}
				})
				$('.max-volume').on('click',function(){  //绑定最大音量图标点击事件
					$('.real-volume-line').css({
						'height': '110'
					})
					$('.none-volume').addClass('hide');
					$('.min-volume').removeClass('hide');
					_this.audio.volume = 1;
				})
				$('.min-volume').on('click',function(){  //绑定最小音量图标点击事件
					$('.real-volume-line').css({
						'height': '0'
					})
					$(this).addClass('hide')
					$('.none-volume').removeClass('hide');
					_this.audio.volume = 0;
				})
				$('.none-volume').on('click',function(){  //绑定静音图标点击事件
					$(this).addClass('hide');
					$('.min-volume').removeClass('hide');
					_this.audio.volume = 0.5;
					$('.real-volume-line').css({
						'height': '55'
					})
				})
				$('.song-time-line').on('click',function(e){  //绑定进度条点击事件
					if(_this.audio.src){
						var offset = e.clientX - $(this).offset().left;
						$('real-song-time-time').css({
							'width': offset
						})
						_this.audio.currentTime = (offset*_this.audio.duration)/$(this).width();
					}
				})
				$('.real-song-time-line').on('click',function(e){  //绑定进度条点击事件
					if(_this.audio.src){
						var offset = e.clientX - $('.song-time-line').offset().left;
						$('real-song-time-time').css({
							'width': offset
						})
						_this.audio.currentTime = (offset*_this.audio.duration)/$('.song-time-line').width();
					}
				})
				$('.volume-line').on('click',function(e){  //绑定音量条点击事件
					var offset = $(this).height()-(e.clientY - $(this).offset().top);
					$('.real-volume-line').css({
						'height': offset
					})
					_this.audio.volume = parseFloat(offset/$(this).height());
					$('.none-volume').addClass('hide');
					$('.min-volume').removeClass('hide');
				})
				$('.real-volume-line').on('click',function(e){  //绑定音量条点击事件
					var offset = $('.volume-line').height()-(e.clientY - $('.volume-line').offset().top);
					$('.real-volume-line').css({
						'height': offset
					})
					_this.audio.volume = parseFloat(offset/$('.volume-line').height());
					$('.none-volume').addClass('hide');
					$('.min-volume').removeClass('hide');
				})
				$('.btn-lyric').on('click',function(){ //绑定歌词图标点击事件
					if(!$('.main').hasClass('active')){
                        $('.main').animate({
                        	left: 348
                        },1000,function(){
                        	$('.main').addClass('active');
                        })
					}else{
						$('.main').animate({
                        	left: 60
                        },1000,function(){
                        	$('.main').removeClass('active');
                        })
					}
				})
				$('.btn-pre').on('click',function(){   //绑定上一频道图标点击事件
                        if(!$(this).hasClass('lock')){
                        	if($('.show').prev('li').length === 0){
								$('.show').addClass('hide').removeClass('show');
								$('.channel li').last().removeClass('hide').addClass('show');
								_this.getChannel()
							}else{
								$('.show').removeClass('show').addClass('hide').prev('li').addClass('show').removeClass('hide');
								_this.getChannel()
							}
                        }
				})
				$('.btn-next').on('click',function(){  //绑定下一频道图标点击事件
						if(!$(this).hasClass('lock')){
							if($('.show').next('li').length === 0){
								$('.show').addClass('hide').removeClass('show');
								$('.channel li').first().removeClass('hide').addClass('show');
								_this.getChannel()
							}else{
								$('.show').removeClass('show').addClass('hide').next('li').addClass('show').removeClass('hide');
								_this.getChannel()
							}
						}
				})
				$('.toggle').on('click',function(){
					$('.channel').fadeToggle(1000);
					if($(this).hasClass('change-color')){
						$(this).removeClass('change-color')
					}else{
						$(this).addClass('change-color')
					}
				})
				$('.show-btn').on('click',function(){
					$('.ct').slideToggle(1000)
				})
			},
			addMusic: function(result){   //将歌曲信息添加到数组中保存
				var data = JSON.parse(result),
				    musicInfo = {
				    	title: data.song[0].title,
				    	artist: data.song[0].artist,
				    	url: data.song[0].url,
				    	picture: data.song[0].picture,
				    	sid: data.song[0].sid
				    };
				this.musicArr.push(musicInfo);
			},
			last: function(arr){          //上一曲函数
				if((this.num-2)<0){
                  alert('这是你听过的第一首歌')
                  $('.btn-left').removeClass('lock')
				}else{
					var data = arr[this.num-2];
					this.addMusicInfo(data);
					this.getLyric(this.musicArr[this.num-2].sid)
	                this.num--;
	                $('.btn-left').removeClass('lock')
				}
			},
			next: function(arr){          //下一曲函数
				if(arr[this.num]){
                    var data = arr[this.num];
                    this.addMusicInfo(data);
                    this.getLyric(this.musicArr[this.num].sid)
	                this.num++;
	                $('.btn-right').removeClass('lock')
				}else{
					this.getChannel();
					$('.btn-right').removeClass('lock')
				}
			},
			addMusicInfo: function(data){     //将歌曲信息添加到页面
                this.songName.text(data.title);
                this.songName.attr('title',data.title);
                this.singer.text(data.artist);
                this.singer.attr('title',data.artist);
                this.musicBg.css({
                	'backgroundImage': 'url('+data.picture+')'
                })
                this.audio.src = data.url;
			},
			time: function(num,$ele){          //时间转换函数
                var minute = parseInt(num/60),
                    second = parseInt(num%60);
                if(second>=10){
                	second = second
                }else{
                	second = '0'+second;
                }
                if(minute>=10){
                	minute = minute
                }else{
                	minute = '0'+minute;
                }
                $ele.text(minute+':'+second)
			},
			progress: function(){             //进度条显示函数
                var time = this.audio.duration,
                    currentTime = this.audio.currentTime,
                    length = $('.song-time-line').width();
                $('.real-song-time-line').css({
                	'width': length*currentTime/time
                })
			},
			getLyric: function(data){         //获取歌词函数
				if(typeof data === 'number'){
                    var id = data,
				    _this = this;
	                $.ajax({
	                	url: 'http://api.jirengu.com/fm/getLyric.php',
	                	method: 'get',
	                	data: {
	                		sid: id
	                	}
	                }).done(function(result){
                        $('.lyric ul').empty();
					    _this.lyricArr = [];
	                	var reg = /Warning/g;
	                	if(reg.test(result)){
	                		var li = $('<li>此歌曲没有歌词</li>');
	                		$('.lyric ul').append(li);
	                	}else{
	                		_this.formatLyric(JSON.parse(result).lyric);
	                	    _this.addLyric(_this.lyricArr);
	                	}
	                })
				}else{
					var id = JSON.parse(data).song[0].sid,
				    _this = this;
	                $.ajax({
	                	url: 'http://api.jirengu.com/fm/getLyric.php',
	                	method: 'get',
	                	data: {
	                		sid: id
	                	}
	                }).done(function(result){
	                	$('.lyric ul').empty();
					    _this.lyricArr = [];
	                	var reg = /Warning/g;
	                	if(reg.test(result)){
	                		var li = $('<li>此歌曲没有歌词</li>');
	                		$('.lyric ul').append(li);
	                	}else{
	                		_this.formatLyric(JSON.parse(result).lyric);
	                	    _this.addLyric(_this.lyricArr);
	                	}
	                })
				}
			},
			formatLyric: function(str){        //解析歌词存入临时数组
				var _this = this,
				    lyric = str.split('\n'),
				    reg = /\[\d{2}:\d{2}.\d{2}\]/g;
					$.each(lyric,function(index,value){
						if(reg.test(value)){
							var arr = [],
	                        time = value.match(reg)[0].slice(1,-1).split(':'),
	                        time = parseInt(time[0])*60 + parseFloat(time[1]);
		                    if(value.replace(reg,'') !== ''){
		                    	str = value.replace(reg,'')
		                    }
	                        arr.push(time);
	                        arr.push(str);
	                        _this.lyricArr.push(arr);
						}
				    })
			},
			addLyric: function(arr){         //将歌词放到页面
                $.each(arr,function(i,v){
                	var li = $('<li></li>');
                	li.text(v[1]);
                	$('.lyric ul').append(li);
                })
                $('.btn-pre').removeClass('lock');
                $('.btn-next').removeClass('lock');

			},
			showLyric: function(fn){         //将歌词同步颜色改变
				var _this = this,
                    i = 0;
				    lyricList = $('.lyric ul>li')
					$.each(_this.lyricArr,function(index,value){
						if(_this.audio.currentTime > value[0]){
                           lyricList.eq(i).addClass('change-color');
                           lyricList.eq(i).siblings('li').removeClass('change-color')
                           i++;
						}
					})
					fn.bind(_this)()
			},
			synchronous: function(){         //同步滚动歌词
				var lyric = $('.lyric');
				if($('.change-color').length !== 0){
                    if(($('.change-color').offset().top+lyric.scrollTop()) > (lyric.height()+lyric.scrollTop())){
                        $('.lyric').scrollTop($('.lyric').scrollTop()+100)
                    }else if($('.change-color').offset().top<0){
                    	$('.lyric').scrollTop($('.change-color').offset().top)
                    }
				}
			},
			getChannel: function(){           //获取频道
                var channelStr = $('.show').text(),
                    channelId = '',
                    _this = this;
                $.ajax({
                	url: 'http://api.jirengu.com/fm/getChannels.php',
                	method: 'get'
                }).done(function(result){
                	$('.lyric ul').empty();
					_this.lyricArr = [];
                	var channelList = JSON.parse(result).channels;
                	$.each(channelList,function(index,value){
                		if(value.name === channelStr){
                            channelId = value.channel_id;
                            _this.getMusic(channelId)
                		}
                	})
                })
			}
		}
		var music = new MusicPlayer();