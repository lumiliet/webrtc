var GUI = {
	videoVisible: false,
	documentTitle: "Webrtc Chat",
	focus: true,
	friends: [],
	chat: false,
};

GUI.setup = function() {
	var dropZone = document.getElementById('videoArea');
	dropZone.addEventListener('dragover', fileTransfer.handleDragOver);
	dropZone.addEventListener('drop', fileTransfer.handleDrop);

	document.onkeyup = controller.documentKeyListener;

	document.title = GUI.documentTitle;

	window.onblur = function() {
		GUI.focus = false;
	};
	window.onfocus = function() {
		GUI.focus = true;
		GUI.notification("", true);
	};

	var friendList = document.getElementById("friendList");
	friendList.onscroll = function() {
		controller.updateGUI();
	}

	var exitButton = document.getElementById("exitButton");
	exitButton.onclick= function() {
		controller.disconnect();
	}
	var messageField = document.getElementById("sendMessageField");
	messageField.onkeyup = function(e) {
		if (e.keyCode === 13) {
			controller.sendMessage();
		}
	}

	var chatEdge = document.getElementById("chatEdge");
	chatEdge.onclick = function() {
		GUI.showChat(!GUI.chat);
		GUI.chat = !GUI.chat;
		GUI.focusize();
	}; 

	var dropZone = document.getElementById('chatArea');
	dropZone.addEventListener('dragover', fileTransfer.handleDragOver);
	dropZone.addEventListener('drop', fileTransfer.handleDrop);

}

GUI.focusize = function() {
	var messageField = document.getElementById("sendMessageField");
	messageField.focus();
}

GUI.setButtonDisabled = function(id, disabled) {
	var button = document.getElementById(id);
	button.disabled = disabled;
}

GUI.setExitButtonVisible = function(visible) {
	var button = document.getElementById("exitButton");
	if (visible) button.style.display = "block";
	else button.style.display = "none";
}

GUI.setButtonText = function(id, text) {
	var button = document.getElementById(id);
	button.innerHTML = text;
}

GUI.writeMessageToChat = function(message) {
	var chatArea = document.getElementById("chatArea");
	var html = GUI.generateMessageHTML(message);
	chatArea.innerHTML += html;

	chatArea.scrollTop = chatArea.scrollHeight;
}

GUI.cleanChat = function() {
	var chatArea = document.getElementById("chatArea");
	chatArea.innerHTML = "";
}

GUI.getTextFromMessageField = function() {
	var messageField = document.getElementById("sendMessageField");
	return messageField.value;
}

GUI.cleanMessageField = function() {
	var messageField = document.getElementById("sendMessageField");
	messageField.value = "";
}

GUI.notification = function(name, reset) {
	if (reset) document.title = this.documentTitle;
	else if (!GUI.focus){
		document.title = "New message from " + name + " - " + this.documentTitle;	
	}
}

GUI.setChatLabel = function(text) {
	var chatLabel = document.getElementById("midLabel");
	chatLabel.innerHTML = text;
}

GUI.updateFriendList = function(friends) {
	if (friends) GUI.friends = friends;
	else friends = GUI.friends;


	var friendList = document.getElementById("friendList");

	while (friendList.hasChildNodes()) {
		friendList.removeChild(friendList.lastChild);
	}

	for (var id in friends) {
		var friend = document.createElement("div");
		friend.className = "friend";
		var friendText = document.createElement("span");
		friendText.className = "friendText";
		friendText.innerHTML += easyrtc.idToName(id);
		friend.id = "friend_" + id;


		friend.appendChild(friendText);

		var glyphs = document.createElement("span");
		glyphs.className = "friendGlyphContainer";

		glyphs.style.visibility = "hidden";
		var addFriendToConversationButton = document.createElement("span");

		addFriendToConversationButton.className = "glyph glyphicon glyphicon-plus";

		addFriendToConversationButton.onclick = function(id) {
			return function() {
				controller.initiateConversation(id);
			}
		}(id);

		glyphs.appendChild(addFriendToConversationButton);

		friend.onmouseover = function(glyphs) {
			return function() {
				glyphs.style.visibility = "visible";
			}
		}(glyphs);

		friend.onmouseout = function(glyphs) {
			return function() {
				glyphs.style.visibility = "hidden";
			}
		}(glyphs);

	}
	friend.appendChild(glyphs);

	friendList.appendChild(friend);
}

GUI.generateMessageHTML = function(message) {
	var messageLabel = document.createElement("div");
	messageLabel.className = "chatMessage";

	var senderSpan = document.createElement("span");
	senderSpan.className = "h4";
	senderSpan.innerHTML += message.sender + ": ";

	var messageText = document.createTextNode(message.message);
	messageLabel.appendChild(senderSpan);
	messageLabel.appendChild(messageText);

	return messageLabel.outerHTML;
}

GUI.videoElements = 0;

