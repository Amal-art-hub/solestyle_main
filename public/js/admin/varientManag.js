
let imagesToDelete = [];
let currentVariantImages = [];

// Cropper variables for Add Modal
let cropper;
let croppedFiles = [];
let filesToProcess = [];
let currentFileIndex = 0;

// Cropper variables for Edit Modal
let editCropper;
let editCroppedFiles = [];
let editFilesToProcess = [];
let editCurrentFileIndex = 0;


// Open Add Modal
function openAddModal() {
  document.getElementById('addModal').style.display = 'block';
}

// Close Add Modal
function closeAddModal() {
  document.getElementById('addModal').style.display = 'none';
  document.getElementById('addVariantForm').reset();
}

// Open Edit Modal - Fetch variant details and show all images
async function openEditModal(button) {
  const id = button.dataset.id;
  const size = button.dataset.size;
  const color = button.dataset.color;
  const price = button.dataset.price;
  const stock = button.dataset.stock;

  // Reset tracking
  imagesToDelete = [];
  currentVariantImages = [];

  // Set form values
  document.getElementById('editVariantId').value = id;
  document.getElementById('editSize').value = size;
  document.getElementById('editColor').value = color;
  document.getElementById('editPrice').value = price;
  document.getElementById('editStock').value = stock;
  document.getElementById('deletedImages').value = '';

  // Set form action for POST request (not PUT - HTML forms don't support PUT)
  const form = document.getElementById('editVariantForm');
  form.action = `/admin/variants/${id}/edit`;
  form.method = 'POST';

  // Fetch full variant data to get ALL images
  try {
    const response = await fetch(`/admin/variants/${id}/details`);
    const data = await response.json();

    if (data.success && data.variant && data.variant.images) {
      currentVariantImages = [...data.variant.images];
      displayCurrentImages(data.variant.images);
    }
  } catch (error) {
    console.error('Error loading images:', error);
    alert('Error loading variant images');
  }

  document.getElementById('editModal').style.display = 'block';
}

// Display all current images with delete buttons
function displayCurrentImages(images) {
  const currentImagesDiv = document.getElementById('currentImages');
  const imageCountSpan = document.getElementById('imageCount');

  const remainingCount = images.length - imagesToDelete.length;
  imageCountSpan.textContent = `(${remainingCount} images)`;

  currentImagesDiv.innerHTML = '';

  images.forEach((img, index) => {
    const isDeleted = imagesToDelete.includes(img);
    const imageDiv = document.createElement('div');
    imageDiv.style.position = 'relative';
    imageDiv.style.opacity = isDeleted ? '0.3' : '1';
    imageDiv.innerHTML = `
      <img src="/uploads/variant-images/${img}" 
           alt="Variant image ${index + 1}" 
           style="width:100%; height:120px; object-fit:cover; border-radius:4px; border: 2px solid ${isDeleted ? '#ff4444' : '#ddd'};">
      <button type="button" 
              class="delete-image-btn" 
              onclick="toggleImageDelete('${img}')"
              style="position:absolute; top:5px; right:5px; background:${isDeleted ? '#28a745' : '#dc3545'}; color:white; border:none; border-radius:50%; width:25px; height:25px; cursor:pointer; font-size:16px; line-height:1;">
        ${isDeleted ? '↺' : '×'}
      </button>
      ${isDeleted ? '<p style="font-size:10px; margin-top:3px; color:#ff4444; text-align:center;">Marked for deletion</p>' : ''}
    `;
    currentImagesDiv.appendChild(imageDiv);
  });
}


function toggleImageDelete(imageName) {
  const index = imagesToDelete.indexOf(imageName);

  if (index > -1) {
   
    imagesToDelete.splice(index, 1);
  } else {

    const remainingImages = currentVariantImages.length - imagesToDelete.length;

    if (remainingImages <= 1) {
      alert('Cannot delete this image. You must keep at least 3 images.');
      return;
    }

    imagesToDelete.push(imageName);
  }

  
  document.getElementById('deletedImages').value = JSON.stringify(imagesToDelete);


  displayCurrentImages(currentVariantImages);
}


function closeEditModal() {
  imagesToDelete = [];
  currentVariantImages = [];
  document.getElementById('editModal').style.display = 'none';
  document.getElementById('editVariantForm').reset();
}

// Close modal when clicking outside
window.onclick = function (event) {
  const addModal = document.getElementById('addModal');
  const editModal = document.getElementById('editModal');

  if (event.target == addModal) {
    closeAddModal();
  }
  if (event.target == editModal) {
    closeEditModal();
  }
}

