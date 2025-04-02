// import React, { useRef, useState } from "react";
// import { Button, Dropdown, TextInput } from "flowbite-react";
// import { RxCross2 } from "react-icons/rx";
// import { sendMessage } from "../util/sendMessage";
// import { useSelector } from "react-redux";
// import { CiImageOn, CiMicrophoneOn, CiVideoOn } from "react-icons/ci";
// import { BsThreeDotsVertical } from "react-icons/bs";
// import { MdOutlineAddAPhoto } from "react-icons/md";
// import { FaRegFileVideo } from "react-icons/fa";
// import { LuSend } from "react-icons/lu";
// import { SiPhoton } from "react-icons/si";
// import toast from "react-hot-toast";

// function MessageInput({ setMessage }) {
//   const [text, setText] = useState("");
//   const [imagePreview, setImagePreview] = useState(null);
//   const [imageFile, setImageFile] = useState(null);
//   const [mediaType, setMediaType] = useState(null);
//   const mediaRecorderer = useRef(null);
//   const [audioFile, setAudioFile] = useState(null);
//   const [audioPreview, setAudioPreview] = useState(null);
//   const [videoFile, setVideoFile] = useState(null);
//   const [videoPreview, setVideoPreview] = useState(null);
//   const [capturing, setCapturing] = useState(null);
//   const recordedChunks = useRef([]);
//   const streamRef = useRef(null);
//   const { selectedUser } = useSelector((state) => state.user);
//   const fileInputRef = useRef(null);
//   const videoInputRef = useRef(null);
//   const ref = useRef(null);
//   const canvasRef = useRef(null);

//   const removeImage = () => {
//     setImagePreview(null);
//     if (fileInputRef.current) fileInputRef.current.value = "";
//   };

//   const removeAudio = () => {
//     setAudioPreview(null);
//     setAudioFile(null);
//   };

//   const removeVideo = () => {
//     setVideoPreview(null);
//     setVideoFile(null);
//   };

//   const handleSendMessage = async (e) => {
//     e.preventDefault();
//     if (!text.trim() && !imagePreview && !audioFile && !videoFile) return;

//     try {
//       let data = null;
//       if (selectedUser?.id && selectedUser?.groupProfile) {
//         data = await sendMessage(
//           null,
//           selectedUser?._id,
//           text.trim(),
//           imageFile,
//           audioFile,
//           videoFile
//         );
//       } else {
//         data = await sendMessage(
//           selectedUser?._id,
//           null,
//           text.trim(),
//           imageFile,
//           audioFile,
//           videoFile
//         );
//       }

//       setMessage((prevMessage) => [...prevMessage, data?.data]);
//     } catch (error) {
//       console.log("Failed to send message ", error);
//     } finally {
//       setText("");
//       setImagePreview(null);
//       setImageFile(null);
//       setAudioFile(null);
//       setAudioPreview(null);
//       setVideoFile(null);
//       setVideoPreview(null);
//       setMediaType(null);
//     }
//   };

//   const clickPhoto = async () => {
//     try {
//       setCapturing(true);
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//       ref.current.srcObject = stream;
//     } catch (error) {
//       console.log("Error in accessing camera", error);
//       toast.error("Error in accessing camera");
//     }
//   };

//   const startRecording = async (type) => {
//     try {
//       setMediaType(type);
//       const constraint =
//         type === "audio" ? { audio: true } : { video: true, audio: true };
//       const stream = await navigator.mediaDevices.getUserMedia(constraint);
//       if (type === "video") ref.current.srcObject = stream;
//       streamRef.current = stream;

//       mediaRecorderer.current = new MediaRecorder(stream);
//       recordedChunks.current = [];

//       mediaRecorderer.current.ondataavailable = (event) => {
//         if (event.data.size > 0) {
//           recordedChunks.current.push(event.data);
//         }
//       };

//       mediaRecorderer.current.onstop = async () => {
//         const blob = new Blob(recordedChunks.current, {
//           type: type === "audio" ? "audio/webm" : "video/webm",
//         });
//         const file = new File(
//           [blob],
//           `recorded_${new Date().toISOString()}_${type}`,
//           { type: blob.type }
//         );
//         // sendMessage(file, type)
//         if (type === "audio") {
//           const audioUrl = URL.createObjectURL(blob);
//           setAudioPreview(audioUrl);
//           setAudioFile(file);
//         }
//         if (type === "video") {
//           // ref.current.srcObject = stream
//           const videoUrl = URL.createObjectURL(blob);
//           setVideoPreview(videoUrl);
//           setVideoFile(file);
//         }

