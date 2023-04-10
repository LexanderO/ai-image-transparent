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
    <div>
      <form onSubmit={handleFormSubmit}>
        <label htmlFor="description">Enter an image description:</label>
        <input
          type="text"
          id="description"
          value={description}
          onChange={handleDescriptionChange}
        />
        <button type="submit">Generate Image</button>
      </form>
      {previewUrl && <img src={previewUrl} alt="Preview" />}
      {imageUrl && <img src={imageUrl} alt="Processed" />}
      <LoadingBar progress={progress} height={5} color="#00a8ff" />
      {loading && <div>{loadingMessage}</div>}
    </div>
  );
}

export default ImageGenerator;
