'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { ArrowUpTrayIcon, PhotoIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface ImageDimension {
  width: number;
  height: number;
  label: string;
}

const defaultDimensions: ImageDimension[] = [
  { width: 300, height: 250, label: 'Medium Rectangle' },
  { width: 728, height: 90, label: 'Leaderboard' },
  { width: 160, height: 600, label: 'Wide Skyscraper' },
  { width: 300, height: 600, label: 'Half Page' },
];

export default function ImageUploader() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resizedImages, setResizedImages] = useState<{ [key: string]: string }>({});
  const [isPosting, setIsPosting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/twitter/check');
        const data = await response.json();
        setIsAuthenticated(data.isAuthenticated);
      } catch (error) {
        console.error('Failed to check authentication:', error);
      }
    };

    checkAuth();
  }, []);

  const handleTwitterLogin = async () => {
    try {
      const response = await fetch('/api/auth/twitter');
      const data = await response.json();
      if (data.url) {
        sessionStorage.setItem('twitter_auth_redirect', window.location.href);
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Failed to initiate Twitter login:', error);
    }
  };

  const handlePostToTwitter = async () => {
    if (!Object.keys(resizedImages).length) return;

    setIsPosting(true);
    try {
      const response = await fetch('/api/twitter/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ images: resizedImages }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Images posted to Twitter successfully!');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Failed to post to Twitter:', error);
      alert('Failed to post images to Twitter. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  const handleResize = async () => {
    if (!uploadedImage) return;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/resize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: uploadedImage,
          dimensions: defaultDimensions,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to resize image');
      }

      const resizedImagesData = await response.json();
      setResizedImages(resizedImagesData);
    } catch (error) {
      console.error('Failed to resize image:', error);
      alert('Failed to resize image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setIsProcessing(true);
    const file = acceptedFiles[0];
    const reader = new FileReader();

    reader.onload = () => {
      setUploadedImage(reader.result as string);
      setResizedImages({});
      setIsProcessing(false);
    };

    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    },
    maxFiles: 1,
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="space-y-8">
        {/* Twitter Authentication Section */}
        <div className="flex justify-end">
          {!isAuthenticated ? (
            <button
              onClick={handleTwitterLogin}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              Twitter
            </button>
          ) : (
            <button
              onClick={handlePostToTwitter}
              disabled={isPosting || !Object.keys(resizedImages).length}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white transition-all
                ${isPosting || !Object.keys(resizedImages).length
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                }`}
            >
              {isPosting ? 'Posting...' : 'Post to Twitter'}
            </button>
          )}
        </div>

        {/* Upload Section */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
            ${isDragActive
              ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50'
              : 'border-gray-300 hover:border-gray-400 bg-white'
            }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-4">
            {isDragActive ? (
              <PhotoIcon className="h-12 w-12 text-blue-500 animate-bounce" />
            ) : (
              <ArrowUpTrayIcon className="h-12 w-12 text-gray-400" />
            )}
            <div className="space-y-2">
              <p className="text-xl font-medium text-gray-700">
                {isDragActive ? 'Drop your image here' : 'Upload your image'}
              </p>
              <p className="text-sm text-gray-500">
                Drag the image or click 
              </p>
              <p className="text-xs text-gray-400">
                fromat : PNG, JPG, JPEG, GIF
              </p>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        {uploadedImage && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-700">Original Image</h3>
              <button
                onClick={handleResize}
                disabled={isProcessing}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white transition-all
                  ${isProcessing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                  }`}
              >
                {isProcessing ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  'Resize Image'
                )}
              </button>
            </div>
            <div className="border rounded-lg p-4 bg-white shadow-sm">
              <Image
                src={uploadedImage}
                alt="Uploaded preview"
                width={800}
                height={600}
                className="max-w-full h-auto mx-auto"
                style={{ objectFit: 'contain' }}
              />
            </div>
          </div>
        )}

        {/* Resized Images Grid */}
        {Object.keys(resizedImages).length > 0 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-700">Resized Versions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {defaultDimensions.map((dimension) => (
                <div
                  key={`${dimension.width}x${dimension.height}`}
                  className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <h4 className="text-sm font-medium text-gray-600 mb-2">
                    {dimension.label} ({dimension.width}x{dimension.height})
                  </h4>
                  {resizedImages[`${dimension.width}x${dimension.height}`] ? (
                    <Image
                      src={resizedImages[`${dimension.width}x${dimension.height}`]}
                      alt={`${dimension.width}x${dimension.height}`}
                      width={dimension.width}
                      height={dimension.height}
                      className="max-w-full h-auto mx-auto"
                      style={{ objectFit: 'contain' }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-32 bg-gray-100 rounded">
                      <p className="text-sm text-gray-400">Processing...</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}