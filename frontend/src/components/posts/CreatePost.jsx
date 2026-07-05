import React, { useState } from "react";
import { usePosts } from "../../context/PostContext";
import { useAuth } from "../../context/AuthContext";
import { ImagePlus, SendHorizonal, Loader2, X } from "lucide-react";

const CreatePost = () => {
  const [content, setContent]           = useState("");
  const [imageFiles, setImageFiles]     = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createPost, uploadMedia } = usePosts();
  const { user } = useAuth();

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setImageFiles((prev) => [...prev, ...files]);
    Promise.all(
      files.map(
        (f) =>
          new Promise((res) => {
            const r = new FileReader();
            r.onloadend = () => res(r.result);
            r.readAsDataURL(f);
          })
      )
    ).then((newPreviews) =>
      setImagePreviews((prev) => [...prev, ...newPreviews])
    );
    // Reset input so same file can be re-added
    e.target.value = "";
  };

  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && imageFiles.length === 0) return;

    setIsSubmitting(true);
    const mediaIds = [];

    for (let i = 0; i < imageFiles.length; i++) {
      const fd = new FormData();
      fd.append("file", imageFiles[i]);
      const uploadResult = await uploadMedia(fd);
      if (uploadResult.success) {
        const url =
          uploadResult.data.url ||
          uploadResult.data.image ||
          uploadResult.data.data?.url;
        if (url) mediaIds.push(url);
      }
    }

    const result = await createPost({ content, mediaIds, username: user?.username });
    setIsSubmitting(false);
    if (result.success) {
      setContent("");
      setImageFiles([]);
      setImagePreviews([]);
    }
  };

  const initials = user?.username?.[0]?.toUpperCase() || "U";
  const canPost  = !isSubmitting && (content.trim() || imageFiles.length > 0);

  return (
    <div
      className="clay-card clay-card-purple mb-6"
      style={{ padding: "1.25rem" }}
    >
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          {/* Avatar */}
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-sm flex-shrink-0"
            style={{
              background: "linear-gradient(135deg,#8b5cf6,#c026d3)",
              boxShadow: "0 3px 0px #6d28d9",
            }}
          >
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            {/* Textarea */}
            <textarea
              placeholder={`What's on your mind, ${user?.username || "there"}? ✨`}
              className="w-full resize-none text-sm font-semibold text-purple-900 placeholder-purple-300 bg-transparent border-none outline-none leading-relaxed"
              style={{ minHeight: "72px", fontFamily: "Nunito, sans-serif" }}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={5000}
            />

            {/* Image previews */}
            {imagePreviews.length > 0 && (
              <div
                className={`grid gap-2 mt-3 ${
                  imagePreviews.length === 1 ? "grid-cols-1" : "grid-cols-2"
                }`}
              >
                {imagePreviews.map((preview, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-2xl overflow-hidden aspect-video bg-purple-50"
                    style={{ border: "2px solid #ede9fe" }}
                  >
                    <img
                      src={preview}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                      style={{
                        background: "rgba(0,0,0,0.55)",
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      <X size={14} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Action bar */}
            <div
              className="flex items-center justify-between mt-3 pt-3"
              style={{ borderTop: "2px dashed #ede9fe" }}
            >
              {/* Image upload */}
              <label
                className="flex items-center gap-1.5 text-sm font-bold text-purple-400 hover:text-purple-600 cursor-pointer transition-colors px-3 py-1.5 rounded-xl hover:bg-purple-50"
                title="Add photo"
              >
                <ImagePlus size={18} />
                <span>Photo</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                />
              </label>

              {/* Character count */}
              {content.length > 0 && (
                <span
                  className="text-xs font-bold tabular-nums"
                  style={{ color: content.length > 4500 ? "#e11d48" : "#c4b5fd" }}
                >
                  {content.length}/5000
                </span>
              )}

              {/* Post button */}
              <button
                id="create-post-btn"
                type="submit"
                disabled={!canPost}
                className="clay-btn clay-btn-primary flex items-center gap-2 px-4 py-2 text-sm"
                style={!canPost ? { opacity: 0.5, cursor: "not-allowed" } : {}}
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    Post <SendHorizonal size={15} />
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
