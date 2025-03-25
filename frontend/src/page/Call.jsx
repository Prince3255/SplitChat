import React, { useEffect, useRef, useState } from "react";
import { getSocket } from "../util/socketAction";
import { Button } from "flowbite-react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Call() {
  const [localStream, setLocalStream] = useState(null);
  const socket = getSocket();
  const videoGrid = useRef();
  const userVideo = useRef();
  const remoteVideo = useRef();
  const pc = useRef();
  const location = useLocation();
  const { id1, isCaller } = location.state || {};
  const user = useSelector((state) => state.user);

  useEffect(() => {
    // console.log("id1", id1, isCaller);
    navigator.mediaDevices
      .getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: true,
      })
      .then((stream) => {
        // setLocalStream(stream);
        userVideo.current.srcObject = stream;

        pc.current = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });
        // console.log("pc", pc);

        stream.getTracks().forEach((track) => {
          // console.log("track", track);
          pc.current.addTrack(track, stream);
        });

        pc.current.onicecandidate = (e) => {
          if (e.candidate) {
            socket.emit("ice-candidate", { candidate: e.candidate, id: id1 });
          }
        };

        pc.current.ontrack = (e) => {
          console.log("e", e.streams);
          const [remoteStream] = e.streams;
          remoteVideo.current.srcObject = remoteStream;
        };

        if (isCaller) {
          pc.current
            .createOffer()
            .then((offer) => pc.current.setLocalDescription(offer))
            .then(() => {
              socket.emit("offer", {
                to: id1,
                offer: pc.current.localDescription,
                callerId: user?.currentUser?._id,
              });
            });
        }

        socket.on("offer", handleOffer);
        socket.on("answer", handleAnswer);
        socket.on("ice-candidate", handleRemoteIce);
      })
      .catch((err) => console.log("Error in accessing camera or mic ", err));

    return () => {
      //   localStream?.getTracks()?.forEach((track) => track.stop());
      socket.current.disconnect();
      // pc.current?.close();
    };
  }, []);

  const handleOffer = async (offer) => {
    console.log("offer", offer);
    await pc.current.setRemoteDescription(
      new RTCSessionDescription(offer?.offer)
    );

    if (pc.current.pendingCandidates) {
      console.log('pending candidate ', pc.current.pendingCandidates);
      pc.current.pendingCandidates.forEach(async (e) => {
        try {
          await pc.current.addIceCandidate(new RTCIceCandidate(e.candidate));
        } catch (error) {
          console.log('Error while adding pending candidate ', error);
        }
      })
      pc.current.pendingCandidates = []
    }

    const answer = await pc.current.createAnswer();
    await pc.current.setLocalDescription(answer);
    console.log("pc12", pc);
    socket.emit("answer", {
      to: offer?.from,
      answer: answer,
    });
  };

  const handleAnswer = (answer) => {
    console.log("answer", answer);
    pc.current.setRemoteDescription(new RTCSessionDescription(answer?.answer));
  };

  const handleRemoteIce = async (candidate) => {
    console.log("Received ICE Candidate", candidate);
    if (candidate?.candidate) {
      if (pc.current.remoteDescription) {
        const rtcCandidate = new RTCIceCandidate({
          candidate: candidate.candidate.candidate,
          sdpMLineIndex: candidate.candidate.sdpMLineIndex,
          sdpMid: candidate.candidate.sdpMid,
          usernameFragment: candidate.candidate.usernameFragment,
        });
        try {
          await pc.current.addIceCandidate(new RTCIceCandidate(rtcCandidate));
        } catch (e) {
          console.error("Error adding received ice candidate", e);
        }
      } else {
        console.warn("Remote description not set. Storing candidate for later.");
        if (!pc.current.pendingCandidates) {
          pc.current.pendingCandidates = [];
        }
        pc.current.pendingCandidates.push(candidate);
      }
    }
  };  

  return (
    <div className="flex flex-col h-screen">
      <div ref={videoGrid} className="flex-1 grid grid-cols-2 gap-4 p-4">
        <video
          autoPlay
          playsInline
          className="w-full h-full object-cover rounded-lg"
          ref={userVideo}
        />
        <video
          autoPlay
          playsInline
          className="w-full h-full object-cover rounded-lg"
          ref={remoteVideo}
        />
      </div>

      <div className="p-4 bg-gray-800 flex justify-center gap-4">
        <Button className="p-3 bg-red-500 rounded-full text-white" size="sm">
          End Call
        </Button>
        <Button className="p-3 bg-gray-600 rounded-full text-white" size="sm">
          Toggle Video
        </Button>
        <Button className="p-3 bg-gray-600 rounded-full text-white" size="sm">
          Mute
        </Button>
      </div>
    </div>
  );
}
