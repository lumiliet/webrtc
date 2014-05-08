var fileTransfer = {
	busy: false
};

fileTransfer.setup= function() {
	easyrtc_ft.buildFileReceiver(fileTransfer.accept, fileTransfer.saveFile, fileTransfer.receiverStatus);
}

fileTransfer.dataChannelOpenListener = function(id){
	console.log("Data channel established " + id);
	conversationList.get(id).data = true;
	controller.updateGUI();

	if (fileTransfer.files) {
		fileTransfer.countCalls(fileTransfer.conversation.id, false);
	}
}

fileTransfer.dataChannelCloseListener = function(id) {
	console.log("Data channel closed " + id);
	conversationList.get(id).data = false;
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

	fileTransfer.files = files;
	fileTransfer.connect();
}


fileTransfer.connect = function() {
	if (fileTransfer.busy || videoCall.busy) return;
	fileTransfer.busy = true;

	var conversation = conversationList.getCurrent();
	if (!conversation) return;
	fileTransfer.conversation = conversation;

	if (conversation.isGroupConversation) {
		var participants = conversation.participants;

		for (var p in participants) {
			fileTransfer.call(participants[p], conversation.id);
		}
		fileTransfer.countCalls(conversation.id);
	}
	else {
		fileTransfer.call(conversation.id);
		fileTransfer.countCalls(conversation.id);
	}
	controller.updateGUI();
}

fileTransfer.call = function(id, conversationId) {
	console.log("Call to "  + conversationList.get(id));
	if (!conversationList.get(id).online) {
		console.log("Call failed, friend no longer online");
		return;
	}
	if (conversationList.get(id).data) {
		console.log("Data call already established");
		return;
	}

	if (conversationId) {
		fileTransfer.countCalls(conversationId, true);
	}
	else {
		fileTransfer.countCalls(id, true);
	}

	easyrtc.call(id,
		function(otherCaller, mediaType) {
			console.log("Call succesful - " + otherCaller + " - " + mediaType);
		},
		function(errorCode, errMessage) {
			console.log("Call failed - " + errorCode + " - " + errMessage);
		},
		function(){
			return function(wasAccepted, easyrtcid) {
				if(wasAccepted){
					console.log("call accepted by " + easyrtc.idToName(easyrtcid));
				}
				else{
					console.log("call rejected" + easyrtc.idToName(easyrtcid));
				}
			}
		}(conversationId)
	);
}

fileTransfer.countCalls = function(conversationId, increment) {
	var conversation = conversationList.get(conversationId);
	if (increment === undefined);
	else if (increment) conversation.callCounter.file ++;
	else conversation.callCounter.file --;
	if (conversation.callCounter.file === 0) {
		if (fileTransfer.files) {
			fileTransfer.sendFiles();
			fileTransfer.finished();
		}
	}
	else {
	}
}

fileTransfer.sendFiles = function() {
	var files = fileTransfer.files;
	if (!files) return;

	var conversation = fileTransfer.conversation;

	var fileSender;
	if (conversation.isGroupConversation) {
		var participants = conversation.participants;
		for (var i in participants) {
			if (conversationList.get(participants[i]).data) {
				fileSender = easyrtc_ft.buildFileSender(conversation.participants[i], fileTransfer.senderStatus);
				fileSender(files, true);
			}
			else {
				console.log("No datachannel exists with " + conversation.participants[i]);
			}
		}
	}
	else if (conversation.data) {
		fileSender = easyrtc_ft.buildFileSender(conversationList.getCurrentId(), fileTransfer.senderStatus);
		fileSender(files, true);
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


fileTransfer.finished= function() {

	delete fileTransfer.files;
	delete fileTransfer.conversation;

}

