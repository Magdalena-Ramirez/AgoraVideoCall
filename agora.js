let handlefail = function (err) {
    console.log(err)
}

let appId = "e55d9ba6f7b9402a87a301fc30fd2213";
let globalStream;
var isAudioMuted=false;
var isVideoMuted=false;

let client = AgoraRTC.createClient({
    mode: "live",
    codec: "h264"
})

client.init(appId, () => console.log("AgoraRTC Client Connected"), handlefail
)

function removeMyVideoStream() {
    globalStream.stop();
}

function removeVideoStream(evt) { //video not you removes theirs
    let stream = evt.stream;
    stream.stop();
    let remDiv = document.getElementById(stream.getId())
    remDiv.parentNode.removeChild(remDiv);
}

function addVideoStream(streamId) {
    console.log()
    let remoteContainer = document.getElementById("remoteStream");
    let streamDiv = document.createElement("div"); //create div inside romote stream div
    streamDiv.id = streamId;
    // streamDiv.style.transform = "rotateY(180deg)"; 
    streamDiv.style.height = "250px" //same height of remote stream
    remoteContainer.appendChild(streamDiv)
}

document.getElementById("join").onclick = function () { //join a call
    let channelName = document.getElementById("channelName").value;
    let Username = document.getElementById("username").value;

    client.join( //client w/ join function
        null,
        channelName,
        Username,
        () => {
            var localStream = AgoraRTC.createStream({ //create stream
                video: true, //w/ video
                audio: true, //and with audio
            })

            localStream.init(function () {
                localStream.play("SelfStream")
                console.log(`App id: ${appId}\nChannel id: ${channelName}`)
                client.publish(localStream) //publish stream
            })

            globalStream = localStream
        }
    )

    client.on("stream-added", function (evt) { //notify when user has joined call
        console.log("Added Stream");
        client.subscribe(evt.stream, handlefail)
    })

    client.on("stream-subscribed", function (evt) { //when user subsribes to stream
        console.log("Subscribed Stream");
        let stream = evt.stream;
        addVideoStream(stream.getId()); //for remote user
        stream.play(stream.getId());
    })


    client.on("peer-leave", function (evt) { //one of peers has left the call
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