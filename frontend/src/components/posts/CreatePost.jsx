import React, { useState } from "react";
import { usePosts } from "../../context/PostContext";
import { useAuth } from "../../context/AuthContext";
import { Image, Send, Loader2, X } from "lucide-react";

const CreatePost = () => {
  const [content, setContent] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createPost, uploadMedia } = usePosts();
  const { user } = useAuth();

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImageFiles((prev) => [...prev, ...files]);

      const previewPromises = files.map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(previewPromises).then((newPreviews) => {
        setImagePreviews((prev) => [...prev, ...newPreviews]);
      });
    }
  };

  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && imageFiles.length === 0) return;

    setIsSubmitting(true); // ← was missing

    const mediaIds = [];

    // ← replace Promise.all with sequential for loop
    for (let i = 0; i < imageFiles.length; i++) {
      const formData = new FormData();
      formData.append("file", imageFiles[i]);

      const uploadResult = await uploadMedia(formData);
      if (uploadResult.success) {
        const url =
          uploadResult.data.url ||
          uploadResult.data.image ||
          uploadResult.data.data?.url;
        mediaIds.push(url);
        console.log(`File ${i + 1}/${imageFiles.length} uploaded:`, url);
      } else {
        console.error(`File ${i + 1} failed:`, uploadResult.message);
      }
    }

    const result = await createPost({
      content,
      mediaIds,
      username: user.username,
    });

    setIsSubmitting(false);
    if (result.success) {
      setContent("");
      setImageFiles([]);
      setImagePreviews([]);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold flex-shrink-0">
            {user?.username?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1">
            <textarea
              placeholder={`What's on your mind, ${user?.username || "there"}?`}
              className="w-full border-none focus:ring-0 text-lg resize-none placeholder-gray-400 p-0 mb-4 min-h-[80px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {imagePreviews.map((preview, index) => (
                  <div
                    key={index}
                    className="relative group aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100"
                  >
                    <img
                      src={preview}
                      alt={`Preview ${index}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      type="button"
                      className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <label className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 cursor-pointer transition-colors px-3 py-2 rounded-lg hover:bg-gray-50">
                <Image className="w-5 h-5" />
                <span className="text-sm font-semibold">Photos</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                />
              </label>

              <button
                type="submit"
                disabled={
                  isSubmitting || (!content.trim() && imageFiles.length === 0)
                }
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-2 rounded-xl font-bold transition-all shadow-md shadow-indigo-200 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Post <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
