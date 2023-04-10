import React, { useState } from 'react';
import axios from 'axios';

function ImageGenerator() {
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const ai_key = "Bearer " + import.meta.env.VITE_APP_OPENAI_API_KEY;
  const removebg_key = import.meta.env.VITE_APP_REMOVEBG_API_KEY;

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    try {
      const openaiResponse = await axios.post(
        'https://api.openai.com/v1/images/generations',
        {
          model: 'image-alpha-001',
          prompt: `Generate an image of ${description}`,
          response_format: 'url',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: ai_key,
          },
        }
      );
      const imageUrl = openaiResponse.data.data[0].url;
      const removeBgResponse = await axios.post(
        'https://api.remove.bg/v1.0/removebg',
        { image_url: imageUrl, size: 'regular' },
        {
          headers: {
            'X-Api-Key': removebg_key,
          },
          responseType: 'arraybuffer',
        }
      );
      const blob = new Blob([removeBgResponse.data], {
        type: 'image/png',
      });
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
    } catch (error) {
      console.error(error);
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
    </div>
  );
}

export default ImageGenerator;
