var fileTransfer = {
	busy: false
};

fileTransfer.setup= function() {
	easyrtc_ft.buildFileReceiver(fileTransfer.accept, fileTransfer.saveFile, fileTransfer.receiverStatus);
}

fileTransfer.dataChannelOpenListener = function(id){
	console.log("Data channel established " + id);
	friendList.get(id).data.enabled = true;
	controller.sendSignal(id, (friendList.get(controller.myId).audiovideo.audioMuted ? "disableAudio" : "enableAudio"));
	controller.sendSignal(id, (friendList.get(controller.myId).audiovideo.videoMuted ? "disableVideo" : "enableVideo"));
	controller.updateGUI();
}

fileTransfer.dataChannelCloseListener = function(id) {
	console.log("Data channel closed " + id);
	friendList.get(id).data.enabled = false;
	controller.updateGUI();
}


fileTransfer.accept = function(id, fileNameList, wasAccepted) {
	if (fileTransfer.busy) wasAccepted(false);
	else {
		wasAccepted(true);
		fileTransfer.busy = true;
	}

}

fileTransfer.saveFile = function(id, file, filename) {
	easyrtc_ft.saveAs(file, filename);
}

fileTransfer.receiverStatus = function(id, msg) {
	if (msg.status === "progress") {
		var percent = (msg.received / msg.size) * 100;
		GUI.updateProgressBar(percent);
	}
	else if (msg.status === "done") {
		GUI.updateProgressBar();
		fileTransfer.busy = false;
	}
}

fileTransfer.handleDragOver = function(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	evt.dataTransfer.dropEffect = 'copy';
}

fileTransfer.sendFileChangeListener = function(evt) {
	var files = [];
	files.push(evt.target.files[0]);

	fileTransfer.files = files;
	fileTransfer.connect();
}

fileTransfer.handleDrop = function(evt) {
	evt.stopPropagation();
	evt.preventDefault();

	var files = [];
	files.push(evt.dataTransfer.files[0]);

	fileTransfer.sendFiles(files);
}


fileTransfer.sendFiles = function(files) {
	if (conversation.isFree()) return;

	if (!files) return;


	var fileSender;
	var participants = conversation.participants;
	for (var i in participants) {
		if (friendList.get(participants[i]).data.enabled) {
			fileSender = easyrtc_ft.buildFileSender(conversation.participants[i], fileTransfer.senderStatus);
			fileSender(files, true);
		}
		else {
			console.log("No datachannel exists with " + conversation.participants[i]);
		}
	}

}

fileTransfer.senderStatus = function(msg) {
	if (msg.status === "working") {
		var percent = (msg.position / msg.size) * 100;

		GUI.updateProgressBar(percent);
	}
	else if (msg.status === "done") {
		GUI.updateProgressBar();
		fileTransfer.busy = false;
	}
	else if (msg.status === "rejected") {
		console.log("File rejected");
		fileTransfer.busy = false;
	}
	return true;
}



