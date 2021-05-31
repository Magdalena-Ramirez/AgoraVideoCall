let handlefail = function (err) {
    console.log(err)
}

let appId = "e55d9ba6f7b9402a87a301fc30fd2213";
let globalStream;
var isAudioMuted = false;
var isVideoMuted = false;

let client = AgoraRTC.createClient({
    mode: "live",
    codec: "h264"
})

client.init(appId, () => console.log("AgoraRTC Client Connected"), handlefail
)

function removeMyVideoStream() {
    globalStream.stop();
}

function removeVideoStream(evt) {
    let stream = evt.stream;
    stream.stop();
    let remDiv = document.getElementById(stream.getId())
    remDiv.parentNode.removeChild(remDiv);
}

function addVideoStream(streamId) {
    console.log()
    let remoteContainer = document.getElementById("remoteStream");
    let streamDiv = document.createElement("div");
    streamDiv.id = streamId;
    // streamDiv.style.transform = "rotateY(180deg)";
    streamDiv.style.height = "250px"
    remoteContainer.appendChild(streamDiv)
}

document.getElementById("join").onclick = function () {
    let channelName = document.getElementById("channelName").value;
    let Username = document.getElementById("username").value;

    client.join(
        null,
        channelName,
        Username,
        () => {
            var localStream = AgoraRTC.createStream({
                video: true,
                audio: true,
            })

            localStream.init(function () {
                localStream.play("SelfStream")
                console.log(`App id: ${appId}\nChannel id: ${channelName}`)
                client.publish(localStream)
            })

            globalStream = localStream
        }
    )

    client.on("stream-added", function (evt) {
        console.log("Added Stream");
        client.subscribe(evt.stream, handlefail)
    })

    client.on("stream-subscribed", function (evt) {
        console.log("Subscribed Stream");
        let stream = evt.stream;
        addVideoStream(stream.getId());
        stream.play(stream.getId());
    })


    client.on("peer-leave", function (evt) {
        console.log("Peer has left")
        removeVideoStream(evt)
    }
    )
}

document.getElementById("video-mute").onclick = function () {
    if (!isVideoMuted) {
        globalStream.muteVideo();
        isVideoMuted = true;
    }
    else {
        globalStream.unmuteVideo();
        isVideoMuted = false;
    }
}

document.getElementById("audio-mute").onclick = function () {
    if (!isAudioMuted) {
        globalStream.muteAudio();
        isAudioMuted = true;
    }
    else {
        globalStream.unmuteAudio();
        isAudioMuted = false;
    }
}

document.getElementById("leave").onclick = function () {
    client.leave(function () {
        console.log("User left!");
    }, handlefail)
    removeMyVideoStream();
}