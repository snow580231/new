$(function(){ 
	$('#avatar').on('click',function(){
		$('#layerSong').slideDown(500);
		var isplay=$('#play').data('isplay');
		var $singerAvatar=$('#layerSong').find('#singerAvatar')

		if (Boolean(isplay)) {
			$singerAvatar.css({
				animationPlayState:'running'
			})
		}else{
			$singerAvatar.css({
				animationPlayState:'paused'
			})
		}

		$singerAvatar.css({
			background:'url("'+$(this).data('pic')+'")no-repeat center center',
			backgroundSize:'cover'
		});
	})	

	$('#close').on('click',function(){
		$('#layerSong').slideUp(500);
	})

	var songCount=10;
	var songLimit=0;
	if (typeof Storage!=='undefined' && localStorage.songData) {
		var songData = JSON.parse(localStorage.songData);
		generateSong(songData);
	}else{
		$.ajax({
			type:'POST',
			url:'https://api.hibai.cn/api/index/index',
			
			data:{
				TransCode:'020111',
				OpenId:'Test',
				Body:{SongListId:"141998290"}
			},

			success:function(data){
				localStorage.songData=JSON.stringify(data);
				generateSong(data);			
			},

			error:function(err){
				console.log('请求失败');
				console.log(err);
			}
		})
	}

	function formatTime(second){
		var m=Math.floor(second/60%60);
		m=m>=10?m:'0'+m;

		var s=Math.floor(second%60);
		s=s>=10?s:'0'+s;

		return m+':'+s;
	}

	function generateSong(data){
		var d= data.Body.songs.slice(songLimit,songCount);
		var fragment=document.createDocumentFragment();
		$each(d,function(i,v){
			var $li=$(`<li id="${v.id}" class="clearfix" data-url="${v.url}" data-lrc="${v.lrc}" data-isplay="false" data-pic="${v.pic}" >
					<div class="fl singer-img" style="background: url('${v.pic}') no-repeat center center; background-size: cover;">
						</div>
						<div class="fl singer-info">
							<div class="song clearfix"><span class="fl title">${v.title}</span> <span class="song-time fl">${formatTime(v.time)}</span> </div>
							<div class="name">${v.author}</div>
						</div>
						<div class="fr play-icon">
							<i class="fa fa-play-circle-o"></i>
						</div>
					</li>`);
			$(fragment).append($li);
		})
		$('#songList').append($(fragment));
		playMusic();
	}

	function playMusic(){
		$('#songList>li').on('click',function(){
			var $audio=$('#audio');
			if(!$(this).hasClass('active-audio')){
				var $audioActive=$('.active-audio');
				if($audioActive[0]){
					$audioActive.data('isplay',false).find('i').removeClass('fa-pause-circle-o').addClass('fa-play-circle-o');
				}

				var url=$(this).data('url');
				$audio.attr('src',url);
				$(this).addClass('active-audio').siblings().removeClass('active-audio');

				$('#avatar').css({
					background:'url("'+$(this).data('pic')+'")no-repeat center center'
					backgroundSize:'cover'
				}).data('pic',$(this).data('pic'));

				$('#progressLayer').show();
				$('#volumeLayer').show();
			}

			if(Boolean($(this).data('#isplay'))){
				$audio[0].paused();

				$(this).data('isplay',false).find('i').removeClass('fa-pause-circle-o').addClass('fa-play-circle-o');

				$('#play').data('isplay',false).find('i').removeClass('fa-pause-circle-o').addClass('fa-play-circle-o');
			}else{
				$audio[0].play();

				$(this).data('isplay',true).find('i').removeClass('fa-play-circle-o').addClass('fa-pause-circle-o');

				$('#play').data('isplay',true).find('i').removeClass('fa-play-circle-o').addClass('fa-pause-circle-o');
			}
		})
	}

	function songProgress(){
		var $progressLayer=$('#progressLayer');

		$progressLayer.on('touchstart',function(e){
			moveProgressMask(e,$(this));
		})

		$progressLayer.on('touchmove',function(e){
			moveProgressMask(e,$(this));
		})
	}

	function moveProgressMask(e,t){
		var x=e.touches[0].pageX;
		var offsetX=t.offset().left;
		var $progressMask=$('#progressMask');
		var w=$progressMask.width();
		var minX=-w/2;
		var maxX=t.width()-w/2;
		var left=x-offsetX-w/2;
		left=left<=minX?minX:left>=maxX?maxX:left;
		console.log(left);
		$progressMask.css({
			left:left+'px'
		})

		var percent=(x-offsetX)/t.width();
		$('#activeProgress').width(percent*t.width());
		$('#audio')[0].currentTime=duration*percent;
	}
	songProgress();

	$('#play').on('click',function(){
		var $audioActive=$('.active-audio');
		if($audioActive[0]){
			console.log($(this).data('isplay'));
			if($(this).data('isplay')){
				$(this).data('isplay',false).find('i').removeClass('fa-pause-circle-o').addClass('fa-play-circle-o');
				$audioActive.data('isplay',false).find('i').removeClass('fa-pause-circle-o').addClass('fa-play-circle-o');

				$('#singerAvatar').css({
					animationPlayState:'paused'
				})
				$('#audio')[0].pause();
			}else{
				$(this).data('isplay',true).find('i').removeClass('fa-play-circle-o').addClass('fa-pause-circle-o');
				$audioActive.data('isplay',true).find('i').removeClass('fa-play-circle-o').addClass('fa-pause-circle-o');
				$('#singerAvatar').css({
					animationPlayState:'running'
				})
				$('#audio')[0].play();
			}
		}else{
			var mode=$('#mode').data('mode');
			playMusicForMode(mode,$(this));
		}
	})

	$('#volumeLayer').on('touchstart',function(e){
		moveVolumeMask(e,$(this));
	})
	$('#volumeLayer').on('touchmove',function(e){
		moveVolumeMask(e,$(this));
	})

	function moveVolumeMask(e,t){
		var x=e.touches[0].pageX;
		var offsetX=t.offset().left;
		var $volumeMask=$('#volumeMask');
		var w=$volumeMask.width();
		var minX=-w/2;
		var tw=t.width();
		var maxX=tw-w/2;
		var left=x-offsetX-w/2;
		left=left<=minX?minX:left>=maxX?maxX:left;
		$volumeMask.css({
			left:left+'px'
		})
		var x0=x-offsetX;
		x0=x0<=0?0:x0>=tw?tw:x0;
		var percent=x0/tw;
		$('#activeVolumeProgress').width(percent*t.width());
		$('#audio')[0].volume=Number(percent.toFixed(1));
	}

	var modeIcons=['refresh','random','exchange'];
	function toggleMode(){
		$('#mode').on('click',function(){
			var mode =$(this).data('mode');
			var $i=$(this).find('i');
			$i.removeClass('fa-'+modeIcons[mode-1]);
			mode=mode>=3?1: ++mode;
			$i.addClass('fa-'+modeIcons[mode-1]);
			$(this).data('mode',mode);
		})
	}
	toggleMode();

	function toggleMiusc(){
		$('.toggle').on('click',function(){
			var num=$(this).data('num');
			var mode=$('#mode').data('mode');
			toggleMuiscForMode(mode,num);
		})
	}
	toggleMiusc();

	function toggleMuiscForMode(mode,num){
		var $lis=$('#songList>li');
		var $audio=$('#audio');
		var url='',pic='';
		var $activeAudio=$('.active-audio');
		if(mode==1){
			if($activeAudio[0]){
				var index=$activeAudio.index();
				var count=$lis.length;
				index+=num;
				index=index>=count?0:index<=-1?count-1:index;
				$activeAudio.data('isplay',false).removeClass('active-audio').find('i').removeClass('fa-pause-circle-o').addClass('fa-play-circle-o');
				var $cLi=$lis.eq(index);
				$cLi.data('isplay',true).addClass('active-audio').find('i').removeClass('fa-play-circle-o').addClass('fa-pause-circle-o');
				url=$cLi.data('url');
				pic=$cLi.data('pic');
			}else{
				var $firstLi=$lis.eq(0);
				url=$firstLi.data('url');
				pic=$firstLi.data('pic');

				$firstLi.addClass('active-audio').data('isplay',true).find('i').removeClass('fa-play-circle-o').addClass('fa-pause-circle-o');
			}
			$audio.attr('src',url);
		}else if(mode==2){
			var random=Math.floor(Math.random()*$lis.length);
			var $activeLi=$lis.eq(random);
			if($activeLi.hasClass('active-audio')){
				$audio[0].load();
				if(!Boolean($activeLi.data('isplay'))){
					$activeLi.data('isplay',true).find('i').removeClass('fa-play-circle-o').addClass('fa-pause-circle-o');
				}
			}else{
				pic=$activeLi.data('pic');
				url=$activeLi.data('url');
				$activeAudio.data('isplay',false).removeClass('active-audio').find('i').removeClass('fa-pause-circle-o').addClass('fa-play-circle-o');
				$activeLi.data('isplay',true).addClass('active-audio').find('i').removeClass('fa-play-circle-o').addClass('fa-pause-circle-o');
				$audio.attr('src',url);
			}
		}else if(mode==3){
			if($activeAudio[0]){
				$audio[0].load();
				console.log('aaa');
				$activeAudio.data('isplay',true).addClass('active-audio').find('i').removeClass('fa-play-circle-o').addClass('fa-pause-circle-o');
				pic=$activeAudio.data('pic');
			}else{
				var $fLi=$lis.eq(0);
				$fLi.data('isplay',true).addClass('active-audio').find('i').removeClass('fa-play-circle-o').addClass('fa-pause-circle-o');
				pic=$fLi.data('pic');
				url=$fLi.data('url');
				$audio.attr('src',url);
			}
		}
		$('#avatar').data('pic',pic).css({
			background:'url("'+pic+'")no-repeat center center',
			backgroundSize:'cover'
		});
		$('#singerAvatar').css({
			animationPlayState:'running'
		})

		$('#play').data('isplay',true).find('i').removeClass('fa-play-circle-o').addClass('fa-pause-circle-o');

		$('#progressLayer').show();
		$('#volumeLayer').show();

		$audio[0].play();
	}
	function playMusicForMode(mode,t){
		var $audio=$('#audio');
		var $avatar=$('#avatar');
		var url='',pic='';
		if(mode==1||mode==3){
			var $firstLi=$('#songList>li').eq(0);
			url=$firstLi.data('url');

			$firstLi.addClass('active-audio').data('isplay',true).find('i').removeClass('fa-play-circle-o').addClass('fa-pause-circle-o');
			pic=$firstLi.data('pic');
		}else if (mode==2) {
			var $lis=$('#songList>li');
			var length=$lis.length;
			var random=Math.floor(Math.random()*length);
			var $currentLi=$lis.eq(random);
			$currentLi.addClass('active-audio').data('isplay',true).find('i').removeClass('fa-play-circle-o').addClass('fa-pause-circle-o');
			pic=$currentLi.data('pic');
			url=$currentLi.data('url');
		}
		t.data('isplay',true).find('i').removeClass('fa-play-circle-o').addClass('fa-pause-circle-o');
		$avatar.data('pic',pic).css({
			background:'url('+pic+')no-repeat center center',
			backgroundSize:'cover'
		})
		$audio.attr('src',url);
		$audio[0].play();
	}

	var duration=0;
	var volume=0;
	$('#audio').on('timeupdate',function(){
		var percent=this.currentTime/duration;
		var w=$('#progressLayer').width();
		var $progressMask=$('#progressMask');
		var mw=$progressMask.width();
		$progressMask.css({
			left:w*percent-mw/2+'px'
		})
		$('#activeProgress').width(percent*w);
	})

	$('#audio').on('canplay',function(){
		duration=this.duration;
		volume=this.volume;
		var w=$('#volumeLayer').width();
		var $volumeMask=$('#volumeMask');
		var vm=$volumeMask.width();
		$('#activeVolumeProgress').width(w*volume);
		$volumeMask.css({
			left:w*volume-vm/2+'px'
		})
	})

	$('#audio').on('ended',function(){
		$('.active-audio').find('i').removeClass('fa-pause-circle-o').addClass('fa-play-circle-o').end().data('isplay',false);
		$('#play').find('i').removeClass('fa-pause-circle-o').addClass('fa-play-circle-o');
		this.currentTime=0;
		var $progressMask=$('#progressMask');
		$progressMask.css({
			left:-$progressMask.width()/2+'px'
		})

		$('#singerAvatar').css({
			animationPlayState:'paused'
		})
	})
})