GUI.createVideoElement = function(id) {
	var videoArea = document.getElementById("videoArea");
	var videoContainer = document.createElement("div");
	var video = document.createElement("video");
	var videoTitle = document.createElement("div");

	var glyphs = document.createElement("span");
	glyphs.className = "videoTitle";

	var videoGlyph = document.createElement("span");
	videoGlyph.className = "videoButton glyphicon glyphicon-eye-open";
	videoGlyph.id = "videoGlyph_" + id;
	videoGlyph.onclick = function(id) {
		return function() {
			if (this.className.indexOf("open") > 0) {
				videoCall.enableVideo(id,false);
			}
			else {
				videoCall.enableVideo(id,true);
			}
		}
	}(id);

	var audioGlyph = document.createElement("span");
	audioGlyph.className = "videoButton glyphicon glyphicon-volume-up";
	audioGlyph.onclick = function(id) {
		return function() {
			if (this.className.indexOf("up") > 0) {
				videoCall.enableAudio(id,false);			
			}
			else {
				videoCall.enableAudio(id,true);			
			}
		}
	}(id);
	audioGlyph.id = "audioGlyph_" + id;

	var videoText = document.createElement("span");
	videoText.className = "videoText";
	videoText.innerHTML = (id === controller.myId ? "Me" : friendList.get(id).username);
	
	
	glyphs.appendChild(videoText);
	glyphs.appendChild(videoGlyph);
	glyphs.appendChild(audioGlyph);

	videoTitle.className = "videoTitleContainer";
	videoTitle.appendChild(glyphs);
	videoContainer.id = "videoContainer_" + id;
	video.id = "video_" + id;
	videoContainer.className = "videoContainer";
	video.className = "videoElement";
	if (id === controller.myId) video.muted = true;
	videoContainer.appendChild(videoTitle);
	videoContainer.appendChild(video);
	videoArea.appendChild(videoContainer);
	this.videoElements++;
	GUI.updateVideoElements();
	return video;
}

GUI.setAudioGlyphStatus = function(id, status) {
	var glyph = document.getElementById("audioGlyph_" + id);
	if (status)	glyph.className = "videoButton glyphicon glyphicon-volume-up";
	else glyph.className = "videoButton glyphicon glyphicon-volume-off";
}

GUI.setVideoGlyphStatus = function(id, status) {
	var glyph = document.getElementById("videoGlyph_" + id);
	if (status)	glyph.className = "videoButton glyphicon glyphicon-eye-open";
	else glyph.className = "videoButton glyphicon glyphicon-eye-close";
}

GUI.deleteVideoElement = function(id) {
	var videoArea = document.getElementById("videoArea");
	var video = document.getElementById("videoContainer_" + id);
	if (!video) return;
	videoArea.removeChild(video);
	this.videoElements--;
	GUI.updateVideoElements();
}

GUI.updateProgressBar = function(value) {
	var progressBarContainer = document.getElementById("progressBarContainer");
	if (!value) {
		progressBarContainer.className = "progress hidden";
		document.getElementById("mainContainer").className = "row";
	}
	else {
		progressBarContainer.className = "progress";
		document.getElementById("mainContainer").className = "row smaller";
		var progressBar = document.getElementById("progressBar");
		progressBar.style.width = value + "%";
	}
}

GUI.updateVideoElements = function() {
	
	var width = 100;
	var height = 100;

	var elements = GUI.videoElements;

	if (elements <= 0);
	else if (elements <= 2) width /= elements;
	else if (elements <= 4) {
		width /= 2; 
		height /= 2;
	}
	else {
		width /= 3;
		height /= (Math.floor((elements - 1)/3) + 1);
	}
	var videoContainers = document.getElementsByClassName("videoContainer");

	for (var i = 0; i < videoContainers.length; i++) {
		videoContainers[i].style.width = width + "%";
		videoContainers[i].style.height = height + "%";

	}
}

GUI.showChat = function(show) {
	var leftCol = document.getElementById("leftCol");
	var midCol = document.getElementById("midCol");
	var chatContainer = document.getElementById("chatContainer");
	if (show) {
		leftCol.className = "col-xs-3 fill";
		midCol.className = "col-xs-6 fill";
		chatContainer.className = "";
	}
	else {
		leftCol.className = "small col-xs-3 fill";
		midCol.className = "col-xs-9 fill";
		chatContainer.className = "hidden";
	
	}
	controller.updateChat();
}

GUI.enableVideo = function(id, enable) {
	var videoElement = document.getElementById("video_"+ id);
	GUI.setVideoGlyphStatus(id, enable);
	if (enable) {
		videoElement.style.visibility = "visible";
	}
	else {
		videoElement.style.visibility = "hidden";
	}
}

GUI.enableAudio = function(id, enable) {
	easyrtc.muteVideoObject("video_" + id, !enable);
	GUI.setAudioGlyphStatus(id, enable);
}
