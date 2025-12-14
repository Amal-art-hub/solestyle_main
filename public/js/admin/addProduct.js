let cropper;
const imageInput = document.getElementById('imageInput');
const cropperImage = document.getElementById('cropperImage');
const cropperContainer = document.getElementById('cropperContainer');
const cropBtn = document.getElementById('cropBtn');
const previewContainer = document.getElementById('previewContainer');
const form = document.getElementById('addProductForm');
const imageCounter = document.getElementById('imageCounter');
let croppedFiles = [];
let filesToProcess = [];
let currentFileIndex = 0;
imageInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  
  if (files.length < 3) {
    alert('Please select at least 3 images');
    e.target.value = '';
    return;
  }
  
  if (files.length > 10) {
    alert('Maximum 10 images allowed');
    e.target.value = '';
    return;
  }
  
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
        autoCropArea: 1,
        responsive: true
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
  
  if (croppedFiles.length < 3) {
    alert('Please crop at least 3 images');
    return;
  }
  
  const formData = new FormData(form);
  
  // Clear original file input
  formData.delete('images');
  
  // Add cropped images
  croppedFiles.forEach((blob, index) => {
    formData.append('images', blob, `product-${Date.now()}-${index}.jpg`);
  });
  
  const submitBtn = form.querySelector('.btn-submit');
  submitBtn.textContent = 'Adding Product...';
  submitBtn.disabled = true;
  
  try {
    const response = await fetch('/admin/products/add', {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      window.location.href = '/admin/products';
    } else {
      alert('Error adding product');
      submitBtn.textContent = 'Add Product';
      submitBtn.disabled = false;
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error adding product');
    submitBtn.textContent = 'Add Product';
    submitBtn.disabled = false;
  }
});