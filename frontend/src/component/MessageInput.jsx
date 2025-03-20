import React, { useRef, useState } from "react";
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
  const [capturing, setCapturing] = useState(null);
  const recordedChunks = useRef([]);
  const streamRef = useRef(null);
  const { selectedUser } = useSelector((state) => state.user);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const ref = useRef(null);
  const canvasRef = useRef(null);

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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview && !audioFile && !videoFile) return;

    try {
      let data = null;
      if (selectedUser?.id && selectedUser?.groupProfile) {
        data = await sendMessage(
          null,
          selectedUser?._id,
          text.trim(),
          imageFile,
          audioFile,
          videoFile
        );
      } else {
        data = await sendMessage(
          selectedUser?._id,
          null,
          text.trim(),
          imageFile,
          audioFile,
          videoFile
        );
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

  const clickPhoto = async () => {
    try {
      setCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      ref.current.srcObject = stream;
    } catch (error) {
      console.log("Error in accessing camera", error);
      toast.error("Error in accessing camera");
    }
  };

  const startRecording = async (type) => {
    try {
      setMediaType(type);
      const constraint =
        type === "audio" ? { audio: true } : { video: true, audio: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraint);
      if (type === "video") ref.current.srcObject = stream;
      streamRef.current = stream;

      mediaRecorderer.current = new MediaRecorder(stream);
      recordedChunks.current = [];

      mediaRecorderer.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.current.push(event.data);
        }
      };

      mediaRecorderer.current.onstop = async () => {
        const blob = new Blob(recordedChunks.current, {
          type: type === "audio" ? "audio/webm" : "video/webm",
        });
        const file = new File(
          [blob],
          `recorded_${new Date().toISOString()}_${type}`,
          { type: blob.type }
        );
        // sendMessage(file, type)
        if (type === "audio") {
          const audioUrl = URL.createObjectURL(blob);
          setAudioPreview(audioUrl);
          setAudioFile(file);
        }
        if (type === "video") {
          // ref.current.srcObject = stream
          const videoUrl = URL.createObjectURL(blob);
          setVideoPreview(videoUrl);
          setVideoFile(file);
        }

        mediaRecorderer.current.stop();
        // await handleSendMessage(e);
      };

      mediaRecorderer.current.start();
    } catch (error) {
      toast.error("Error accessimg media: ", error);
      console.log("Error accessimg media: ", error);
    }
  };

  const stopRecording = () => {
    mediaRecorderer.current.stop();
    streamRef.current.getTracks().forEach((track) => {
      track.stop();
    });
    setMediaType(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoClick = () => {
    const canvas = canvasRef.current;
    const video = ref.current;
    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      const file = new File([blob], `photo_${Date.now()}.png`, {
        type: "image/png",
      });

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    });

    video.srcObject.getTracks().forEach((track) => {
      track.stop();
    });
    setCapturing(false);
  };

  return (
    <div className="p-4 w-full">
      {(capturing || mediaType === "video") && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <video ref={ref} autoPlay className="w-full h-full"></video>
            <Button
              onClick={() => {
                setMediaType(null);
                setCapturing(false);
                if (ref.current?.srcObject) {
                  ref.current.srcObject
                    ?.getTracks()
                    .forEach((track) => track.stop());
                  ref.current.srcObject = null;
                }
              }}
              className="absolute top-1.5 right-1.5 size-6 rounded-full bg-base-300 flex items-center justify-center"
            >
              <RxCross2 className="size-3" />
            </Button>
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

        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageChange}
        />
        <input
          type="file"
          accept="video/*"
          className="hidden"
          ref={videoInputRef}
          onChange={handleVideoChange}
        />
        <canvas className="hidden" ref={canvasRef}></canvas>
        <Button
          color="gray"
          pill
          onClick={() => startRecording("audio")}
          className=""
        >
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
