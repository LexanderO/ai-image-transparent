import React, { useState } from "react";
import axios from "axios";
import LoadingBar from "react-top-loading-bar";

function ImageGenerator() {
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [progress, setProgress] = useState(0);

  const ai_key = "Bearer " + import.meta.env.VITE_APP_OPENAI_API_KEY;
  const removebg_key = import.meta.env.VITE_APP_REMOVEBG_API_KEY;

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setImageUrl("");
    setPreviewUrl("");
    setLoading(true);
    setLoadingMessage("Generating image...");
    try {
      const openaiResponse = await axios.post(
        "https://api.openai.com/v1/images/generations",
        {
          model: "image-alpha-001",
          prompt: `${description}`,
          response_format: "url",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: ai_key,
          },
        }
      );
      setLoadingMessage("Removing background...");
      setProgress(50);
      const imageUrl = openaiResponse.data.data[0].url;
      const removeBgResponse = await axios.post(
        "https://api.remove.bg/v1.0/removebg",
        { image_url: imageUrl, size: "regular" },
        {
          headers: {
            "X-Api-Key": removebg_key,
          },
          responseType: "arraybuffer",
          onDownloadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          },
        }
      );
      setLoadingMessage("Processing image...");
      const blob = new Blob([removeBgResponse.data], {
        type: "image/png",
      });
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
      setLoadingMessage("");
      setProgress(100);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoadingMessage("");
      setProgress(0);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleFormSubmit} className="mb-4">
        <label htmlFor="description" className="block mb-2 text-gray-700">
          Enter an image description:
        </label>
        <input
          type="text"
          id="description"
          value={description}
          onChange={handleDescriptionChange}
          className="w-full border border-gray-400 py-2 px-3 rounded-lg mb-4"
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Generate Image
        </button>
      </form>
      {previewUrl && (
        <img
          src={previewUrl}
          alt="Preview"
          className="max-w-full mb-4 rounded-lg"
        />
      )}
      {imageUrl && (
        <img
          src={imageUrl}
          alt="Processed"
          className="max-w-full mb-4 rounded-lg"
        />
      )}
      <LoadingBar
        progress={progress}
        height={5}
        color="#00a8ff"
        className="mb-4"
      />
      {loading && <div className="text-gray-700">{loadingMessage}</div>}
    </div>
  );
}

export default ImageGenerator;
