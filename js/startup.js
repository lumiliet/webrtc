function start() {
	
	var username = location.search && location.search.split('?')[1];
	
	if (username === "Marius") document.getElementById("sendFile").hidden = true;
	if (username) easyrtc.setUsername(username);
	easyrtc.enableDebug(false);
	easyrtc.enableVideo(false);
	easyrtc.enableAudio(false);
	easyrtc.enableDataChannels(true);
	easyrtc.setPeerListener(controller.receiveMessage);
	easyrtc.setRoomOccupantListener(controller.roomListener);
	
	easyrtc.connect("chat", function(id) {
			controller.id = id;
		},
		function(easyrtcid, roomOwner){
			if( roomOwner){ console.log("I'm the room owner"); }
			console.log("my id is " + easyrtcid);
			
		},
		function(errorText){
			console.log("failed to connect ", erFrText);
		}
	);
	
	easyrtc.setDataChannelOpenListener(controller.dataChannelOpenListener);
	easyrtc.setDataChannelCloseListener(controller.dataChannelCloseListener);
	
	/*
	easyrtc.initMediaSource(function(){
		var videoSelf = document.getElementById("videoSelf");
		controller.localVideo.stream = easyrtc.getLocalStream();
		easyrtc.setVideoObjectSrc(videoSelf, controller.localVideo.stream);
	});
	*/
	
	fileTransfer.startup();
	

	GUI.setup();
}
