const fileInput = document.getElementById('fileInput');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const resizeRange = document.getElementById('resizeRange');
const qualitySelector = document.getElementById('quality');
const effectSelector = document.getElementById('effectSelector');
const saveButton = document.getElementById('saveButton');
const resetButton = document.getElementById('resetButton');

let images = [];
let scaleFactor = 1; 
let qualityMultiplier = 1; 
let originalImageData = null; 

// Default canvas size
const defaultCanvasWidth = 600; 
const defaultCanvasHeight = 400; 

// Handle image selection
fileInput.addEventListener('change', (event) => {
  const files = Array.from(event.target.files);
  images = [];
  console.log(`Selected ${files.length} file(s).`);

  if (files.length === 0) {
    console.error("Please select at least one image!");
    return;
  }

  files.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;

      img.onload = () => {
        images.push(img);
        console.log(`Image ${index + 1} loaded: Width=${img.width}, Height=${img.height}`);
        if (index === files.length - 1) {
          drawImages();
        }
      };

      img.onerror = () => {
        console.error(`Failed to load image: ${file.name}`);
      };
    };

    reader.onerror = () => {
      console.error(`Error reading file: ${file.name}`);
    };

    reader.readAsDataURL(file);
  });
});

// Update quality based on user selection
qualitySelector.addEventListener('change', () => {
  const quality = qualitySelector.value;

  switch (quality) {
    case "1": 
      qualityMultiplier = 1;
      break;
    case "2": 
      qualityMultiplier = 2;
      break;
    case "4": 
      qualityMultiplier = 4;
      break;
    default:
      qualityMultiplier = 1;
  }

  drawImages();
});

// Handle resize slider
resizeRange.addEventListener('input', () => {
  scaleFactor = resizeRange.value / 100;
  drawImages();
});

// Draw all images on the canvas
function drawImages() {
  if (images.length === 0) {
    console.error("No images available to draw!");
    return;
  }

  if (images.length === 1) {
    const img = images[0];
    canvas.width = img.width * qualityMultiplier * scaleFactor;
    canvas.height = img.height * qualityMultiplier * scaleFactor;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      img,
      0,
      0,
      img.width,
      img.height,
      0,
      0,
      canvas.width,
      canvas.height
    );
    originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return;
  }

  if (images.length >= 2) {
    const logoImage = images[0];
    const mainImage = images[1];

    canvas.width = mainImage.width * qualityMultiplier * scaleFactor;
    canvas.height = mainImage.height * qualityMultiplier * scaleFactor;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(
      mainImage,
      0,
      0,
      mainImage.width,
      mainImage.height,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const logoWidth = logoImage.width * scaleFactor * qualityMultiplier * 0.2;
    const logoHeight = logoImage.height * scaleFactor * qualityMultiplier * 0.2;
    const xPosition = canvas.width - logoWidth - 10;
    const yPosition = 10;

    ctx.drawImage(
      logoImage,
      0,
      0,
      logoImage.width,
      logoImage.height,
      xPosition,
      yPosition,
      logoWidth,
      logoHeight
    );

    originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  }
}

// Apply selected effect immediately upon change
effectSelector.addEventListener('change', () => {
  const effect = effectSelector.value;

  if (effect === "original") {
    if (originalImageData) {
      ctx.putImageData(originalImageData, 0, 0);
      console.log("Reset to original image.");
    } else {
      console.error("Original image data is unavailable.");
    }
    return; 
  }

  applySelectedEffect(effect);
});

