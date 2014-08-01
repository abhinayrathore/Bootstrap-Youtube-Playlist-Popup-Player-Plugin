/*!
 * Bootstrap YouTube Playlist Popup Player Plugin
 * http://lab.abhinayrathore.com/bootstrap-youtube-playlist-popup/
 * https://github.com/abhinayrathore/Bootstrap-Youtube-Playlist-Popup-Player-Plugin
 */
(function($, window, document) {
  var $YouTubePlaylistModal = null,
    $YouTubePlaylistModalDialog = null,
    $YouTubePlaylistModalTitle = null,
    $YouTubePlaylistModalBody = null,
    $popoverVideoList = null,

    YTP = null,
    YTPControls = null,
    YTPlaylistPopover = null,
    Modal = null,

    margin = 4,
    YouTubePlayer = null,
    playerReady = false,
    playList = [],
    playlistObject = {},
    _options = null;

  // Setup YouTube API if it doesn't exist already
  if (!window.YT) {
    // Load the IFrame Player API code asynchronously.
    var tag = document.createElement('script'),
      firstScriptTag = document.getElementsByTagName('script')[0];
    tag.src = "//www.youtube.com/iframe_api";
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = function() {
      playerReady = true;
    }
  } else {
    playerReady = true;
  }
  
  // Plugin methods
  var methods = {
    // Initialize plugin
    init: function(options) {
      options = $.extend({}, $.fn.YouTubePlaylistModal.defaults, options);

      // Create YouTube Player Modal
      if (!$YouTubePlaylistModal) {
        $YouTubePlaylistModal = $('<div class="modal fade ' + options.cssClass + '" id="YouTubePlaylistModal" role="dialog" aria-hidden="true">');
        $YouTubePlaylistModal.html(Modal.createMarkup(options)).hide().appendTo('body');
        $YouTubePlaylistModalDialog = $("#YouTubePlaylistModalDialog");
        $YouTubePlaylistModalTitle = $("#YouTubePlaylistModalTitle");
        $YouTubePlaylistModalBody = $("#YouTubePlaylistModalBody");
        // Init Bootstrap Modal
        $YouTubePlaylistModal.modal({
          show: false
        }).on('show.bs.modal', function() {
            options.onOpen && options.onOpen();
          })
          .on('hide.bs.modal', function() {
            Modal.onClose();
            options.onClose && options.onClose();
          });
      }

      // Iterate over the elements and assign click event
      return this.each(function() {
        var obj = $(this),
          data = obj.data('YouTubePlaylist');
        if (!data) { //check if event is already assigned
          obj.data('YouTubePlaylist', true);
          $(obj).bind('click.YouTubePlaylistModal', function() {
          	_options = options;
            playList = options.playList;  
            if (!(playList instanceof Array) || playList.length < 1) {
              playList = obj.data('playlist').split(',');
            }
            
            // Override title if it exists
            options.title && Modal.setTitle(options.title);
            
            // Remove empty elements
            playList = $.grep(playList, function (n) {
            	return(n);
            });
            
            // Resize Modal
            Modal.resize(options.width);

            if (!playerReady) {
              Modal.setTitle(options.errors.no_api);
            } else if(playList && playList instanceof Array && playList.length) {
              YTP.init(options);
            } else if(!playList || !(playList instanceof Array) || !playList.length) { // No video id provided
            	Modal.setTitle(options.errors.no_ids);
            }

            // Display the Modal
            $YouTubePlaylistModal.modal('show');
          }); // End click bind
        }
      }); // End this.each(...)
    },

    // Destroy the plugin
    destroy: function() {
      return this.each(function() {
        $(this).unbind(".YouTubePlaylistModal").removeData('YouTubePlaylist');
      });
    }
  };

  /***********************[ Modal Functions ]***********************/
  
  Modal = {
    createMarkup: function(options) {
      return ['<div class="modal-dialog" id="YouTubePlaylistModalDialog">',
                '<div class="modal-content" id="YouTubePlaylistModalContent">',
                  '<div class="modal-header">',
                    '<button type="button" class="close" data-dismiss="modal">&times;</button>',
                    '<h4 class="modal-title" id="YouTubePlaylistModalTitle"></h4>',
                  '</div>',
                  '<div class="modal-body" id="YouTubePlaylistModalBody" style="padding:0;"><div style="margin: ', margin, 'px;" id="YouTubePlaylistPlayer"></div></div>',
                  '<div class="modal-footer" style="text-align: center;">',
                    '<button type="button" class="btn btn-default btn-sm" data-dismiss="modal" aria-label="', options.translations.close, '" title="', options.translations.close, '"><span class="', options.icons.close, '"></span></button>',
                    '<button type="button" class="btn btn-default btn-sm mute-video" aria-label="', options.translations.mute, '" title="', options.translations.mute, '"><span class="', options.icons.mute, '"></span></button>',
                    '<button type="button" class="btn btn-default btn-sm first-video" aria-label="', options.translations.first, '" title="', options.translations.first, '"><span class="', options.icons.first, '"></span></button>',
                    '<button type="button" class="btn btn-default btn-sm prev-video" aria-label="', options.translations.prev, '" title="', options.translations.prev, '"><span class="', options.icons.prev, '"></span></button>',
                    '<button type="button" class="btn btn-default btn-sm play-video" aria-label="', options.translations.play, '" title="', options.translations.play, '"><span class="', options.icons.play, '"></span></button>',
                    '<button type="button" class="btn btn-default btn-sm pause-video hidden" aria-label="', options.translations.pause, '" title="', options.translations.pause, '"><span class="', options.icons.pause, '"></span></button>',
                    '<button type="button" class="btn btn-default btn-sm next-video" aria-label="', options.translations.next, '" title="', options.translations.next, '"><span class="', options.icons.next, '"></span></button>',
                    '<button type="button" class="btn btn-default btn-sm last-video" aria-label="', options.translations.last, '" title="', options.translations.last, '"><span class="', options.icons.last, '"></span></button>',
                    '<button type="button" class="btn btn-default btn-sm shuffle-video" aria-label="', options.translations.shuffle, '" title="', options.translations.shuffle, '"><span class="', options.icons.shuffle, '"></span></button>',
                    '<button type="button" class="btn btn-default btn-sm loop-video" aria-label="', options.translations.loop, '" title="', options.translations.loop, '"><span class="', options.icons.loop, '"></span></button>',
                    '<button type="button" class="btn btn-default btn-sm stop-video" aria-label="', options.translations.stop, '" title="', options.translations.stop, '"><span class="', options.icons.stop, '"></span></button>',
                    '<button type="button" class="btn btn-default btn-sm list-video" data-toggle="popover" data-placement="top" aria-label="', options.translations.list, '" title="', options.translations.list, '"><span class="', options.icons.list, '"></span></button>',
                    '<div class="list-popover-content hidden"></div>',
                  '</div>',
                '</div>',
              '</div>'].join('');
    },

    setTitle: function(title) {
      $YouTubePlaylistModalTitle.html($.trim(title));
    },

    setTitleById: function(id) {
      if(playlistObject[id] && playlistObject[id].title) {
        this.setTitle(playlistObject[id].title);
      } else {
        getYouTubeData(id, function(youtubeId, data) {
          data && data.entry && data.entry.title && data.entry.title.$t && Modal.setTitle(data.entry.title.$t);
        });
      }
    },

    reset: function() {
      this.setTitle('');
    },

    resize: function(w) {
      $YouTubePlaylistModalDialog.css({
        width: w + (margin * 2) + 2
      });
    },
    
    onClose: function() {
      playList = [];
      playlistObject = {};
      YTPlaylistPopover.destroy();
      $('#list-popover-content').empty();
      YouTubePlayer && YouTubePlayer.destroy();
      YTPControls.unbind();
      Modal.reset();
    }
  };

  /***********************[ YouTube Player Functions ]*******************/
  
  YTP = {
    // Initialize the YouTube player with options
    init: function(options) {
      YouTubePlayer = new YT.Player('YouTubePlaylistPlayer', {
        height: options.height,
        width: options.width,
        videoId: playList[0],
        playerVars: {
          autohide: options.autohide,
          autoplay: options.autoplay,
          color: options.color,
          controls: options.controls,
          fs: options.fs,
          loop: options.loop,
          modestbranding: options.modestbranding,
          origin: window.location.hostname,
          showinfo: options.showinfo,
          theme: options.theme
        },
        events: {
          'onReady': this.onPlayerReady,
          'onStateChange': this.onPlayerStateChange
        }
      });
    },

    // The YouTube API will call this function when the video player is ready.
    onPlayerReady: function(event) {
      YTPlaylistPopover.init();
      event.target.cuePlaylist({
        playlist: playList
      });
      _options.autoplay && event.target.playVideo();
      YTPControls.init();
    },

    // The YouTube API calls this function when the player's state changes.
    onPlayerStateChange: function(event) {
      if (!_options.title) {
        var index = YouTubePlayer.getPlaylistIndex();
        if (index > -1) {
          Modal.setTitleById(playList[index]);
        }
      }
    }
  };

  /***********************[ YouTube Player Controls Functions ]*******************/

  YTPControls = {
    init: function() {
      if(_options.autoplay) {
        $YouTubePlaylistModal.find('.pause-video, .play-video').toggleClass('hidden');
      }

      $YouTubePlaylistModal.on('click', '.first-video', function() {
        YouTubePlayer.playVideoAt(0);
      });
      $YouTubePlaylistModal.on('click', '.prev-video', function() {
        YouTubePlayer.previousVideo();
      });
      $YouTubePlaylistModal.on('click', '.play-video', function() {
        YouTubePlayer.playVideo();
        $(this).addClass('hidden');
        $YouTubePlaylistModal.find('.pause-video').removeClass('hidden');
      });
      $YouTubePlaylistModal.on('click', '.pause-video', function() {
        YouTubePlayer.pauseVideo();
        $(this).addClass('hidden');
        $YouTubePlaylistModal.find('.play-video').removeClass('hidden');
      });
      $YouTubePlaylistModal.on('click', '.next-video', function() {
        YouTubePlayer.nextVideo();
      });
      $YouTubePlaylistModal.on('click', '.last-video', function() {
        YouTubePlayer.playVideoAt(playList.length - 1);
      });
      $YouTubePlaylistModal.on('click', '.shuffle-video', function() {
        YouTubePlayer.setShuffle(!$(this).hasClass('active'));
        $(this).toggleClass('active');
      });
      $YouTubePlaylistModal.on('click', '.loop-video', function() {
        YouTubePlayer.setLoop(!$(this).hasClass('active'));
        $(this).toggleClass('active');
      });
      $YouTubePlaylistModal.on('click', '.stop-video', function() {
        YouTubePlayer.stopVideo();
      });
      $YouTubePlaylistModal.on('click', '.mute-video', function() {
        if(!$(this).hasClass('active')) {
          YouTubePlayer.mute();
        } else {
          YouTubePlayer.unMute();
        }
        $(this).toggleClass('active');
      });
      $YouTubePlaylistModal.on('click', '.popover-video-link', function() {
        YouTubePlayer.playVideoAt($(this).data('index'));
        $popoverVideoList.popover('hide');
        return false;
      });
    },

    unbind: function() {
      $YouTubePlaylistModal.off('click', '[class$="-video"]');
    }
  };
  
  /***********************[ Playlist Popover Player Functions ]*******************/

  YTPlaylistPopover = {
    // Initialize playlist popover
    init: function() {
      $popoverVideoList = $YouTubePlaylistModal.find('.list-video');
      $popoverVideoList.popover({
        html: true,
        content: function(el) {
          return ['<div style="max-height: ', _options.height,'px; overflow-y: auto;">', $YouTubePlaylistModal.find('.list-popover-content').html(), '</div>'].join('');
        }
      }).popover('hide');

      this.setupPlaylistObject();
    },

    setupPlaylistObject: function() {
      var $videoList = $YouTubePlaylistModal.find('.list-popover-content'),
        id, i, title, html = '';
      $videoList.empty();
      for (i = 0, len = playList.length; i < len; i++) {
        id = $.trim(playList[i]);
        title = id;
        playlistObject[id] = {};
        $videoList.append(['<div class="media" style="overflow: hidden; text-overflow: ellipsis;">',
                    '<a class="pull-left popover-video-link" data-index="' + i + '" data-id="' + id + '" href="#">',
                      '<img class="media-object" src="//i.ytimg.com/vi/' + id + '/default.jpg" alt="' + title + '" height="50" />',
                    '</a>',
                    '<div class="media-body">',
                      '<a class="pull-left popover-video-link" data-index="' + i + '" data-id="' + id + '" href="#">',
                        '<h5 class="media-heading">' + title + '</h5>',
                      '</a>',
                    '</div>',
                  '</div>'].join(''));
        getYouTubeData(id, this.populatePopoverList);
      }
    },

    populatePopoverList: function(youtubeId, data) {
      var $videoList = $YouTubePlaylistModal.find('.list-popover-content');
      if (data && data.entry && data.entry.title && data.entry.title.$t) {
        playlistObject[youtubeId] = playlistObject[youtubeId] || {};
        playlistObject[youtubeId]['title'] = data.entry.title.$t;
        playlistObject[youtubeId]['desc'] = data.entry.media$group.media$description.$t;
        playlistObject[youtubeId]['duration'] = data.entry.media$group.yt$duration.seconds;
        $videoList.find('.popover-video-link[data-id="' + youtubeId + '"] > h5').html(playlistObject[youtubeId]['title']);
        $videoList.find('.popover-video-link[data-id="' + youtubeId + '"]').attr('title', playlistObject[youtubeId]['desc']);
      }
    },

    destroy: function() {
      $popoverVideoList && $popoverVideoList.popover('destroy');
    }
  };

  function getYouTubeData(youtubeId, callback) {
    var url = ["https://gdata.youtube.com/feeds/api/videos/", youtubeId, "?v=2&alt=json"].join('');
    $.ajax({
      url: url,
      dataType: 'jsonp',
      cache: true,
      success: function(data) {
        callback.call(this, youtubeId, data);
      }
    });
  }

  $.fn.YouTubePlaylistModal = function(method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method ' + method + ' does not exist on Bootstrap.YouTubePlaylistModal');
    }
  };

  // Default configuration
  $.fn.YouTubePlaylistModal.defaults = {
    playList: '',
    title: '',
    cssClass: 'YouTubePlaylistModal',
    width: 640,
    height: 480,
    autohide: 2,
    autoplay: 1,
    color: 'red',
    controls: 1,
    fs: 1,
    loop: 0,
    modestbranding: 1,
    showinfo: 0,
    theme: 'light',
    icons: {
      'close': 'glyphicon glyphicon-remove',
      'first': 'glyphicon glyphicon-fast-backward',
      'prev': 'glyphicon glyphicon-step-backward',
      'play': 'glyphicon glyphicon-play',
      'pause': 'glyphicon glyphicon-pause',
      'next': 'glyphicon glyphicon-step-forward',
      'last': 'glyphicon glyphicon-fast-forward',
      'stop': 'glyphicon glyphicon-stop',
      'shuffle': 'glyphicon glyphicon-random',
      'loop': 'glyphicon glyphicon-repeat',
      'mute': 'glyphicon glyphicon-volume-off',
      'list': 'glyphicon glyphicon-list'
    },
    translations: {
      'close': 'Close',
      'first': 'First',
      'prev': 'Previous',
      'play': 'Play',
      'pause': 'Pause',
      'next': 'Next',
      'last': 'Last',
      'stop': 'Stop',
      'shuffle': 'Shuffle',
      'loop': 'Loop',
      'mute': 'Mute',
      'list': 'Playlist'
    },
    errors: {
      'no_api': 'YouTube API not initialized!',
    	'no_ids': 'No videos added to playlist!'
    },
    onOpen: null,
    onClose: null
  };
})(jQuery, window, document);
