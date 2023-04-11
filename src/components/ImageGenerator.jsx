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
    setProgress(10);
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
    <div className="">
      <div className="flex flex-col sm:flex-row-reverse gap-10 m-5">
        <div className="w-full md:w-1/2 min-w-30 relative top-[10px] sm:top-[200px]">
          <form onSubmit={handleFormSubmit}>
            <label
              htmlFor="description"
              className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
            >
              Generate
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg
                  aria-hidden="true"
                  className="w-4 h-4 text-gray-500 dark:text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 32 32"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 20l4-2 14-14-2-2-14 14-2 4zM9.041 27.097c-0.989-2.085-2.052-3.149-4.137-4.137l3.097-8.525 4-2.435 12-12h-6l-12 12-6 20 20-6 12-12v-6l-12 12-2.435 4z"></path>
                </svg>
              </div>
              <input
                type="text"
                id="description"
                value={description}
                onChange={handleDescriptionChange}
                className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Enter an image description: ..."
                required
              />
              <button
                type="submit"
                className="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Generate
              </button>
            </div>
          </form>
        </div>
        <div className="w-full md:flex-initial">
        
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
        </div>
      </div>

      <LoadingBar
        progress={progress}
        height={10}
        color="#00a8ff"
        className="mb-4"
      />
      {loading && <div className="text-gray-700">{loadingMessage}</div>}
    </div>
  );
}

export default ImageGenerator;
