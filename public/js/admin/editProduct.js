let cropper;
const imageInput = document.getElementById('imageInput');
const cropperContainer = document.getElementById('cropperContainer');
const cropperImage = document.getElementById('cropperImage');
const cropBtn = document.getElementById('cropBtn');
const previewContainer = document.getElementById('previewContainer');
const form = document.getElementById('editProductForm');
const imageCounter = document.getElementById('imageCounter');
let croppedFiles = [];
let removedImages = [];
let filesToProcess = [];
let currentFileIndex = 0;
// Remove existing image
window.removeImage = function(button, imageName) {
  const existingImages = document.querySelectorAll('.image-item').length;
  
  if (existingImages - removedImages.length <= 3) {
    alert('Must keep at least 3 images');
    return;
  }
  
  if (confirm('Remove this image?')) {
    removedImages.push(imageName);
    document.getElementById('removedImages').value = JSON.stringify(removedImages);
    button.closest('.image-item').remove();
  }
};
imageInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  
  if (files.length === 0) return;
  
  filesToProcess = files;
  currentFileIndex = 0;
  croppedFiles = [];
  previewContainer.innerHTML = '';
  
  processNextImage();
});
function processNextImage() {
  if (currentFileIndex < filesToProcess.length) {
    const file = filesToProcess[currentFileIndex];
    const reader = new FileReader();
    
    imageCounter.textContent = `(${currentFileIndex + 1} of ${filesToProcess.length})`;
    
    reader.onload = (e) => {
      cropperImage.src = e.target.result;
      cropperContainer.style.display = 'block';
      
      if (cropper) {
        cropper.destroy();
      }
      
      cropper = new Cropper(cropperImage, {
        aspectRatio: 1,
        viewMode: 1,
        autoCropArea: 1
      });
    };
    
    reader.readAsDataURL(file);
  } else {
    cropperContainer.style.display = 'none';
  }
}
cropBtn.addEventListener('click', () => {
  if (!cropper) return;
  
  cropper.getCroppedCanvas({
    width: 800,
    height: 800
  }).toBlob((blob) => {
    croppedFiles.push(blob);
    
    const img = document.createElement('img');
    img.src = URL.createObjectURL(blob);
    previewContainer.appendChild(img);
    
    currentFileIndex++;
    processNextImage();
  }, 'image/jpeg', 0.95);
});
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const existingCount = document.querySelectorAll('.image-item').length - removedImages.length;
  const totalCount = existingCount + croppedFiles.length;
  
  if (totalCount < 3) {
    alert('Product must have at least 3 images');
    return;
  }
  
  const formData = new FormData(form);
  
  // Add new cropped images
  croppedFiles.forEach((blob, index) => {
    formData.append('images', blob, `product-new-${Date.now()}-${index}.jpg`);
  });
  
  const submitBtn = form.querySelector('.btn-submit');
  submitBtn.textContent = 'Updating...';
  submitBtn.disabled = true;
  
  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      window.location.href = '/admin/products';
    } else {
      alert('Error updating product');
      submitBtn.textContent = 'Update Product';
      submitBtn.disabled = false;
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error updating product');
    submitBtn.textContent = 'Update Product';
    submitBtn.disabled = false;
  }
});