import toast from "react-hot-toast";

export const sendMessage = async (
  rid = null,
  groupId = null,
  message = null,
  image = null,
  audiofile = null,
  videoFile = null
) => {
  try {
    let imageUrl = null;
    let audioUrl = null;
    let videoUrl = null;
    if (image || audiofile || videoFile) {
      const formData = new FormData();
      if (image) formData.append("imageFile", image);
      if (audiofile) formData.append("audioFile", audiofile);
      if (videoFile) formData.append("videoFile", videoFile);
      console.log(formData);
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        toast.error("Could not upload media (File must be less than 5MB)");
        return;
      }

      const data = await response.json();
      console.log("data", data)
      if (!data || !data.data) {
        toast.error("Image sent failed.");
        return;
      }
      imageUrl = data?.data?.imageUrl || null;
      audioUrl = data?.data?.audioUrl || null;
      videoUrl = data?.data?.videoUrl || null;
    }
    let url = "/api/chat/send/";
    let param = new URLSearchParams();

    if (rid) {
      param.append("receiverId", rid);
    }
    if (groupId) {
      param.append("groupId", groupId);
    }

    if (param) {
      url += `?${param.toString()}`;
    }

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, imageUrl, audioUrl, videoUrl }),
      credentials: "include",
    });

    const data = await res.json();

    if (!data.success) {
      toast.error(data.message);
      return { success: false, data: [] };
    } else {
      return data;
    }
  } catch (error) {
    console.log("error", error.message);
    toast.error(error.message);
  }
};
