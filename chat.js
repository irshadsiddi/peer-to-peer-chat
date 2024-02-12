let localConnection;
        let remoteConnection;
        let sendChannel;
        let receiveChannel;

        function sendMessage() {
            const messageInput = document.getElementById('messageInput');
            const message = messageInput.value;
            sendChannel.send(message);
            messageInput.value = '';
            appendMessage('You: ' + message);
        }

        function appendMessage(message) {
            const messagesTextarea = document.getElementById('messages');
            messagesTextarea.value += message + '\n';
            messagesTextarea.scrollTop = messagesTextarea.scrollHeight;
        }

        function createConnection() {
            const configuration = {
                iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
            };

            localConnection = new RTCPeerConnection(configuration);
            remoteConnection = new RTCPeerConnection(configuration);

            localConnection.onicecandidate = event => {
                if (event.candidate) {
                    remoteConnection.addIceCandidate(event.candidate);
                }
            };

            remoteConnection.onicecandidate = event => {
                if (event.candidate) {
                    localConnection.addIceCandidate(event.candidate);
                }
            };

            sendChannel = localConnection.createDataChannel('sendChannel');
            sendChannel.onmessage = event => {
                appendMessage('Friend: ' + event.data);
            };

            localConnection.createOffer().then(offer => {
                return localConnection.setLocalDescription(offer);
            }).then(() => {
                return remoteConnection.setRemoteDescription(localConnection.localDescription);
            }).then(() => {
                return remoteConnection.createAnswer();
            }).then(answer => {
                return remoteConnection.setLocalDescription(answer);
            }).then(() => {
                return localConnection.setRemoteDescription(remoteConnection.localDescription);
            }).catch(handleError);
        }

        function handleError(error) {
            console.error('Error:', error);
        }

        createConnection();