// Toggle Variant Listing
async function toggleVariant(button) {
  const variantId = button.dataset.id;

  try {
    const response = await fetch(`/admin/variants/${variantId}/toggle-listing`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();

    if (result.success) {
      location.reload();
    } else {
      alert(result.message || 'Error toggling variant');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error toggling variant');
  }
}

// Delete Variant
async function deleteVariant(variantId) {
  if (!confirm('Are you sure you want to delete this variant?')) {
    return;
  }

  try {
    const response = await fetch(`/admin/variants/${variantId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();

    if (result.success) {
      alert(result.message);
      location.reload();
    } else {
      alert(result.message || 'Error deleting variant');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error deleting variant');
  }
}

// Client-side validation and event listeners
document.addEventListener('DOMContentLoaded', function () {
  // Image input change handler for cropping
  const variantImagesInput = document.getElementById('variantImages');
  console.log('variantImagesInput element:', variantImagesInput);

  if (variantImagesInput) {
    variantImagesInput.addEventListener('change', (e) => {
      console.log('File input changed!');
      const files = Array.from(e.target.files);
      console.log('Files selected:', files.length);

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
      const previewContainer = document.getElementById('previewContainer');
      if (previewContainer) {
        previewContainer.innerHTML = '';
      }
      console.log('Calling processNextImage()...');
      processNextImage();
    });
  } else {
    console.error('variantImages input not found!');
  }

  // Crop button click handler
  const cropBtn = document.getElementById('cropBtn');
  if (cropBtn) {
    cropBtn.addEventListener('click', () => {
      if (!cropper) return;

      cropper.getCroppedCanvas({
        width: 800,
        height: 800
      }).toBlob((blob) => {
        croppedFiles.push(blob);

        // Show preview
        const img = document.createElement('img');
        img.src = URL.createObjectURL(blob);
        img.style.width = '100%';
        img.style.height = '100px';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '4px';
        const previewContainer = document.getElementById('previewContainer');
        if (previewContainer) {
          previewContainer.appendChild(img);
        }

        currentFileIndex++;
        processNextImage();
      }, 'image/jpeg', 0.95);
    });
  }

  // === EDIT MODAL CROPPING HANDLERS ===

  // Edit images input change handler for cropping
  const editImagesInput = document.getElementById('editImages');
  console.log('editImagesInput element:', editImagesInput);

  if (editImagesInput) {
    editImagesInput.addEventListener('change', (e) => {
      console.log('Edit file input changed!');
      const files = Array.from(e.target.files);
      console.log('New files selected for edit:', files.length);

      if (files.length > 0) {
        editFilesToProcess = files;
        editCurrentFileIndex = 0;
        editCroppedFiles = [];

        const editPreviewContainer = document.getElementById('editPreviewContainer');
        if (editPreviewContainer) {
          editPreviewContainer.innerHTML = '';
        }

        console.log('Calling processNextEditImage()...');
        processNextEditImage();
      }
    });
  } else {
    console.error('editImages input not found!');
  }

  // Edit crop button click handler
  const editCropBtn = document.getElementById('editCropBtn');
  if (editCropBtn) {
    editCropBtn.addEventListener('click', () => {
      if (!editCropper) return;

      editCropper.getCroppedCanvas({
        width: 800,
        height: 800
      }).toBlob((blob) => {
        editCroppedFiles.push(blob);

        // Show preview
        const img = document.createElement('img');
        img.src = URL.createObjectURL(blob);
        img.style.width = '100%';
        img.style.height = '100px';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '4px';

        const editPreviewContainer = document.getElementById('editPreviewContainer');
        if (editPreviewContainer) {
          editPreviewContainer.appendChild(img);
        }

        editCurrentFileIndex++;
        processNextEditImage();
      }, 'image/jpeg', 0.95);
    });
  }


  // Add variant form submission with cropped images
  const addForm = document.getElementById('addVariantForm');
  if (addForm) {
    addForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      // If using cropper, check cropped files
      if (croppedFiles.length > 0) {
        if (croppedFiles.length < 3) {
          alert('Please crop at least 3 images');
          return;
        }

        const formData = new FormData();

        // Add form fields
        formData.append('size', document.getElementById('addSize').value);
        formData.append('color', document.getElementById('addColor').value);
        formData.append('price', document.getElementById('addPrice').value);
        formData.append('stock', document.getElementById('addStock').value);

        // Add cropped images
        croppedFiles.forEach((blob, index) => {
          formData.append('images', blob, `variant-${Date.now()}-${index}.jpg`);
        });

        // Submit
        const response = await fetch(e.target.action, {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          location.reload();
        } else {
          alert('Error adding variant');
        }
      } else {
        // Fallback: original validation without cropper
        const fileInput = document.getElementById('variantImages');
        if (fileInput && fileInput.files.length < 3) {
          alert('Please select at least 3 images');
          return;
        }
        // Submit normally
        e.target.submit();
      }
    });
  }

  // Edit variant form validation and submission
  const editForm = document.getElementById('editVariantForm');
  if (editForm) {
    editForm.addEventListener('submit', async function (e) {
      e.preventDefault(); // Prevent default submission

      const newImagesCount = editCroppedFiles.length; // Use cropped files count
      const remainingImages = currentVariantImages.length - imagesToDelete.length;
      const totalImages = remainingImages + newImagesCount;

      if (totalImages < 1) {
        alert(`Total images must be at least 3. Currently: ${remainingImages} existing - ${imagesToDelete.length} to delete + ${newImagesCount} new = ${totalImages} total`);
        return;
      }

      if (totalImages > 10) {
        alert(`Total images cannot exceed 10. Currently: ${totalImages} total`);
        return;
      }

      console.log('Submitting edit variant with', totalImages, 'total images');

      // Create FormData
      const formData = new FormData();
      formData.append('variantId', document.getElementById('editVariantId').value);
      formData.append('size', document.getElementById('editSize').value);
      formData.append('color', document.getElementById('editColor').value);
      formData.append('price', document.getElementById('editPrice').value);
      formData.append('stock', document.getElementById('editStock').value);
      formData.append('deletedImages', document.getElementById('deletedImages').value);

      // Add cropped images
      editCroppedFiles.forEach((blob, index) => {
        formData.append('newImages', blob, `variant-edit-${Date.now()}-${index}.jpg`);
      });

      // Submit via fetch
      try {
        const response = await fetch(e.target.action, {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          location.reload();
        } else {
          alert('Error updating variant');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error updating variant');
      }
    });
  }
});

// Process next image for cropping
function processNextImage() {
  console.log('processNextImage called, currentFileIndex:', currentFileIndex, 'total files:', filesToProcess.length);

  if (currentFileIndex < filesToProcess.length) {
    const file = filesToProcess[currentFileIndex];
    const reader = new FileReader();

    const imageCounter = document.getElementById('imageCounter');
    if (imageCounter) {
      imageCounter.textContent = `(${currentFileIndex + 1} of ${filesToProcess.length})`;
    }

    reader.onload = (e) => {
      console.log('Image loaded, setting up cropper...');
      const cropperImage = document.getElementById('cropperImage');
      const cropperContainer = document.getElementById('cropperContainer');

      console.log('cropperImage element:', cropperImage);
      console.log('cropperContainer element:', cropperContainer);

      if (cropperImage && cropperContainer) {
        cropperImage.src = e.target.result;
        cropperContainer.style.display = 'block';
        console.log('Cropper container should now be visible');

        if (cropper) {
          cropper.destroy();
        }

        // Check if Cropper is available
        if (typeof Cropper === 'undefined') {
          console.error('Cropper library is not loaded!');
          alert('Error: Image cropping library not loaded. Please refresh the page.');
          return;
        }

        console.log('Creating new Cropper instance...');
        cropper = new Cropper(cropperImage, {
          aspectRatio: 1,  // Square images
          viewMode: 1,
          autoCropArea: 1
        });
        console.log('Cropper created successfully');
      } else {
        console.error('cropperImage or cropperContainer not found!');
      }
    };

    reader.readAsDataURL(file);
  } else {
    console.log('All images processed, hiding cropper');
    const cropperContainer = document.getElementById('cropperContainer');
    if (cropperContainer) {
      cropperContainer.style.display = 'none';
    }
  }
}

// Process next image for cropping in Edit Modal
function processNextEditImage() {
  console.log('processNextEditImage called, index:', editCurrentFileIndex, 'total:', editFilesToProcess.length);

  if (editCurrentFileIndex < editFilesToProcess.length) {
    const file = editFilesToProcess[editCurrentFileIndex];
    const reader = new FileReader();

    const editImageCounter = document.getElementById('editImageCounter');
    if (editImageCounter) {
      editImageCounter.textContent = `(${editCurrentFileIndex + 1} of ${editFilesToProcess.length})`;
    }

    reader.onload = (e) => {
      console.log('Edit image loaded, setting up cropper...');
      const editCropperImage = document.getElementById('editCropperImage');
      const editCropperContainer = document.getElementById('editCropperContainer');

      console.log('editCropperImage element:', editCropperImage);
      console.log('editCropperContainer element:', editCropperContainer);

      if (editCropperImage && editCropperContainer) {
        editCropperImage.src = e.target.result;
        editCropperContainer.style.display = 'block';
        console.log('Edit cropper container visible');

        if (editCropper) {
          editCropper.destroy();
        }

        // Check if Cropper is available
        if (typeof Cropper === 'undefined') {
          console.error('Cropper library not loaded!');
          alert('Error: Image cropping library not loaded. Please refresh the page.');
          return;
        }

        console.log('Creating edit Cropper instance...');
        editCropper = new Cropper(editCropperImage, {
          aspectRatio: 1,  // Square images
          viewMode: 1,
          autoCropArea: 1
        });
        console.log('Edit cropper created successfully');
      } else {
        console.error('Edit cropper elements not found!');
      }
    };

    reader.readAsDataURL(file);
  } else {
    console.log('All edit images processed, hiding cropper');
    const editCropperContainer = document.getElementById('editCropperContainer');
    if (editCropperContainer) {
      editCropperContainer.style.display = 'none';
    }
  }
}