//         mediaRecorderer.current.stop();
//         // await handleSendMessage(e);
//       };

//       mediaRecorderer.current.start();
//     } catch (error) {
//       toast.error("Error accessimg media: ", error);
//       console.log("Error accessimg media: ", error);
//     }
//   };

//   const stopRecording = () => {
//     mediaRecorderer.current.stop();
//     streamRef.current.getTracks().forEach((track) => {
//       track.stop();
//     });
//     setMediaType(null);
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setImageFile(file);

//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setImagePreview(reader.result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleVideoChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setVideoFile(file);
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setVideoPreview(reader.result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handlePhotoClick = () => {
//     const canvas = canvasRef.current;
//     const video = ref.current;
//     const context = canvas.getContext("2d");
//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
//     context.drawImage(video, 0, 0, canvas.width, canvas.height);

//     canvas.toBlob((blob) => {
//       const file = new File([blob], `photo_${Date.now()}.png`, {
//         type: "image/png",
//       });

//       setImageFile(file);
//       setImagePreview(URL.createObjectURL(file));
//     });

//     video.srcObject.getTracks().forEach((track) => {
//       track.stop();
//     });
//     setCapturing(false);
//   };

//   return (
//     <div className="p-4 w-full">
//       {(capturing || mediaType === "video") && (
//         <div className="mb-3 flex items-center gap-2">
//           <div className="relative">
//             <video ref={ref} autoPlay className="w-full h-full"></video>
//             <Button
//               onClick={() => {
//                 setMediaType(null);
//                 setCapturing(false);
//                 if (ref.current?.srcObject) {
//                   ref.current.srcObject
//                     ?.getTracks()
//                     .forEach((track) => track.stop());
//                   ref.current.srcObject = null;
//                 }
//               }}
//               className="absolute top-1.5 right-1.5 size-6 rounded-full bg-base-300 flex items-center justify-center"
//             >
//               <RxCross2 className="size-3" />
//             </Button>
//           </div>
//         </div>
//       )}
//       {imagePreview && (
//         <div className="mb-3 flex items-center gap-2">
//           <div className="relative">
//             <img
//               src={imagePreview}
//               alt="Preview"
//               className="size-20 object-cover rounded-lg border border-zinc-700"
//             />
//             <Button
//               onClick={removeImage}
//               className="absolute top-1.5 right-1.5 size-5 rounded-full bg-base-300 flex items-center justify-center"
//             >
//               <RxCross2 className="size-3" />
//             </Button>
//           </div>
//         </div>
//       )}
//       {audioPreview && (
//         <div className="mb-3 flex items-center gap-2">
//           <div className="relative">
//             <audio src={audioPreview} controls></audio>
//             <Button
//               onClick={removeAudio}
//               className="absolute top-2.5 -right-8 size-8 rounded-full bg-base-300 flex items-center justify-center"
//             >
//               <RxCross2 className="size-4" />
//             </Button>
//           </div>
//         </div>
//       )}
//       {videoPreview && (
//         <div className="mb-3 flex items-center gap-2">
//           <div className="relative">
//             <video controls preload="auto" width="250" height="250">
//               <source src={videoPreview} />
//             </video>
//             <Button
//               onClick={removeVideo}
//               className="absolute top-1.5 right-1.5 size-5 rounded-full bg-base-300 flex items-center justify-center"
//             >
//               <RxCross2 className="size-3" />
//             </Button>
//           </div>
//         </div>
//       )}

//       <form onSubmit={handleSendMessage} className="flex items-center gap-3">
//         <TextInput
//           placeholder="Type a message..."
//           className="flex-1 rounded-lg border-gray-300 focus:ring-blue-500"
//           value={text}
//           onChange={(e) => setText(e.target.value)}
//         />

//         <input
//           type="file"
//           accept="image/*"
//           className="hidden"
//           ref={fileInputRef}
//           onChange={handleImageChange}
//         />
//         <input
//           type="file"
//           accept="video/*"
//           className="hidden"
//           ref={videoInputRef}
//           onChange={handleVideoChange}
//         />
//         <canvas className="hidden" ref={canvasRef}></canvas>
//         <Button
//           color="gray"
//           pill
//           onClick={() => startRecording("audio")}
//           className=""
//         >
//           <CiMicrophoneOn className="w-4 h-4 text-gray-700 hover:text-blue-500 transition" />
//         </Button>
//         {capturing && (
//           <Button color="gray" pill onClick={handlePhotoClick}>
//             <SiPhoton className="w-4 h-4" />
//           </Button>
//         )}
//         {mediaType && <Button onClick={stopRecording}>🛑</Button>}
//         <Dropdown
//           label=""
//           dismissOnClick={false}
//           renderTrigger={() => (
//             <Button color="gray" pill>
//               <BsThreeDotsVertical className="w-4 h-4 text-gray-700 hover:text-blue-500 transition" />
//             </Button>
//           )}
//           size="sm"
//         >
//           <Dropdown.Item>
//             <Button
//               color="gray"
//               pill
//               onClick={clickPhoto}
//               className={`${(capturing || mediaType) && "cursor-not-allowed"}`}
//             >
//               <MdOutlineAddAPhoto className="w-4 h-4 text-gray-700 hover:text-blue-500 transition" />
//             </Button>
//           </Dropdown.Item>
//           <Dropdown.Item>
//             <Button
//               color="gray"
//               pill
//               onClick={() => startRecording("video")}
//               className={`${(capturing || mediaType) && "cursor-not-allowed"}`}
//             >
//               <CiVideoOn className="w-4 h-4 text-gray-700 hover:text-blue-500 transition" />
//             </Button>
//           </Dropdown.Item>
//           <Dropdown.Item>
//             <Button
//               color="gray"
//               pill
//               onClick={() => fileInputRef.current?.click()}
//               className={`${(capturing || mediaType) && "cursor-not-allowed"}`}
//             >
//               <CiImageOn className="w-5 h-5 text-gray-700 hover:text-blue-500 transition" />
//             </Button>
//           </Dropdown.Item>
//           <Dropdown.Item>
//             <Button
//               color="gray"
//               pill
//               onClick={() => videoInputRef.current?.click()}
//               className={`${(capturing || mediaType) && "cursor-not-allowed"}`}
//             >
//               <FaRegFileVideo className="w-5 h-5 text-gray-700 hover:text-blue-500 transition" />
//             </Button>
//           </Dropdown.Item>
//         </Dropdown>

//         <Button
//           color="blue"
//           pill
//           type="submit"
//           disabled={!text.trim() && !imagePreview && !audioFile && !videoFile}
//           className="transition hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
//         >
//           <LuSend className="w-5 h-5" />
//         </Button>
//       </form>
//     </div>
//   );
// }

// export default MessageInput;












// import React, { useRef, useState } from "react";
// import { Button, Dropdown, TextInput } from "flowbite-react";
// import { RxCross2 } from "react-icons/rx";
// import { sendMessage } from "../util/sendMessage";
// import { useSelector } from "react-redux";
// import { CiImageOn, CiMicrophoneOn, CiVideoOn } from "react-icons/ci";
// import { BsThreeDotsVertical } from "react-icons/bs";
// import { MdOutlineAddAPhoto } from "react-icons/md";
// import { FaRegFileVideo } from "react-icons/fa";
// import { LuSend } from "react-icons/lu";
// import { SiPhoton } from "react-icons/si";
// import toast from "react-hot-toast";

// function MessageInput({ setMessage }) {
//   const [text, setText] = useState("");
//   const [imagePreview, setImagePreview] = useState(null);
//   const [imageFile, setImageFile] = useState(null);
//   const [mediaType, setMediaType] = useState(null);
//   const mediaRecorderer = useRef(null);
//   const [audioFile, setAudioFile] = useState(null);
//   const [audioPreview, setAudioPreview] = useState(null);
//   const [videoFile, setVideoFile] = useState(null);
//   const [videoPreview, setVideoPreview] = useState(null);
//   const [capturing, setCapturing] = useState(null);
//   const recordedChunks = useRef([]);
//   const streamRef = useRef(null);
//   const { selectedUser } = useSelector((state) => state.user);
//   const fileInputRef = useRef(null);
//   const videoInputRef = useRef(null);
//   const ref = useRef(null);
//   const canvasRef = useRef(null);

//   const removeImage = () => {
//     setImagePreview(null);
//     if (fileInputRef.current) fileInputRef.current.value = "";
//   };

//   const removeAudio = () => {
//     setAudioPreview(null);
//     setAudioFile(null);
//   };

//   const removeVideo = () => {
//     setVideoPreview(null);
//     setVideoFile(null);
//   };

//   const handleSendMessage = async (e) => {
//     e.preventDefault();
//     if (!text.trim() && !imagePreview && !audioFile && !videoFile) return;

//     try {
//       let data = null;
//       if (selectedUser?.id && selectedUser?.groupProfile) {
//         data = await sendMessage(
//           null,
//           selectedUser?._id,
//           text.trim(),
//           imageFile,
//           audioFile,
//           videoFile
//         );
//       } else {
//         data = await sendMessage(
//           selectedUser?._id,
//           null,
//           text.trim(),
//           imageFile,
//           audioFile,
//           videoFile
//         );
//       }

//       setMessage((prevMessage) => [...prevMessage, data?.data]);
//     } catch (error) {
//       console.log("Failed to send message ", error);
//     } finally {
//       setText("");
//       setImagePreview(null);
//       setImageFile(null);
//       setAudioFile(null);
//       setAudioPreview(null);
//       setVideoFile(null);
//       setVideoPreview(null);
//       setMediaType(null);
//     }
//   };

//   const clickPhoto = async () => {
//     try {
//       setCapturing(true);
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//       ref.current.srcObject = stream;
//     } catch (error) {
//       console.log("Error in accessing camera", error);
//       toast.error("Error in accessing camera");
//     }
//   };

//   const startRecording = async (type) => {
//     try {
//       setMediaType(type);
//       const constraint =
//         type === "audio" ? { audio: true } : { video: true, audio: true };
//       const stream = await navigator.mediaDevices.getUserMedia(constraint);
//       if (type === "video") ref.current.srcObject = stream;
//       streamRef.current = stream;

//       mediaRecorderer.current = new MediaRecorder(stream);
//       recordedChunks.current = [];

//       mediaRecorderer.current.ondataavailable = (event) => {
//         if (event.data.size > 0) {
//           recordedChunks.current.push(event.data);
//         }
//       };

//       mediaRecorderer.current.onstop = async () => {
//         const blob = new Blob(recordedChunks.current, {
//           type: type === "audio" ? "audio/webm" : "video/webm",
//         });
//         const file = new File(
//           [blob],
//           `recorded_${new Date().toISOString()}_${type}`,
//           { type: blob.type }
//         );
//         // sendMessage(file, type)
//         if (type === "audio") {
//           const audioUrl = URL.createObjectURL(blob);
//           setAudioPreview(audioUrl);
//           setAudioFile(file);
//         }
//         if (type === "video") {
//           // ref.current.srcObject = stream
//           const videoUrl = URL.createObjectURL(blob);
//           setVideoPreview(videoUrl);
//           setVideoFile(file);
//         }

//         mediaRecorderer.current.stop();
//         // await handleSendMessage(e);
//       };

//       mediaRecorderer.current.start();
//     } catch (error) {
//       toast.error("Error accessimg media: ", error);
//       console.log("Error accessimg media: ", error);
//     }
//   };

//   const stopRecording = () => {
//     mediaRecorderer.current.stop();
//     streamRef.current.getTracks().forEach((track) => {
//       track.stop();
//     });
//     setMediaType(null);
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setImageFile(file);

//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setImagePreview(reader.result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleVideoChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setVideoFile(file);
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setVideoPreview(reader.result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handlePhotoClick = () => {
//     const canvas = canvasRef.current;
//     const video = ref.current;
//     const context = canvas.getContext("2d");
//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
//     context.drawImage(video, 0, 0, canvas.width, canvas.height);

//     canvas.toBlob((blob) => {
//       const file = new File([blob], `photo_${Date.now()}.png`, {
//         type: "image/png",
//       });

//       setImageFile(file);
//       setImagePreview(URL.createObjectURL(file));
//     });

//     video.srcObject.getTracks().forEach((track) => {
//       track.stop();
//     });
//     setCapturing(false);
//   };

//   return (
//     <div className="p-4 w-full">
//       {(capturing || mediaType === "video") && (
//         <div className="mb-3 flex items-center gap-2">
//           <div className="relative">
//             <video ref={ref} autoPlay className="w-full h-full"></video>
//             <Button
//               onClick={() => {
//                 setMediaType(null);
//                 setCapturing(false);
//                 if (ref.current?.srcObject) {
//                   ref.current.srcObject
//                     ?.getTracks()
//                     .forEach((track) => track.stop());
//                   ref.current.srcObject = null;
//                 }
//               }}
//               className="absolute top-1.5 right-1.5 size-6 rounded-full bg-base-300 flex items-center justify-center"
//             >
//               <RxCross2 className="size-3" />
//             </Button>
//           </div>
//         </div>
//       )}
//       {imagePreview && (
//         <div className="mb-3 flex items-center gap-2">
//           <div className="relative">
//             <img
//               src={imagePreview}
//               alt="Preview"
//               className="size-20 object-cover rounded-lg border border-zinc-700"
//             />
//             <Button
//               onClick={removeImage}
//               className="absolute top-1.5 right-1.5 size-5 rounded-full bg-base-300 flex items-center justify-center"
//             >
//               <RxCross2 className="size-3" />
//             </Button>
//           </div>
//         </div>
//       )}
//       {audioPreview && (
//         <div className="mb-3 flex items-center gap-2">
//           <div className="relative">
//             <audio src={audioPreview} controls></audio>
//             <Button
//               onClick={removeAudio}
//               className="absolute top-2.5 -right-8 size-8 rounded-full bg-base-300 flex items-center justify-center"
//             >
//               <RxCross2 className="size-4" />
//             </Button>
//           </div>
//         </div>
//       )}
//       {videoPreview && (
//         <div className="mb-3 flex items-center gap-2">
//           <div className="relative">
//             <video controls preload="auto" width="250" height="250">
//               <source src={videoPreview} />
//             </video>
//             <Button
//               onClick={removeVideo}
//               className="absolute top-1.5 right-1.5 size-5 rounded-full bg-base-300 flex items-center justify-center"
//             >
//               <RxCross2 className="size-3" />
//             </Button>
//           </div>
//         </div>
//       )}

//       <form onSubmit={handleSendMessage} className="flex items-center gap-3">
//         <TextInput
//           placeholder="Type a message..."
//           className="flex-1 rounded-lg border-gray-300 focus:ring-blue-500"
//           value={text}
//           onChange={(e) => setText(e.target.value)}
//         />

//         <input
//           type="file"
//           accept="image/*"
//           className="hidden"
//           ref={fileInputRef}
//           onChange={handleImageChange}
//         />
//         <input
//           type="file"
//           accept="video/*"
//           className="hidden"
//           ref={videoInputRef}
//           onChange={handleVideoChange}
//         />
//         <canvas className="hidden" ref={canvasRef}></canvas>
//         <Button
//           color="gray"
//           pill
//           onClick={() => startRecording("audio")}
//           className=""
//         >
//           <CiMicrophoneOn className="w-4 h-4 text-gray-700 hover:text-blue-500 transition" />
//         </Button>
//         {capturing && (
//           <Button color="gray" pill onClick={handlePhotoClick}>
//             <SiPhoton className="w-4 h-4" />
//           </Button>
//         )}
//         {mediaType && <Button onClick={stopRecording}>🛑</Button>}
//         <Dropdown
//           label=""
//           dismissOnClick={false}
//           renderTrigger={() => (
//             <Button color="gray" pill>
//               <BsThreeDotsVertical className="w-4 h-4 text-gray-700 hover:text-blue-500 transition" />
//             </Button>
//           )}
//           size="sm"
//         >
//           <Dropdown.Item>
//             <Button
//               color="gray"
//               pill
//               onClick={clickPhoto}
//               className={`${(capturing || mediaType) && "cursor-not-allowed"}`}
//             >
//               <MdOutlineAddAPhoto className="w-4 h-4 text-gray-700 hover:text-blue-500 transition" />
//             </Button>
//           </Dropdown.Item>
//           <Dropdown.Item>
//             <Button
//               color="gray"
//               pill
//               onClick={() => startRecording("video")}
//               className={`${(capturing || mediaType) && "cursor-not-allowed"}`}
//             >
//               <CiVideoOn className="w-4 h-4 text-gray-700 hover:text-blue-500 transition" />
//             </Button>
//           </Dropdown.Item>
//           <Dropdown.Item>
//             <Button
//               color="gray"
//               pill
//               onClick={() => fileInputRef.current?.click()}
//               className={`${(capturing || mediaType) && "cursor-not-allowed"}`}
//             >
//               <CiImageOn className="w-5 h-5 text-gray-700 hover:text-blue-500 transition" />
//             </Button>
//           </Dropdown.Item>
//           <Dropdown.Item>
//             <Button
//               color="gray"
//               pill
//               onClick={() => videoInputRef.current?.click()}
//               className={`${(capturing || mediaType) && "cursor-not-allowed"}`}
//             >
//               <FaRegFileVideo className="w-5 h-5 text-gray-700 hover:text-blue-500 transition" />
//             </Button>
//           </Dropdown.Item>
//         </Dropdown>

//         <Button
//           color="blue"
//           pill
//           type="submit"
//           disabled={!text.trim() && !imagePreview && !audioFile && !videoFile}
//           className="transition hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
//         >
//           <LuSend className="w-5 h-5" />
//         </Button>
//       </form>
//     </div>
//   );
// }

// export default MessageInput;



import React, { useRef, useState, useEffect } from "react";
import { Button, Dropdown, TextInput } from "flowbite-react";
import { RxCross2 } from "react-icons/rx";
import { sendMessage } from "../util/sendMessage";
import { useSelector } from "react-redux";
import { CiImageOn, CiMicrophoneOn, CiVideoOn } from "react-icons/ci";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdOutlineAddAPhoto } from "react-icons/md";
import { FaRegFileVideo } from "react-icons/fa";
import { LuSend } from "react-icons/lu";
import { SiPhoton } from "react-icons/si";
import { TbSwitchVertical } from "react-icons/tb";
import { BsMicMute, BsMic } from "react-icons/bs";
import toast from "react-hot-toast";

function MessageInput({ setMessage }) {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const mediaRecorderer = useRef(null);
  const [audioFile, setAudioFile] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const [facingMode, setFacingMode] = useState("environment");
  const [hasBackCamera, setHasBackCamera] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const recordedChunks = useRef([]);
  const streamRef = useRef(null);
  const { selectedUser } = useSelector((state) => state.user);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Check for camera availability
  useEffect(() => {
    const checkCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((device) => device.kind === "videoinput");
        console.log("Available video devices:", videoDevices); // Debug log
        const backCameraExists = videoDevices.some((device) =>
          device.label.toLowerCase().includes("back") || device.label.toLowerCase().includes("rear")
        );
        setHasBackCamera(backCameraExists);
        if (!backCameraExists) {
          setFacingMode("user");
        }
      } catch (error) {
        console.log("Error enumerating devices:", error);
        toast.error("Unable to detect cameras");
      }
    };
    checkCameras();
  }, []);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
    }
  };

  const startCamera = async (options = { video: true }) => {
    try {
      stopStream();
      const constraints = {
        video: { facingMode: facingMode }, // Removed exact constraint for broader compatibility
        ...(options.audio && { audio: true }),
      };
      console.log("Starting camera with constraints:", constraints); // Debug log
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      return stream;
    } catch (error) {
      console.log("Error accessing camera:", error);
      toast.error("Error accessing camera: " + error.message);
      return null;
    }
  };

  const clickPhoto = async () => {
    try {
      setCapturing(true);
      await startCamera();
    } catch (error) {
      console.log("Error in accessing camera", error);
      toast.error("Error in accessing camera");
    }
  };

  const flipCamera = async () => {
    if (!hasBackCamera) {
      toast.error("No back camera available to flip to.");
      return;
    }

    const newFacingMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newFacingMode);

    if (mediaType === "video" && mediaRecorderer.current) {
      // Pause recording
      mediaRecorderer.current.pause();
      console.log("Recording paused, switching camera...");

      // Start new stream with the updated facing mode
      const newStream = await startCamera({ video: true, audio: !isAudioMuted });

      if (newStream) {
        // Stop old stream tracks
        streamRef.current.getTracks().forEach((track) => track.stop());

        // Update stream reference
        streamRef.current = newStream;

        // Create a new MediaRecorder with the new stream, preserving old chunks
        const oldRecorder = mediaRecorderer.current;
        mediaRecorderer.current = new MediaRecorder(newStream);

        mediaRecorderer.current.ondataavailable = (event) => {
          if (event.data.size > 0) recordedChunks.current.push(event.data);
        };
        mediaRecorderer.current.onstop = oldRecorder.onstop; // Reuse the old onstop handler

        // Resume recording
        mediaRecorderer.current.start();
        console.log("Recording resumed with new camera");
      } else {
        mediaRecorderer.current.resume(); // Resume old recording if new stream fails
      }
    } else if (capturing) {
      await startCamera({ video: true });
    }
  };

  const toggleAudio = async () => {
    if (!streamRef.current) return;

    const audioTracks = streamRef.current.getAudioTracks();
    if (audioTracks.length > 0) {
      audioTracks.forEach((track) => (track.enabled = isAudioMuted));
      setIsAudioMuted(!isAudioMuted);
    } else if (!isAudioMuted) {
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStream.getAudioTracks().forEach((track) => streamRef.current.addTrack(track));
        setIsAudioMuted(false);
      } catch (error) {
        console.log("Error adding audio:", error);
        toast.error("Error adding audio");
      }
    }
  };

  const startRecording = async (type) => {
    try {
      setMediaType(type);
      const constraint =
        type === "audio"
          ? { audio: true }
          : { video: { facingMode: facingMode }, audio: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraint);
      if (type === "video") videoRef.current.srcObject = stream;
      streamRef.current = stream;

      mediaRecorderer.current = new MediaRecorder(stream);
      recordedChunks.current = [];

      mediaRecorderer.current.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunks.current.push(event.data);
      };

      mediaRecorderer.current.onstop = () => {
        const blob = new Blob(recordedChunks.current, {
          type: type === "audio" ? "audio/webm" : "video/webm",
        });
        const file = new File([blob], `recorded_${new Date().toISOString()}_${type}`, {
          type: blob.type,
        });
        if (type === "audio") {
          const audioUrl = URL.createObjectURL(blob);
          setAudioPreview(audioUrl);
          setAudioFile(file);
        }
        if (type === "video") {
          const videoUrl = URL.createObjectURL(blob);
          setVideoPreview(videoUrl);
          setVideoFile(file);
        }
        stopStream();
      };

      mediaRecorderer.current.start();
      console.log("Recording started with", facingMode);
    } catch (error) {
      toast.error("Error accessing media: " + error.message);
      console.log("Error accessing media: ", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderer.current) {
      mediaRecorderer.current.stop();
    }
    setMediaType(null);
    setIsAudioMuted(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setVideoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoClick = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      const file = new File([blob], `photo_${Date.now()}.png`, { type: "image/png" });
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    });

    stopStream();
    setCapturing(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview && !audioFile && !videoFile) return;

    try {
      let data = null;
      if (selectedUser?.id && selectedUser?.groupProfile) {
        data = await sendMessage(null, selectedUser?._id, text.trim(), imageFile, audioFile, videoFile);
      } else {
        data = await sendMessage(selectedUser?._id, null, text.trim(), imageFile, audioFile, videoFile);
      }
      setMessage((prevMessage) => [...prevMessage, data?.data]);
    } catch (error) {
      console.log("Failed to send message ", error);
    } finally {
      setText("");
      setImagePreview(null);
      setImageFile(null);
      setAudioFile(null);
      setAudioPreview(null);
      setVideoFile(null);
      setVideoPreview(null);
      setMediaType(null);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAudio = () => {
    setAudioPreview(null);
    setAudioFile(null);
  };

  const removeVideo = () => {
    setVideoPreview(null);
    setVideoFile(null);
  };

  return (
    <div className="p-4 w-full">
      {(capturing || mediaType === "video") && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <video ref={videoRef} autoPlay className="w-full h-full"></video>
            <Button
              onClick={() => {
                setMediaType(null);
                setCapturing(false);
                stopStream();
              }}
              className="absolute top-1.5 right-1.5 size-6 rounded-full bg-base-300 flex items-center justify-center"
            >
              <RxCross2 className="size-3" />
            </Button>
            {hasBackCamera && (
              <Button
                onClick={flipCamera}
                className="absolute top-1.5 left-1.5 size-6 rounded-full bg-base-300 flex items-center justify-center"
              >
                <TbSwitchVertical className="size-4" />
              </Button>
            )}
            {mediaType === "video" && (
              <Button
                onClick={toggleAudio}
                className="absolute bottom-1.5 left-1.5 size-6 rounded-full bg-base-300 flex items-center justify-center"
              >
                {isAudioMuted ? <BsMicMute className="size-4" /> : <BsMic className="size-4" />}
              </Button>
            )}
          </div>
        </div>
      )}
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="size-20 object-cover rounded-lg border border-zinc-700"
            />
            <Button
              onClick={removeImage}
              className="absolute top-1.5 right-1.5 size-5 rounded-full bg-base-300 flex items-center justify-center"
            >
              <RxCross2 className="size-3" />
            </Button>
          </div>
        </div>
      )}
      {audioPreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <audio src={audioPreview} controls></audio>
            <Button
              onClick={removeAudio}
              className="absolute top-2.5 -right-8 size-8 rounded-full bg-base-300 flex items-center justify-center"
            >
              <RxCross2 className="size-4" />
            </Button>
          </div>
        </div>
      )}
      {videoPreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <video controls preload="auto" width="250" height="250">
              <source src={videoPreview} />
            </video>
            <Button
              onClick={removeVideo}
              className="absolute top-1.5 right-1.5 size-5 rounded-full bg-base-300 flex items-center justify-center"
            >
              <RxCross2 className="size-3" />
            </Button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-3">
        <TextInput
          placeholder="Type a message..."
          className="flex-1 rounded-lg border-gray-300 focus:ring-blue-500"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
        <input type="file" accept="video/*" className="hidden" ref={videoInputRef} onChange={handleVideoChange} />
        <canvas className="hidden" ref={canvasRef}></canvas>
        <Button color="gray" pill onClick={() => startRecording("audio")}>
          <CiMicrophoneOn className="w-4 h-4 text-gray-700 hover:text-blue-500 transition" />
        </Button>
        {capturing && (
          <Button color="gray" pill onClick={handlePhotoClick}>
            <SiPhoton className="w-4 h-4" />
          </Button>
        )}
        {mediaType && <Button onClick={stopRecording}>🛑</Button>}
        <Dropdown
          label=""
          dismissOnClick={false}
          renderTrigger={() => (
            <Button color="gray" pill>
              <BsThreeDotsVertical className="w-4 h-4 text-gray-700 hover:text-blue-500 transition" />
            </Button>
          )}
          size="sm"
        >
          <Dropdown.Item>
            <Button
              color="gray"
              pill
              onClick={clickPhoto}
              className={`${(capturing || mediaType) && "cursor-not-allowed"}`}
            >
              <MdOutlineAddAPhoto className="w-4 h-4 text-gray-700 hover:text-blue-500 transition" />
            </Button>
          </Dropdown.Item>
          <Dropdown.Item>
            <Button
              color="gray"
              pill
              onClick={() => startRecording("video")}
              className={`${(capturing || mediaType) && "cursor-not-allowed"}`}
            >
              <CiVideoOn className="w-4 h-4 text-gray-700 hover:text-blue-500 transition" />
            </Button>
          </Dropdown.Item>
          <Dropdown.Item>
            <Button
              color="gray"
              pill
              onClick={() => fileInputRef.current?.click()}
              className={`${(capturing || mediaType) && "cursor-not-allowed"}`}
            >
              <CiImageOn className="w-5 h-5 text-gray-700 hover:text-blue-500 transition" />
            </Button>
          </Dropdown.Item>
          <Dropdown.Item>
            <Button
              color="gray"
              pill
              onClick={() => videoInputRef.current?.click()}
              className={`${(capturing || mediaType) && "cursor-not-allowed"}`}
            >
              <FaRegFileVideo className="w-5 h-5 text-gray-700 hover:text-blue-500 transition" />
            </Button>
          </Dropdown.Item>
        </Dropdown>

        <Button
          color="blue"
          pill
          type="submit"
          disabled={!text.trim() && !imagePreview && !audioFile && !videoFile}
          className="transition hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <LuSend className="w-5 h-5" />
        </Button>
      </form>
    </div>
  );
}

export default MessageInput;