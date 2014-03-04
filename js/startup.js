function start() {

	
	//var userName = prompt("Username: ");
	//easyrtc.setUsername(userName);
	
    var username = location.search && location.search.split('?')[1];
	
	if (username) easyrtc.setUsername(username);
	easyrtc.enableDebug(false);
	easyrtc.enableVideo(true);
	easyrtc.enableAudio(false);
	easyrtc.setPeerListener(controller.receiveMessage);
	easyrtc.setRoomOccupantListener(controller.roomListener);
	
	easyrtc.connect("chat", function(id) {
		controller.id = id;
	});
	
	easyrtc.setStreamAcceptor(controller.acceptor);
	easyrtc.setOnStreamClosed(controller.disconnectListener);
	//easyrtc.setAcceptChecker(controller.acceptChecker);
	
	
	
	
	GUI.setup();
}
