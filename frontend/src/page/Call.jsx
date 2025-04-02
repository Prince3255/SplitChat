// import React, { useEffect, useRef, useState } from "react";
// import { getSocket } from "../util/socketAction";
// import { Button } from "flowbite-react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { AiOutlineAudioMuted } from "react-icons/ai";
// import { CiMicrophoneOn, CiVideoOn, CiVideoOff } from "react-icons/ci";
// import { FcEndCall } from "react-icons/fc";
// import { setCalling } from "../redux/user/userSlice";
// import { MdOutlineFlipCameraIos } from "react-icons/md";
// import toast from "react-hot-toast";

// export default function Call() {
//   const [mute, setMute] = useState(false);
//   const [video, setVideo] = useState(true);
//   const [camera, setCamera] = useState(false);
//   const [backCamera, setBackCamera] = useState(false);
//   const socket = getSocket();
//   const videoGrid = useRef();
//   const userVideo = useRef();
//   const remoteVideo = useRef();
//   const pc = useRef();
//   const localStream = useRef();
//   const location = useLocation();
//   const { id1, isCaller } = location.state || {};
//   const user = useSelector((state) => state.user);
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   useEffect(() => {
//     if (id1 == null) {
//       if (window.history.length > 1) {
//         navigate(-1);
//       } else {
//         navigate("/chat");
//       }
//     }
//   }, []);

//   const startStream = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         audio: {
//           echoCancellation: true,
//           noiseSuppression: true,
//           autoGainControl: true,
//         },
//         video: {
//           facingMode: camera ? "environment" : "user",
//         },
//       });
//       localStream.current = stream;
//       userVideo.current.srcObject = stream;

//       const device = await navigator.mediaDevices.enumerateDevices();
//       const videoDevices = device.filter((d) => d.kind === "videoinput");
//       const hasBackCamera = videoDevices.some(
//         (device) =>
//           device.label.toLowerCase().includes("back") ||
//           device.label.toLowerCase().includes("environment")
//       );
//       setBackCamera(hasBackCamera);

//       pc.current = new RTCPeerConnection({
//         iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
//       });

//       pc.current.pendingCandidates = [];

//       stream.getTracks().forEach((track) => pc.current.addTrack(track, stream));

//       pc.current.onicecandidate = (e) => {
//         if (e.candidate) {
//           socket.emit("ice-candidate", { candidate: e.candidate, id: id1 });
//         }
//       };

//       pc.current.ontrack = (e) => {
//         if (e.streams && e.streams[0] && remoteVideo.current) {
//           remoteVideo.current.srcObject = e.streams[0];
//         }
//       };

//       if (isCaller) {
//         const offer = await pc.current.createOffer();
//         await pc.current.setLocalDescription(offer);
//         socket.emit("offer", {
//           to: id1,
//           offer: pc.current.localDescription,
//           callerId: user?.currentUser?._id,
//         });
//       }
//     } catch (error) {
//       toast.error(`Failed to access camera/microphone: ${error.message}`);
//       console.error("Error in accessing media devices:", error);
//     }
//   };

//   useEffect(() => {
//     startStream();

//     socket.on("offer", handleOffer);
//     socket.on("answer", handleAnswer);
//     socket.on("ice-candidate", handleRemoteIce);
//     socket.on("end-call", handleCallEnd);

//     return () => {
//       if (localStream.current) {
//         localStream.current.getTracks().forEach((track) => track.stop());
//       }
//       pc.current?.close();
//       socket.off("offer", handleOffer);
//       socket.off("answer", handleAnswer);
//       socket.off("ice-candidate", handleRemoteIce);
//       socket.off("end-call", handleCallEnd);
//     };
//   }, [id1, isCaller, user?.currentUser?._id]);

//   // useEffect(() => {
//   //   navigator.mediaDevices
//   //     .enumerateDevices()
//   //     .then((devices) => {
//   //       const videoDevices = devices.filter((d) => d.kind === "videoinput");

//   //       const backCamera1 = videoDevices.find(
//   //         (device) =>
//   //           device.label.toLowerCase().includes("back") ||
//   //           device.label.toLowerCase().includes("environment")
//   //       );

//   //       if (backCamera1) {
//   //         setBackCamera(backCamera1);
//   //       } else {
//   //         console.log("No back camera found. Using front camera.");
//   //       }
//   //     })
//   //     .catch((err) => {
//   //       toast.error('abcd', err)
//   //       console.error("Error while getting camera devices:", err);
//   //     });
//   // }, []);

//   // useEffect(() => {
//   //   navigator.mediaDevices
//   //     .getUserMedia({
//   //       audio: {
//   //         echoCancellation: true,
//   //         noiseSuppression: true,
//   //         autoGainControl: true,
//   //       },
//   //       video: {
//   //         facingMode: camera ? "environment" : "user",
//   //       },
//   //     })
//   //     .then((stream) => {
//   //       // setLocalStream(stream);
//   //       userVideo.current.srcObject = stream;

//   //       pc.current = new RTCPeerConnection({
//   //         iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
//   //       });

//   //       stream.getTracks().forEach((track) => {
//   //         pc.current.addTrack(track, stream);
//   //       });

//   //       pc.current.onicecandidate = (e) => {
//   //         if (e.candidate) {
//   //           socket.emit("ice-candidate", { candidate: e.candidate, id: id1 });
//   //         }
//   //       };

//   //       pc.current.ontrack = (e) => {
//   //         if (e.streams && e.streams[0] && remoteVideo.current) {
//   //           remoteVideo.current.srcObject = e.streams[0];
//   //         } else {
//   //           console.error("No remote stream or video element not found.");
//   //         }
//   //       };

//   //       if (isCaller) {
//   //         pc.current
//   //           .createOffer()
//   //           .then((offer) => pc.current.setLocalDescription(offer))
//   //           .then(() => {
//   //             socket.emit("offer", {
//   //               to: id1,
//   //               offer: pc.current.localDescription,
//   //               callerId: user?.currentUser?._id,
//   //             });
//   //           });
//   //       }

//   //       socket.on("offer", handleOffer);
//   //       socket.on("answer", handleAnswer);
//   //       socket.on("ice-candidate", handleRemoteIce);
//   //       socket.on("end-call", handleCallEnd);
//   //     })
//   //     .catch((err) => console.log("Error in accessing camera or mic ", err));

//   //   return () => {
//   //     //   localStream?.getTracks()?.forEach((track) => track.stop());
//   //     // pc.current?.close();
//   //     socket.off("offer", handleOffer);
//   //     socket.off("answer", handleAnswer);
//   //     socket.off("ice-candidate", handleRemoteIce);
//   //     socket.off("end-call", handleCallEnd);
//   //   };
//   // }, []);

//   const flipCamera = async () => {
//     if (!backCamera) return;
//     setCamera((prev) => !prev);
//     if (localStream.current) {
//       localStream.current.getTracks().forEach((track) => track.stop());
//     }
//     if (!backCamera || !pc.current) return;
//     setCamera((prev) => !prev);
//     if (localStream.current) {
//       localStream.current.getTracks().forEach((track) => track.stop());
//     }
//     try {
//       const newStream = await navigator.mediaDevices.getUserMedia({
//         audio: {
//           echoCancellation: true,
//           noiseSuppression: true,
//           autoGainControl: true,
//         },
//         video: {
//           facingMode: !camera ? "environment" : "user", // Use !camera since state isn’t updated yet
//         },
//       });
//       localStream.current = newStream;
//       userVideo.current.srcObject = newStream;

//       // Replace tracks in the existing peer connection
//       const senders = pc.current.getSenders();
//       const videoTrack = newStream.getVideoTracks()[0];
//       const audioTrack = newStream.getAudioTracks()[0];
//       senders.forEach((sender) => {
//         if (sender.track.kind === "video") {
//           sender.replaceTrack(videoTrack);
//         } else if (sender.track.kind === "audio") {
//           sender.replaceTrack(audioTrack);
//         }
//       });
//     } catch (error) {
//       toast.error(`Failed to flip camera: ${error.message}`);
//       console.error("Error flipping camera:", error);
//     }
//   };

//   const handleOffer = async (offer) => {
//     try {
//       await pc.current.setRemoteDescription(
//         new RTCSessionDescription(offer?.offer)
//       );
//     } catch (err) {
//       console.error("Failed to set remote description", err);
//     }
//     // if (pc.current.pendingCandidates) {
//     //   pc.current.pendingCandidates.forEach(async (e) => {
//     //     try {
//     //       await pc.current.addIceCandidate(e.candidate);
//     //     } catch (error) {
//     //       console.log("Error while adding pending candidate ", error);
//     //     }
//     //   });
//     //   pc.current.pendingCandidates = [];
//     // }

//     if (pc.current?.pendingCandidates?.length) {
//       for (const candidate of pc.current.pendingCandidates) {
//         try {
//           await pc.current.addIceCandidate(candidate.candidate);
//         } catch (error) {
//           console.error("Error adding pending candidate:", error);
//         }
//       }
//       pc.current.pendingCandidates = [];
//     }

//     const answer = await pc.current.createAnswer();
//     await pc.current.setLocalDescription(answer);
//     socket.emit("answer", {
//       to: offer?.from,
//       id: user?.currentUser?._id,
//       answer: pc.current.localDescription,
//     });
//   };

//   const handleAnswer = (answer) => {
//     pc.current.setRemoteDescription(new RTCSessionDescription(answer?.answer));
//   };

//   const handleRemoteIce = async (candidate) => {
//     if (candidate?.candidate) {
//       if (pc.current.remoteDescription) {
//         try {
//           await pc.current.addIceCandidate(candidate.candidate);
//         } catch (e) {
//           console.error("Error adding received ice candidate", e);
//         }
//       } else {
//         console.warn(
//           "Remote description not set. Storing candidate for later."
//         );
//         if (!pc.current.pendingCandidates) {
//           pc.current.pendingCandidates = [];
//         }
//         pc.current.pendingCandidates.push(candidate);
//       }
//     }
//   };

//   const handleCallEnd = () => {
//     try {
//       // userVideo.current.srcObject
//       //   .getAudioTracks()
//       //   .forEach((track) => track.stop());
//       // userVideo.current.srcObject
//       //   .getVideoTracks()
//       //   .forEach((track) => track.stop());
//       // pc?.current?.close();
//       // dispatch(setCalling(false));
//       // if (window.history.length > 1) {
//       //   navigate(-1);
//       // } else {
//       //   navigate("/chat");
//       // }
//       if (localStream.current) {
//         localStream.current.getTracks().forEach((track) => track.stop());
//       }
//       pc.current?.close();
//       dispatch(setCalling(false));
//       navigate(window.history.length > 1 ? -1 : "/chat");
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const handleMute = () => {
//     // if (!mute) {
//     //   userVideo.current.srcObject
//     //     .getAudioTracks()
//     //     .forEach((track) => (track.enabled = false));
//     // } else {
//     //   userVideo.current.srcObject
//     //     .getAudioTracks()
//     //     .forEach((track) => (track.enabled = true));
//     // }
//     if (localStream.current) {
//       localStream.current
//         .getAudioTracks()
//         .forEach((track) => (track.enabled = !mute));
//     }
//     setMute(!mute);
//   };

//   const handleVideo = () => {
//     // if (!video) {
//     //   userVideo.current.srcObject
//     //     .getVideoTracks()
//     //     .forEach((track) => (track.enabled = false));
//     // } else {
//     //   userVideo.current.srcObject
//     //     .getVideoTracks()
//     //     .forEach((track) => (track.enabled = true));
//     // }
//     if (localStream.current) {
//       localStream.current
//         .getVideoTracks()
//         .forEach((track) => (track.enabled = !video));
//     }
//     setVideo(!video);
//   };

//   const handleEndCall = () => {
//     try {
//       // userVideo.current.srcObject
//       //   .getAudioTracks()
//       //   .forEach((track) => track.stop());
//       // userVideo.current.srcObject
//       //   .getVideoTracks()
//       //   .forEach((track) => track.stop());
//       if (localStream.current) {
//         localStream.current.getTracks().forEach((track) => track.stop());
//       }
//       socket.emit("end-call", {
//         to: id1,
//       });
//       dispatch(setCalling(false));
//       pc?.current?.close();
//       if (window.history.length > 1) {
//         navigate(-1);
//       } else {
//         navigate("/chat");
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   return (
//     <div className="flex flex-col max-h-screen mb-2">
//       <div ref={videoGrid} className="flex-1 grid grid-cols-2 gap-4 p-4">
//         <video
//           muted
//           autoPlay
//           playsInline
//           className="w-full [height:calc(100vh-80px)] object-cover rounded-lg"
//           ref={userVideo}
//         ></video>
//         <video
//           autoPlay
//           playsInline
//           className="w-full [height:calc(100vh-80px)] object-cover rounded-lg"
//           ref={remoteVideo}
//         ></video>
//       </div>

//       <div className="p-4 bg-gray-800 flex justify-center gap-4">
//         <Button
//           className="p-3 rounded-full text-white"
//           size="sm"
//           onClick={handleEndCall}
//         >
//           <FcEndCall className="text-2xl" />
//         </Button>
//         <Button
//           className="p-3 bg-gray-600 rounded-full text-white"
//           size="sm"
//           onClick={handleVideo}
//         >
//           {video ? (
//             <CiVideoOff className="text-2xl" />
//           ) : (
//             <CiVideoOn className="text-2xl" />
//           )}
//         </Button>
//         {backCamera && (
//           <Button
//             className="p-3 bg-gray-600 rounded-full text-white"
//             size="sm"
//             onClick={flipCamera}
//           >
//             <MdOutlineFlipCameraIos className="text-2xl" />
//           </Button>
//         )}
//         <Button
//           className="p-3 bg-gray-600 rounded-full text-white"
//           size="sm"
//           onClick={handleMute}
//         >
//           {mute ? (
//             <AiOutlineAudioMuted className="text-2xl" />
//           ) : (
//             <CiMicrophoneOn className="text-2xl" />
//           )}
//         </Button>
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useRef, useState } from "react";
import { getSocket } from "../util/socketAction";
import { Button } from "flowbite-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AiOutlineAudioMuted } from "react-icons/ai";
import { CiMicrophoneOn, CiVideoOn, CiVideoOff } from "react-icons/ci";
import { FcEndCall } from "react-icons/fc";
import { setCalling } from "../redux/user/userSlice";
import { MdOutlineFlipCameraIos } from "react-icons/md";
import toast from "react-hot-toast";

export default function Call() {
  const [mute, setMute] = useState(false);
  const [video, setVideo] = useState(true);
  const [camera, setCamera] = useState(false);
  const [backCamera, setBackCamera] = useState(false);
  const socket = getSocket();
  const videoGrid = useRef();
  const userVideo = useRef();
  const remoteVideo = useRef();
  const pc = useRef();
  const localStream = useRef();
  const location = useLocation();
  const { id1, isCaller } = location.state || {};
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!id1) {
      navigate(window.history.length > 1 ? -1 : "/chat");
    }
  }, [id1, navigate]);

  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: {
          facingMode: camera ? "environment" : "user",
        },
      });
      localStream.current = stream;
      userVideo.current.srcObject = stream;

      if (!stream.getAudioTracks().length) {
        console.warn("No audio track available.");
        toast.error("Microphone not detected or permission denied.");
      }
      stream.getAudioTracks().forEach((track) => (track.enabled = true));

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === "videoinput");
      const hasBackCamera = videoDevices.some(
        (device) =>
          device.label.toLowerCase().includes("back") ||
          device.label.toLowerCase().includes("environment")
      );
      setBackCamera(hasBackCamera);

      pc.current = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      pc.current.pendingCandidates = [];

      stream.getTracks().forEach((track) => {
        console.log(`Adding track: ${track.kind}, enabled: ${track.enabled}`);
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
        }
      };

      if (isCaller) {
        const offer = await pc.current.createOffer();
        await pc.current.setLocalDescription(offer);
        socket.emit("offer", {
          to: id1,
          offer: pc.current.localDescription,
          callerId: user?.currentUser?._id,
        });
      }
    } catch (error) {
      toast.error(`Failed to access camera/microphone: ${error.message}`);
      if (isCaller) {
        socket.emit("error-caller", {
          to: id1,
          error: "Failed to access camera/microphone of other caller",
        })
      }
      else {
        socket.emit("error-reciever", {
          to: id1,
          error: "Failed to access camera/microphone of reciever",
        })
      }
      console.error("Error in accessing media devices:", error);
      navigate(window.history.length > 1 ? -1 : "/chat");
    }
  };

  const flipCamera = async () => {
    if (!backCamera || !pc.current) return;
    setCamera((prev) => !prev);

    // Stop existing tracks to release the camera
    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => track.stop());
    }

    try {
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: {
          facingMode: !camera ? "environment" : "user",
        },
      };
      const newStream = await navigator.mediaDevices
        .getUserMedia(constraints)
        .catch((error) => {
          if (
            error.name === "OverconstrainedError" ||
            error.message.includes("video source")
          ) {
            console.warn(
              "Requested facingMode not available, falling back to default camera."
            );
            return navigator.mediaDevices.getUserMedia({
              audio: constraints.audio,
              video: true,
            });
          }
          throw error;
        });

      localStream.current = newStream;
      userVideo.current.srcObject = newStream;

      const senders = pc.current.getSenders();
      const videoTrack = newStream.getVideoTracks()[0];
      // const audioTrack = newStream.getAudioTracks()[0];
      const videoSender = senders.find(
        (sender) => sender.track?.kind === "video"
      );
      // const audioSender = senders.find(
      //   (sender) => sender.track?.kind === "audio"
      // );

      if (videoSender && videoTrack) {
        await videoSender.replaceTrack(videoTrack);
      }
      // if (audioTrack && audioSender) {
        
      //   await audioSender.replaceTrack(audioTrack);
      // }
      setVideo(true);
      // setMute(true);
    } catch (error) {
      toast.error(`Failed to flip camera: ${error.message}`);
      console.error("Error flipping camera:", error);
    }
  };

  useEffect(() => {
    startStream();

    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleRemoteIce);
    socket.on("end-call", handleCallEnd);
    socket.on("error-caller", handleCallerError);

    return () => {
      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => track.stop());
      }
      pc.current?.close();
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("ice-candidate", handleRemoteIce);
      socket.off("end-call", handleCallEnd);
      socket.off("error-caller", handleCallerError)
    };
  }, []);

  const handleCallerError = (data) => {
    toast.error(data.error)
    navigate(window.history.length > 1 ? -1 : "/chat");
  }

  const handleOffer = async (offer) => {
    try {
      await pc.current.setRemoteDescription(
        new RTCSessionDescription(offer?.offer)
      );
      if (pc.current?.pendingCandidates?.length) {
        for (const candidate of pc.current.pendingCandidates) {
          try {
            await pc.current.addIceCandidate(candidate.candidate);
          } catch (error) {
            console.error("Error adding pending candidate:", error);
          }
        }
        pc.current.pendingCandidates = [];
      }
      const answer = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answer);
      socket.emit("answer", {
        to: offer?.from,
        id: user?.currentUser?._id,
        answer: pc.current.localDescription,
      });
    } catch (err) {
      console.error("Failed to handle offer:", err);
    }
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
          console.error("Error adding received ICE candidate:", e);
        }
      } else {
        console.warn("Remote description not set. Storing candidate.");
        pc.current.pendingCandidates.push(candidate);
      }
    }
  };

  const handleCallEnd = () => {
    try {
      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => track.stop());
      }
      pc.current?.close();
      dispatch(setCalling(false));
      navigate(window.history.length > 1 ? -1 : "/chat");
    } catch (error) {
      console.error("Error ending call:", error);
    }
  };

  const handleMute = () => {
    if (localStream.current && localStream.current.getAudioTracks().length) {
      localStream.current
        .getAudioTracks()
        .forEach((track) => (track.enabled = mute));
      setMute(!mute);
    } else {
      toast.error("No audio track available to mute.");
    }
  };

  const handleVideo = () => {
    if (localStream.current && localStream.current.getVideoTracks().length) {
      const enabled = !video;
      localStream.current
        .getVideoTracks()
        .forEach((track) => (track.enabled = enabled));
      setVideo(enabled);
    } else {
      toast.error("No video track available to toggle.");
    }
  };

  const handleEndCall = () => {
    try {
      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => track.stop());
      }
      socket.emit("end-call", { to: id1 });
      dispatch(setCalling(false));
      pc.current?.close();
      navigate(window.history.length > 1 ? -1 : "/chat");
    } catch (error) {
      console.error("Error ending call:", error);
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
        />
        <video
          autoPlay
          playsInline
          className="w-full [height:calc(100vh-80px)] object-cover rounded-lg"
          ref={remoteVideo}
        />
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
            <CiVideoOn className="text-2xl" />
          ) : (
            <CiVideoOff className="text-2xl" />
          )}
        </Button>
        {backCamera && (
          <Button
            className="p-3 bg-gray-600 rounded-full text-white"
            size="sm"
            onClick={flipCamera}
          >
            <MdOutlineFlipCameraIos className="text-2xl" />
          </Button>
        )}
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
