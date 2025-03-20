import toast from "react-hot-toast";

const uploadImage = async ({
  imageFile,
  setIsUploading,
  setFormData1,
  setImageFile,
  formData1,
  setIsCoverImageUploading = false,
}) => {
  if (!imageFile) return;
  const API_URL = import.meta.env.VITE_API_URL
  if (imageFile) {
    const formData = new FormData();
    formData.append("imageFile", imageFile);
    if (setIsCoverImageUploading === true) {
        
      setIsCoverImageUploading(true);
    } else {
      setIsUploading(true);
    }
    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        toast.error("Could not upload image (File must be less than 5MB)");
        return;
      }

      const data = await response.json();
      if (!data || !data.data) {
        toast.error("Image upload failed.");
        return;
      }
      setFormData1({ ...formData1, profilePicture: data?.data });
      return data?.data?.imageUrl;
    } catch (error) {
      setImageFile(null);
    } finally {
      setIsCoverImageUploading(false);
      setIsUploading(false);
    }
  }
};

export default uploadImage;
