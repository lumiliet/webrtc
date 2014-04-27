var fileTransfer = {};


controller.dataChannelOpenListener = function(id){
	console.log("Data channel established " + id);
	conversationList.get(id).data = true;
	controller.updateGUI();
}

controller.dataChannelCloseListener = function(id) {
	console.log("Data channel closed " + id);
	conversationList.get(id).data = false;
	controller.updateGUI();
}

fileTransfer.startup = function() {
	easyrtc_ft.buildFileReceiver(fileTransfer.accept, fileTransfer.saveFile, fileTransfer.receiveStatus);
}

fileTransfer.sendFiles = function(files) {
	var fileSender;
	if (conversationList.getCurrent().data) {
		if (conversationList.getCurrent().multi) {
			var participants = conversationList.getCurrent().participants;
			for (var i in participants) {
				if (conversationList.get(participants[i]).data) {
					fileSender = easyrtc_ft.buildFileSender(conversationList.getCurrent().participants[i]);
					fileSender(files, true);
				}
				else {
					console.log("No datachannel exists with " + conversationList.getCurrent().participants[i]);
				}
			}
		}
		else {
			fileSender = easyrtc_ft.buildFileSender(conversationList.getCurrentId());
			fileSender(files, true);
		}
	}
}

fileTransfer.accept = function(id, fileNameList, wasAccepted) {
    wasAccepted(true);
}

fileTransfer.receiveStatus = function(id, msg) {
    //return true;
}

fileTransfer.saveFile = function(id, file, filename) {
    easyrtc_ft.saveAs(file, filename);
}

fileTransfer.sendFileChangeListener = function(evt) {
	var files = [];
	files.push(evt.target.files[0]);
	
	fileTransfer.sendFiles(files);
	
}

fileTransfer.handleDrop = function(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var files = [];
	files.push(evt.dataTransfer.files[0]);

	fileTransfer.sendFiles(files);
}

	
fileTransfer.handleDragOver = function(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy';
}

  

controller.dataCall = function(id) {
	console.log("Data call to "  + conversationList.get(id));
	if (!conversationList.get(id).online) {
		console.log("Call failed, friend no longer online");
		return;
	}
	if (conversationList.get(id).data) {
		console.log("Call failed, datachannel already exists ");
		return;
	}
	easyrtc.call(id,
		function(otherCaller, mediaType) {
			console.log("Call succesful - " + otherCaller + " - " + mediaType);
		},
		function(errorCode, errMessage) {
			console.log("Call failed - " + errorCode + " - " + errMessage);
		},
		function(wasAccepted, easyrtcid){
			if( wasAccepted ){
				console.log("call accepted by " + easyrtc.idToName(easyrtcid));
			}
			else{
			  	console.log("call rejected" + easyrtc.idToName(easyrtcid));
			}
		}
	);
}


controller.call = function() {
	if (!conversationList.getCurrentId()) return;
	
	if (conversationList.getCurrent().multi) {
		for (var i in conversationList.getCurrent().participants) {
			controller.dataCall(conversationList.getCurrent().participants[i]);
			conversationList.getCurrent().data = true;
			
			console.log("Data transfer enabled");
		}
	}
	else {
		controller.dataCall(conversationList.getCurrentId());
	}
	
	controller.updateGUI();
	
}

