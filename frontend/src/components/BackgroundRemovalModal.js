import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import './BackgroundRemovalModal.css';

const BackgroundRemovalModal = ({ 
  isOpen, 
  onClose, 
  images, 
  onSaveImages 
}) => {
  const [imageStates, setImageStates] = useState({});
  const [imagePreviews, setImagePreviews] = useState({});
  const [processing, setProcessing] = useState(false);
  const [selectedModel, setSelectedModel] = useState('rembg');

  const handleRemoveBackground = async (imageUrl, imageIndex) => {
    try {
      setProcessing(true);
      
      // Update state to show processing
      setImageStates(prev => ({
        ...prev,
        [imageIndex]: 'processing'
      }));

      // Fetch the image and convert to File object
      const response = await fetch(`http://localhost:5005${imageUrl}`);
      const blob = await response.blob();
      const file = new File([blob], 'image.jpg', { type: blob.type });

      // Create FormData and send to backend
      const formData = new FormData();
      formData.append('image', file);
      formData.append('model_type', selectedModel);

      const backgroundRemovalResponse = await fetch('/api/products/remove-background', {
        method: 'POST',
        body: formData
      });

      if (backgroundRemovalResponse.ok) {
        const result = await backgroundRemovalResponse.json();
        
        // Update preview
        setImagePreviews(prev => ({
          ...prev,
          [imageIndex]: result.preview
        }));
        
        // Update state to show preview
        setImageStates(prev => ({
          ...prev,
          [imageIndex]: 'preview'
        }));
        
        toast.success(`Background removed using ${selectedModel.toUpperCase()}! Review and save if satisfied.`);
      } else {
        const error = await backgroundRemovalResponse.json();
        toast.error(`Background removal failed: ${error.error}`);
        
        // Reset state
        setImageStates(prev => ({
          ...prev,
          [imageIndex]: 'none'
        }));
      }
    } catch (error) {
      console.error('Error removing background:', error);
      toast.error('Error removing background');
      
      // Reset state
      setImageStates(prev => ({
        ...prev,
        [imageIndex]: 'none'
      }));
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveProcessedImage = async (imageIndex) => {
    try {
      const previewData = imagePreviews[imageIndex];
      if (!previewData) {
        toast.error('No preview data found');
        return;
      }

      const response = await fetch('/api/products/save-processed-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image_data: previewData
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update the image in the list
        const updatedImages = [...images];
        updatedImages[imageIndex] = result.image_url;
        
        // Clear preview and state
        setImagePreviews(prev => {
          const newPreviews = { ...prev };
          delete newPreviews[imageIndex];
          return newPreviews;
        });
        
        setImageStates(prev => ({
          ...prev,
          [imageIndex]: 'saved'
        }));
        
        // Update parent component
        onSaveImages(updatedImages);
        
        toast.success('Background-removed image saved as PNG!');
      } else {
        const error = await response.json();
        toast.error(`Save failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving processed image:', error);
      toast.error('Error saving processed image');
    }
  };

  const handleDiscardPreview = (imageIndex) => {
    // Clear preview
    setImagePreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[imageIndex];
      return newPreviews;
    });
    
    // Reset state
    setImageStates(prev => ({
      ...prev,
      [imageIndex]: 'none'
    }));
    
    toast('Preview discarded', {
      icon: 'ℹ️',
    });
  };

  const handleCloseModal = () => {
    // Clear all states
    setImageStates({});
    setImagePreviews({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="background-removal-modal-overlay">
      <div className="background-removal-modal">
        <div className="modal-header">
          <h3>🎨 Background Removal Tool</h3>
          <button 
            className="close-button"
            onClick={handleCloseModal}
          >
            ×
          </button>
        </div>
        
        <div className="modal-content">
          <div className="instructions">
            <p>💡 <strong>Instructions:</strong> Check the "Remove background" option for each image you want to process. Review the preview and save if satisfied.</p>
            <p>🎯 <strong>Best results:</strong> Images with solid, uniform backgrounds (white, single color, etc.)</p>
          </div>
          
          <div className="model-selection">
            <label className="model-label">
              <strong>🤖 AI Model:</strong>
              <select 
                value={selectedModel} 
                onChange={(e) => setSelectedModel(e.target.value)}
                className="model-select"
              >
                <option value="rembg">REMBG (BiRefNet) - Fast & Accurate</option>
                <option value="bria">BRIA RMBG - Professional Grade</option>
              </select>
            </label>
          </div>
          
          <div className="images-grid">
            {images.map((imageUrl, index) => (
              <div key={index} className="image-card">
                <div className="image-container">
                  <img 
                    src={imagePreviews[index] || imageUrl} 
                    alt={`Product ${index + 1}`}
                    className={`preview-image ${imageStates[index] === 'preview' ? 'has-preview' : ''}`}
                  />
                  
                  {imageStates[index] === 'processing' && (
                    <div className="processing-overlay">
                      <div className="spinner"></div>
                      <span>Processing...</span>
                    </div>
                  )}
                  
                  {imageStates[index] === 'saved' && (
                    <div className="status-indicator saved">
                      <span>✓ Saved as PNG</span>
                    </div>
                  )}
                  
                  {imageStates[index] === 'preview' && (
                    <div className="status-indicator preview">
                      <span>👁️ Preview</span>
                    </div>
                  )}
                </div>
                
                <div className="image-controls">
                  <div className="checkbox-container">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={imageStates[index] === 'preview' || imageStates[index] === 'saved'}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleRemoveBackground(imageUrl, index);
                          } else {
                            handleDiscardPreview(index);
                          }
                        }}
                        disabled={imageStates[index] === 'processing'}
                      />
                      Remove background
                    </label>
                  </div>
                  
                  {imageStates[index] === 'preview' && (
                    <div className="action-buttons">
                      <button
                        className="btn btn-success"
                        onClick={() => handleSaveProcessedImage(index)}
                      >
                        💾 Save PNG
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleDiscardPreview(index)}
                      >
                        🗑️ Discard
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="modal-footer">
          <button 
            className="btn btn-primary"
            onClick={handleCloseModal}
          >
            ✅ Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackgroundRemovalModal; 