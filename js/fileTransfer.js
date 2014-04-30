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

