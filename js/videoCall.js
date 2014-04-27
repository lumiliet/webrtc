controller.acceptor = function(id, stream) {
	if (controller.localVideo.enabled) return;
	
	controller.setCurrentConversation(id);
	
	controller.localVideo.stream = easyrtc.getLocalStream();
	controller.localVideo.enabled = true;
	
	conversationList.get(id).stream = stream;
	conversationList.get(id).video = true;
	
	var videoSelf = document.getElementById("videoSelf");
	var videoCaller = document.getElementById("videoCaller");
	easyrtc.setVideoObjectSrc(videoSelf, controller.localVideo.stream);
	easyrtc.setVideoObjectSrc(videoCaller, stream);
	
	GUI.toggleVideo(true);
	var currentdate = new Date(); 
	var datetime = "Call started: " + currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
	conversationList.addMessageToConversation("", datetime);
	controller.updateGUI();
}

controller.disconnectListener = function(id) {
	if (!controller.localVideo.enabled) return;
	
	//controller.localVideo.stream.stop();
	controller.localVideo.stream = {};
	controller.localVideo.enabled = false;
	
	conversationList.get(id).stream = {};
	conversationList.get(id).video = false;
	
	GUI.toggleVideo(false);
	var currentdate = new Date(); 
	var datetime = "Call ended: " + currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
	conversationList.addMessageToConversation("", datetime);
	controller.updateGUI();
	
}
