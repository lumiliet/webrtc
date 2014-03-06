var fileTransfer = {};

fileTransfer.startup = function() {
	easyrtc_ft.buildFileReceiver(fileTransfer.accept, fileTransfer.saveFile, fileTransfer.receiveStatus);
}

fileTransfer.sendFiles = function() {
	var files = [];
	files[0] = document.getElementById('files').files[0];
	
	if (conversationList.getCurrent().data) {		
		var fileSender = easyrtc_ft.buildFileSender(conversationList.getCurrentId());
		fileSender(files, true);
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

