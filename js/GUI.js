var GUI = {
	videoVisible: false,
	documentTitle: "Webrtc Chat",
	focus: true,
	friends: []
};

GUI.setup = function() {

	var messageField = document.getElementById("sendMessageField");
	messageField.onkeyup = function(e) {
		if (e.keyCode === 13) {
			controller.sendMessage();
		}
	}

	var dropZone = document.getElementById('chatArea');
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

}

GUI.focusize = function() {
	var messageField = document.getElementById("sendMessageField");
	messageField.focus();
}

GUI.setButtonDisabled = function(id, disabled) {
	var button = document.getElementById(id);
	button.disabled = disabled;
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

		if (controller.friendSelectMode) {
			glyphs.style.visibility = "visible";

			var untickedGlyph = document.createElement("span");

			if (controller.isFriendSelected(id)) {

				untickedGlyph.className = "glyph glyphicon glyphicon-check";
			}
			else {
				untickedGlyph.className = "glyph glyphicon glyphicon-unchecked";
			}
			untickedGlyph.onclick = function(id) {


				return function() {
					if (this.className.indexOf("unchecked") > 0) {
						this.className = "glyph glyphicon glyphicon-check";
						controller.toggleFriendSelect(id);
					}
					else {
						this.className = "glyph glyphicon glyphicon-unchecked";
						controller.toggleFriendSelect(id);

					}
				}
			}(id);


			glyphs.appendChild(untickedGlyph);
		}
		else {
			glyphs.style.visibility = "hidden";
			var startVideoButton = document.createElement("span");

			startVideoButton.className = "glyph glyphicon glyphicon-facetime-video";

			startVideoButton.onclick = function(id) {
				return function() {
					controller.call(id);
				}
			}(id);


			glyphs.appendChild(startVideoButton);


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
	var video = document.createElement("video");
	video.id = "video_" + id;
	videoArea.appendChild(video);
	this.videoElements++;
	return video;
}

deleteVideoElement = function(id) {
	var videoArea = document.getElementById("videoArea");
	var video = document.getElementById("video_" + id);
	if (!video) return;
	videoArea.removeChild(video);
	this.videoElements--;
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

