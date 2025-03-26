import React, { useEffect, useRef, useState } from "react";
import { getSocket } from "../util/socketAction";
import { Button } from "flowbite-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { AiOutlineAudioMuted } from "react-icons/ai";
import { CiMicrophoneOn, CiVideoOn, CiVideoOff } from "react-icons/ci";
import { FcEndCall } from "react-icons/fc";

export default function Call() {
  const [mute, setMute] = useState(false);
  const [video, setVideo] = useState(false);
  const socket = getSocket();
  const videoGrid = useRef();
  const userVideo = useRef();
  const remoteVideo = useRef();
  const pc = useRef();
  const location = useLocation();
  const { id1, isCaller } = location.state || {};
  const user = useSelector((state) => state.user);
  const navigate = useNavigate()

  useEffect(() => {
    if (id1 == null) {
      if (window.history.length > 1) {
        navigate(-1)
      }
      else {
        navigate('/chat')
      }
    }
  }, [])

  useEffect(() => {
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
          optional: [{ DtlsSrtpKeyAgreement: true }],
        });

        stream.getTracks().forEach((track) => {
          pc.current.addTrack(track, stream);
        });

        pc.current.onicecandidate = (e) => {
          if (e.candidate) {
            socket.emit("ice-candidate", { candidate: e.candidate, id: id1 });
          }
        };

        pc.current.ontrack = (e) => {
          if (e.streams && e.streams[0] && remoteVideo.current) {
            remoteVideo.current.srcObject = e.streams[0];
          } else {
            console.error("No remote stream or video element not found.");
          }
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
        socket.on("end-call", handleCallEnd)
      })
      .catch((err) => console.log("Error in accessing camera or mic ", err));

    return () => {
      //   localStream?.getTracks()?.forEach((track) => track.stop());
      // pc.current?.close();
    };
  }, []);

  const handleOffer = async (offer) => {
    try {
      await pc.current.setRemoteDescription(
        new RTCSessionDescription(offer?.offer)
      );
    } catch (err) {
      console.error("Failed to set remote description", err);
    }
    if (pc.current.pendingCandidates) {
      pc.current.pendingCandidates.forEach(async (e) => {
        try {
          await pc.current.addIceCandidate(e.candidate);
        } catch (error) {
          console.log("Error while adding pending candidate ", error);
        }
      });
      pc.current.pendingCandidates = [];
    }

    const answer = await pc.current.createAnswer();
    await pc.current.setLocalDescription(answer);
    socket.emit("answer", {
      to: offer?.from,
      id: user?.currentUser?._id,
      answer: pc.current.localDescription,
    });
  };

  const handleAnswer = (answer) => {
    pc.current.setRemoteDescription(new RTCSessionDescription(answer?.answer));
  };

  const handleRemoteIce = async (candidate) => {
    if (candidate?.candidate) {
      if (pc.current.remoteDescription) {
        try {
          await pc.current.addIceCandidate(candidate.candidate);
        } catch (e) {
          console.error("Error adding received ice candidate", e);
        }
      } else {
        console.warn(
          "Remote description not set. Storing candidate for later."
        );
        if (!pc.current.pendingCandidates) {
          pc.current.pendingCandidates = [];
        }
        pc.current.pendingCandidates.push(candidate);
      }
    }
  };

  const handleCallEnd = () => {
    try {
      userVideo.current.srcObject
        .getAudioTracks()
        .forEach((track) => track.stop());
      userVideo.current.srcObject
        .getVideoTracks()
        .forEach((track) => track.stop());
      pc?.current?.close();
      if (window.history.length > 1) {
        navigate(-1) 
      }
      else {
        navigate("/chat")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const handleMute = () => {
    if (!mute) {
      userVideo.current.srcObject
        .getAudioTracks()
        .forEach((track) => (track.enabled = false));
    } else {
      userVideo.current.srcObject
        .getAudioTracks()
        .forEach((track) => (track.enabled = true));
    }
    setMute(!mute);
  };

  const handleVideo = () => {
    if (!video) {
      userVideo.current.srcObject
        .getVideoTracks()
        .forEach((track) => (track.enabled = false));
    } else {
      userVideo.current.srcObject
        .getVideoTracks()
        .forEach((track) => (track.enabled = true));
    }
    setVideo(!video);
  };

  const handleEndCall = () => {
    try {
      userVideo.current.srcObject
        .getAudioTracks()
        .forEach((track) => track.stop());
      userVideo.current.srcObject
        .getVideoTracks()
        .forEach((track) => track.stop());
      socket.emit('end-call', {
        to: id1
      })
      pc?.current?.close();
      if (window.history.length > 1) {
        navigate(-1) 
      }
      else {
        navigate("/chat")
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex flex-col max-h-screen mb-2">
      <div ref={videoGrid} className="flex-1 grid grid-cols-2 gap-4 p-4">
        <video
          muted
          autoPlay
          playsInline
          className="w-full [height:calc(100vh-80px)] object-cover rounded-lg"
          ref={userVideo}
        ></video>
        <video
          autoPlay
          playsInline
          className="w-full [height:calc(100vh-80px)] object-cover rounded-lg"
          ref={remoteVideo}
        ></video>
      </div>

      <div className="p-4 bg-gray-800 flex justify-center gap-4">
        <Button
          className="p-3 rounded-full text-white"
          size="sm"
          onClick={handleEndCall}
        >
          <FcEndCall className="text-2xl" />
        </Button>
        <Button
          className="p-3 bg-gray-600 rounded-full text-white"
          size="sm"
          onClick={handleVideo}
        >
          {video ? (
            <CiVideoOff className="text-2xl" />
          ) : (
            <CiVideoOn className="text-2xl" />
          )}
        </Button>
        <Button
          className="p-3 bg-gray-600 rounded-full text-white"
          size="sm"
          onClick={handleMute}
        >
          {mute ? (
            <AiOutlineAudioMuted className="text-2xl" />
          ) : (
            <CiMicrophoneOn className="text-2xl" />
          )}
        </Button>
      </div>
    </div>
  );
}
