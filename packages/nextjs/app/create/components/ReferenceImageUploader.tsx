import { useEffect, useRef, useState } from "react";

interface ReferenceImageUploaderProps {
  canvasSize: number;
}

const ReferenceImageUploader = ({ canvasSize }: ReferenceImageUploaderProps) => {
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [showReferenceImage, setShowReferenceImage] = useState(true);
  const [imageOpacity, setImageOpacity] = useState(0.5); // Default 50% opacity
  const [imageScale, setImageScale] = useState(1.0); // Default 100% scale
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [naturalDimensions, setNaturalDimensions] = useState({ width: 0, height: 0 });

  // Handle reference image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      setReferenceImage(event.target?.result as string);
      setShowReferenceImage(true);
      setImageScale(1.0); // Reset scale when new image is uploaded
    };
    reader.readAsDataURL(file);
  };

  // Get natural image dimensions when image loads
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && referenceImage) {
      setNaturalDimensions({
        width: imgRef.current.naturalWidth,
        height: imgRef.current.naturalHeight,
      });
    }
  }, [referenceImage]);

  // Handle image load to get natural dimensions
  const handleImageLoad = () => {
    if (imgRef.current) {
      setNaturalDimensions({
        width: imgRef.current.naturalWidth,
        height: imgRef.current.naturalHeight,
      });
    }
  };

  // Trigger file input click
  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Toggle reference image visibility
  const handleToggleReferenceImage = () => {
    setShowReferenceImage(prev => !prev);
  };

  // Handle opacity change
  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageOpacity(parseFloat(e.target.value));
  };

  // Handle scale change
  const handleScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageScale(parseFloat(e.target.value));
  };

  // Calculate the appropriate dimensions to maintain aspect ratio and fit within canvas
  const calculateImageDimensions = () => {
    if (naturalDimensions.width === 0 || naturalDimensions.height === 0) {
      return { width: "100%", height: "100%" };
    }

    const aspectRatio = naturalDimensions.width / naturalDimensions.height;
    let width, height;

    if (aspectRatio > 1) {
      // Image is wider than tall
      width = canvasSize * imageScale;
      height = width / aspectRatio;
    } else {
      // Image is taller than wide
      height = canvasSize * imageScale;
      width = height * aspectRatio;
    }

    return { width: `${width}px`, height: `${height}px` };
  };

  const imageDimensions = calculateImageDimensions();

  return (
    <div>
      {/* Reference Image Display - positioned absolutely to overlay the canvas */}
      {referenceImage && showReferenceImage && (
        <div
          className="absolute top-0 left-0 w-full h-full z-20 flex items-center justify-center"
          style={{
            pointerEvents: "none", // Allow clicks to pass through to canvas
            position: "absolute",
            width: `${canvasSize}px`,
            height: `${canvasSize}px`,
          }}
        >
          <img
            ref={imgRef}
            src={referenceImage}
            alt="Reference"
            onLoad={handleImageLoad}
            style={{
              opacity: imageOpacity,
              width: imageDimensions.width,
              height: imageDimensions.height,
              maxWidth: `${canvasSize}px`,
              maxHeight: `${canvasSize}px`,
              objectFit: "contain",
            }}
          />
        </div>
      )}

      <div className="flex flex-wrap gap-2 justify-center mt-4">
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
          aria-label="Upload reference image"
        />

        {/* Upload button */}
        <button
          onClick={handleUploadButtonClick}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Upload reference image"
        >
          Upload Reference Image
        </button>

        {/* Toggle reference image visibility */}
        {referenceImage && (
          <button
            onClick={handleToggleReferenceImage}
            className={`px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              showReferenceImage
                ? "bg-green-500 hover:bg-green-600 focus:ring-green-500 text-white"
                : "bg-gray-200 hover:bg-gray-300 focus:ring-gray-500 text-gray-700"
            }`}
            aria-label={showReferenceImage ? "Hide reference image" : "Show reference image"}
          >
            {showReferenceImage ? "Hide Reference" : "Show Reference"}
          </button>
        )}
      </div>

      {/* Controls - only show when image is visible */}
      {referenceImage && showReferenceImage && (
        <div className="flex flex-col space-y-2 items-center justify-center">
          <div className="flex items-center space-x-2 justify-center">
            <label htmlFor="opacity" className="text-sm font-medium">
              Opacity: {Math.round(imageOpacity * 100)}%
            </label>
            <input
              id="opacity"
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={imageOpacity}
              onChange={handleOpacityChange}
              className="w-32"
              aria-label="Adjust reference image opacity"
            />
          </div>

          <div className="flex items-center space-x-2 justify-center">
            <label htmlFor="scale" className="text-sm font-medium">
              Scale: {Math.round(imageScale * 100)}%
            </label>
            <input
              id="scale"
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={imageScale}
              onChange={handleScaleChange}
              className="w-32"
              aria-label="Adjust reference image scale"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferenceImageUploader;
