function start() {

	
	var username = location.search && location.search.split('?')[1];
	
	if (username) easyrtc.setUsername(username);
	easyrtc.enableDebug(false);
	easyrtc.enableVideo(true);
	easyrtc.enableVideoReceive(true);
	easyrtc.enableAudio(true);
	easyrtc.enableDataChannels(true);
	
	easyrtc.connect("chat", function(id) {
			controller.myId = id;
			friendList.newFriend(id);
		},
		function(easyrtcid, roomOwner){
			if( roomOwner){ console.log("I'm the room owner"); }
			console.log("my id is " + easyrtcid);
			
		},
		function(errorText){
			console.log("failed to connect ", erFrText);
		}
	);
	
	easyrtc.setPeerListener(controller.receiveMessage);
	easyrtc.setRoomOccupantListener(controller.roomListener);
	
	easyrtc.setDataChannelOpenListener(fileTransfer.dataChannelOpenListener);
	easyrtc.setDataChannelCloseListener(fileTransfer.dataChannelCloseListener);
	
	easyrtc.setStreamAcceptor(videoCall.acceptor);
	easyrtc.setOnStreamClosed(videoCall.disconnectListener);

	conversation.reset();
	fileTransfer.setup();
	videoCall.enableCamera();

	GUI.setup();

}

