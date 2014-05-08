function start() {
	
	var username = location.search && location.search.split('?')[1];
	
	if (username) easyrtc.setUsername(username);
	easyrtc.enableDebug(false);
	easyrtc.enableVideo(false);
	easyrtc.enableVideoReceive(true);
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
	
	easyrtc.setDataChannelOpenListener(fileTransfer.dataChannelOpenListener);
	easyrtc.setDataChannelCloseListener(fileTransfer.dataChannelCloseListener);
	
	fileTransfer.setup();

	GUI.setup();

}