// Apply the selected effect
function applySelectedEffect(effect) {
  // First, clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Ensure we have original image data before applying effects
  if (!originalImageData) {
    console.error("Original image data is unavailable.");
    return;
  }

  // Draw the original image onto the canvas
  ctx.putImageData(originalImageData, 0, 0);

  switch (effect) {
    case "redTint":
      const redImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < redImageData.data.length; i += 4) {
        redImageData.data[i] = redImageData.data[i] * 1.2;
        redImageData.data[i + 1] = redImageData.data[i + 1] * 0.8;
        redImageData.data[i + 2] = redImageData.data[i + 2] * 0.8;
      }
      ctx.putImageData(redImageData, 0, 0);
      break;

    case "blackWhite":
      const bwImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < bwImageData.data.length; i += 4) {
        const avg = (bwImageData.data[i] + bwImageData.data[i + 1] + bwImageData.data[i + 2]) / 3;
        bwImageData.data[i] = avg;
        bwImageData.data[i + 1] = avg;
        bwImageData.data[i + 2] = avg;
      }
      ctx.putImageData(bwImageData, 0, 0);
      break;

    case "invert":
      const invertImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < invertImageData.data.length; i += 4) {
        invertImageData.data[i] = 255 - invertImageData.data[i];
        invertImageData.data[i + 1] = 255 - invertImageData.data[i + 1];
        invertImageData.data[i + 2] = 255 - invertImageData.data[i + 2];
      }
      ctx.putImageData(invertImageData, 0, 0);
      break;

      case "blur":
        // Clear the canvas first, to ensure it's empty before drawing
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      
        // Draw both images onto the canvas without any effect
        images.forEach((img, index) => {
          const width = img.width * qualityMultiplier * scaleFactor;
          const height = img.height * qualityMultiplier * scaleFactor;
          
          ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, width, height);
        });
      
        // Get the image data of the entire canvas after both images have been drawn
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
      
        // Apply a simple blur effect by averaging surrounding pixels
        const radius = 5; // Blur radius (you can adjust this value)
        for (let i = 0; i < data.length; i += 4) {
          let r = 0, g = 0, b = 0;
          let count = 0;
      
          // Loop through a small square around each pixel
          for (let dx = -radius; dx <= radius; dx++) {
            for (let dy = -radius; dy <= radius; dy++) {
              const x = (i / 4) % canvas.width + dx;
              const y = Math.floor(i / 4 / canvas.width) + dy;
              
              if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
                const pixelIndex = (y * canvas.width + x) * 4;
                r += data[pixelIndex];
                g += data[pixelIndex + 1];
                b += data[pixelIndex + 2];
                count++;
              }
            }
          }
      
          // Set the pixel color to the average of the surrounding pixels
          if (count > 0) {
            data[i] = r / count;
            data[i + 1] = g / count;
            data[i + 2] = b / count;
          }
        }
      
        // Put the modified image data (with blur) back onto the canvas
        ctx.putImageData(imageData, 0, 0);
        break;      
  }
}

// Save the edited image
saveButton.addEventListener('click', () => {
  if (!fileInput.files || fileInput.files.length === 0) {
    alert("No image uploaded to save!");
    return;
  }

  // Get the original file name from the uploaded image
  const originalFileName = fileInput.files[0].name;
  const extensionIndex = originalFileName.lastIndexOf(".");
  const fileNameWithoutExtension = originalFileName.substring(0, extensionIndex) || "edited_image";
  
  // Set up the download link with the edited image
  const imageUrl = canvas.toDataURL("image/png");
  const link = document.createElement('a');
  link.href = imageUrl;
  link.download = `${fileNameWithoutExtension}_edited.png`;
  link.click();
});


// Reset the entire application to its initial state
resetButton.addEventListener('click', () => {
  location.reload();
});

// Define the shape types
const shapeSelector = document.createElement('select');
shapeSelector.id = 'shapeSelector';
shapeSelector.innerHTML = `
  <option value="" disabled selected>Select Shape</option>
  <option value="none">None</option>
  <option value="circle">Circle</option>
  <option value="star">Star</option>
`;

document.getElementById('controls').appendChild(shapeSelector);

// Draw shapes over the image
shapeSelector.addEventListener('change', () => {
  const shape = shapeSelector.value;
  drawShapeMask(shape);
});

// Function to draw a shape mask
function drawShapeMask(shape) {
  if (!originalImageData) {
    console.error("Original image data is unavailable.");
    return;
  }

  // Clear the canvas first to start fresh
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw all images first to fill the entire canvas
  images.forEach((img) => {
    const width = canvas.width;
    const height = canvas.height;

    // Draw image to fill the canvas (scaled)
    ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, width, height);
  });

  // Apply the shape mask on top of the images
  ctx.globalCompositeOperation = 'destination-in'; 
  ctx.beginPath();

  const shapeSize = Math.min(canvas.width, canvas.height) * 1.0; 

  switch (shape) {
    case 'circle':
      // Circle: Uses 80% of the smallest dimension of the canvas
      ctx.arc(canvas.width / 2, canvas.height / 2, shapeSize / 2, 0, Math.PI * 2);
      break;
    case 'star':
      // Star: Adjusted to the same size as the circle
      drawStar(ctx, canvas.width / 2, canvas.height / 2, 5, shapeSize / 2, shapeSize / 4);
      break;
    default:
      console.error("Invalid shape selected.");
  }
  ctx.closePath();
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
}

// Helper function to draw a star
function drawStar(ctx, x, y, points, outerRadius, innerRadius) {
  const angle = Math.PI / points;
  ctx.moveTo(x + outerRadius * Math.sin(0), y - outerRadius * Math.cos(0));
  for (let i = 1; i < 2 * points; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const currentAngle = i * angle;
    ctx.lineTo(x + radius * Math.sin(currentAngle), y - radius * Math.cos(currentAngle));
  }
}
// Draw shapes over the image
shapeSelector.addEventListener('change', () => {
  const shape = shapeSelector.value;

  // Clear any applied effect first
  const effect = effectSelector.value;
  if (effect !== "original") {
    applySelectedEffect("original"); 
  }

  drawShapeMask(shape);
});
