import React, { useState } from "react";
import axios from "axios";
import LoadingBar from "react-top-loading-bar";

import Placeholder from "../assets/placeholder.png";

function ImageGenerator() {
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [placeholder, setPlaceholder] = useState(true);
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
      setPlaceholder(false);
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
      <div className="flex flex-col sm:flex-row-reverse gap-20 z-20 mb-5 justify-center">
        <div className="w-full md:w-1/2 min-w-30 relative h-24 top-[10px] sm:top-[150px]  ">
        <h3 className="text-white font-black md:text-[70px] sm:text-[60px] xs:text-[50px] text-[40px] text-center pb-6 rotate-2">
            Glimpsed View
          </h3>
          <h3 className="sm:text-[30px] text-[15px] font-black text-white tracking-wider text-center -rotate-1">
            Generate Images
          </h3>
          <h3 className="sm:text-[14px] text-[10px] font-black text-white uppercase tracking-wider text-center pb-10 -rotate-2">
            Without Background
          </h3>
          <form onSubmit={handleFormSubmit} className="rotate-2">
            <label
              htmlFor="description"
              className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
            >
              Generate
            </label>
            <div className="relative">
              <input
                type="text"
                id="description"
                value={description}
                onChange={handleDescriptionChange}
                className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg drop-shadow-2xl bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Enter an image description: ..."
                required
              />
              <button
                type="submit"
                className="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Go
              </button>
            </div>
          </form>
        </div>
        <div className="w-1/3 md:flex-initial">
          {placeholder && (
            <img
              src={Placeholder}
              alt="Preview"
              className="max-w-full min-w-[220px] relative left-[90px] sm:left-[20px] top-[150px] sm:top-[100px] sm:mx-auto rounded-lg -rotate-2 drop-shadow-2xl"
            />
          )}
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-full min-w-[200px] relative left-[90px] sm:left-[20px] top-[150px] sm:top-[100px] sm:mx-auto rounded-lg -rotate-2 drop-shadow-2xl"
            />
          )}
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Processed"
              className="max-w-full min-w-[200px] relative left-[90px] sm:left-[20px] top-[150px] sm:top-[100px] sm:mx-auto rounded-lg -rotate-2 drop-shadow-2xl"
            />
          )}
        </div>
      </div>

      <LoadingBar
        progress={progress}
        height={15}
        color="#00a8ff"
        background="#494D5F"
        className=""
      />
      {loading && <div className="sm:text-[14px] text-[10px] font-black text-white uppercase tracking-wider -rotate-1 text-center pb-10">{loadingMessage}</div>}
    </div>
  );
}

export default ImageGenerator;
