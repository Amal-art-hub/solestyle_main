


let currentStock = 0;

document.addEventListener('DOMContentLoaded', () => {
    // === 1. MAGNIFYING GLASS ZOOM ===
    const mainImgWrapper = document.querySelector('.main-image-wrapper');
    const mainImg = document.getElementById('mainImage');
    const lens = document.querySelector('.zoom-lens');
    const zoomLevel = 2; // 2x Zoom

    if (mainImgWrapper && mainImg && lens) {
        
        mainImgWrapper.addEventListener('mouseenter', () => {
            lens.style.display = 'block';
            lens.style.backgroundImage = `url('${mainImg.src}')`;
            lens.style.backgroundSize = `${mainImg.scrollWidth * zoomLevel}px ${mainImg.scrollHeight * zoomLevel}px`;
        });

        mainImgWrapper.addEventListener('mouseleave', () => {
            lens.style.display = 'none';
        });

        mainImgWrapper.addEventListener('mousemove', (e) => {
            const rect = mainImgWrapper.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Center lens on cursor
            let lensX = x - (lens.offsetWidth / 2);
            let lensY = y - (lens.offsetHeight / 2);

            // Prevent lens from going outside
            if (lensX < 0) lensX = 0;
            if (lensX > rect.width - lens.offsetWidth) lensX = rect.width - lens.offsetWidth;
            if (lensY < 0) lensY = 0;
            if (lensY > rect.height - lens.offsetHeight) lensY = rect.height - lens.offsetHeight;

            lens.style.left = lensX + 'px';
            lens.style.top = lensY + 'px';

            // Move background in reverse to create zoom effect
            lens.style.backgroundPosition = `-${lensX * zoomLevel}px -${lensY * zoomLevel}px`;
        });
    }

    // === 2. THUMBNAIL CLICK ===
    document.querySelectorAll('.thumbnail-wrapper').forEach(thumb => {
        thumb.addEventListener('click', function () {
            changeImage(this, this.dataset.image);
        });
    });

    // === 3. VARIANT SELECTION (SIZE) ===
    document.querySelectorAll('.size-box').forEach(box => {
        box.addEventListener('click', function () {
            selectVariant(this.dataset.variantId, this.dataset.price, parseInt(this.dataset.stock));
        });
    });

    // === 4. COLOR SELECTION (INITIAL) ===
    const activeColorBtn = document.querySelector('.color-btn.active');
    if (activeColorBtn) {
        filterByColor(activeColorBtn, activeColorBtn.textContent.trim());
    }
});

function changeImage(element, imageName) {
    if (element) {
        document.querySelectorAll('.thumbnail-wrapper').forEach(el => el.classList.remove('active'));
        element.classList.add('active');
    }

    const mainImg = document.getElementById('mainImage');
    mainImg.src = `/uploads/variant-images/${imageName}`;

    // Update Zoom Lens Background too
    const lens = document.querySelector('.zoom-lens');
    if (lens) {
        lens.style.backgroundImage = `url('/uploads/variant-images/${imageName}')`;
    }
}

function selectVariant(variantId, price, stock) {
    document.getElementById('selectedVariantId').value = variantId;

    document.querySelectorAll('.size-box').forEach(el => {
        el.classList.remove('selected');
        if (el.dataset.variantId === variantId) el.classList.add('selected');
    });

    document.getElementById('displayPrice').textContent = price;
    currentStock = stock;
    const stockStatus = document.querySelector('.stock-status');

    if (stock > 0) {
        stockStatus.className = 'stock-status in-stock';
        stockStatus.textContent = 'In Stock';
        document.querySelector('.btn-add-cart').disabled = false;
        document.querySelector('.btn-add-cart').style.opacity = '1';
    } else {
        stockStatus.className = 'stock-status out-of-stock';
        stockStatus.textContent = 'Out of Stock';
        document.querySelector('.btn-add-cart').disabled = true;
        document.querySelector('.btn-add-cart').style.opacity = '0.5';
    }
}

function filterByColor(btnElement, selectedColor) {
    document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');

    const sizeBoxes = document.querySelectorAll('.size-box');
    let firstVisibleBox = null;

    sizeBoxes.forEach(box => {
        if (box.dataset.color === selectedColor) {
            box.classList.remove('hidden');
            if (!firstVisibleBox) firstVisibleBox = box;
            const newImage = box.dataset.image;
            if (newImage) changeImage(null, newImage);
        } else {
            box.classList.add('hidden');
            box.classList.remove('selected');
        }
    });

    if (firstVisibleBox) firstVisibleBox.click();

    // Update Thumbnails
    if (typeof variantImages !== 'undefined' && variantImages[selectedColor]) {
        const images = variantImages[selectedColor];
        const thumbnailContainer = document.querySelector('.thumbnails-column');
        if (thumbnailContainer && images.length > 0) {
            thumbnailContainer.innerHTML = '';
            images.forEach((img, index) => {
                const thumbDiv = document.createElement('div');
                thumbDiv.className = `thumbnail-wrapper ${index === 2 ? 'active' : ''}`; // Default to 3rd img
                thumbDiv.setAttribute('data-image', img);
                thumbDiv.innerHTML = `<img src="/uploads/variant-images/${img}" alt="Thumbnail">`;
                thumbDiv.addEventListener('click', function() { changeImage(this, img); });
                thumbnailContainer.appendChild(thumbDiv);
            });
            changeImage(null, images[2] || images[0]);
        }
    }
}

async function addToCart() {
    const variantId = document.getElementById('selectedVariantId').value;
    if (!variantId) {
        Swal.fire({ icon: 'warning', title: 'Please select a size', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
        return;
    }
    try {
        const response = await axios.post('/cart/add', { variantId, quantity: 1 });
        if (response.data.success) {
            Swal.fire({ icon: 'success', title: 'Added to Cart', showConfirmButton: false, timer: 1500 });
        }
    } catch (error) {
        if (error.response?.status === 401) window.location.href = '/login';
        else Swal.fire({ icon: 'error', title: 'Oops...', text: error.response?.data?.message || 'Error' });
    }
}




























// let currentStock = 0;

// document.addEventListener('DOMContentLoaded', () => {
//     // === PROFESSIONAL SIDE ZOOM ===
//     const mainImgWrapper = document.querySelector('.main-image-wrapper');
//     const img = document.getElementById('mainImage');
//     const result = document.getElementById('myResult');
//     const lens = document.querySelector('.zoom-lens');

//     if (img && result && lens) {
        
//         // 1. Calculate Ratios when mouse acts
//         const cx = result.offsetWidth / lens.offsetWidth;
//         const cy = result.offsetHeight / lens.offsetHeight;

//         mainImgWrapper.addEventListener('mouseenter', () => {
//              // Show everything
//             lens.style.display = 'block';
//             result.style.display = 'block';
            
//             // Set background of result to matches image
//             result.style.backgroundImage = `url('${img.src}')`;
            
//             // Set size of background image (this is the zoom magic)
//             // It scales the background relative to the lens/result ratio
//             result.style.backgroundSize = (img.width * cx) + "px " + (img.height * cy) + "px";
//         });

//         mainImgWrapper.addEventListener('mouseleave', () => {
//             lens.style.display = 'none';
//             result.style.display = 'none';
//         });

//         mainImgWrapper.addEventListener('mousemove', moveLens);

//         function moveLens(e) {
//             e.preventDefault();
            
//             // Get cursor position
//             const pos = getCursorPos(e);
            
//             // Calculate lens position (centered)
//             let x = pos.x - (lens.offsetWidth / 2);
//             let y = pos.y - (lens.offsetHeight / 2);

//             // Prevent lens from being positioned outside the image
//             if (x > img.width - lens.offsetWidth) {x = img.width - lens.offsetWidth;}
//             if (x < 0) {x = 0;}
//             if (y > img.height - lens.offsetHeight) {y = img.height - lens.offsetHeight;}
//             if (y < 0) {y = 0;}

//             // Set lens position
//             lens.style.left = x + "px";
//             lens.style.top = y + "px";

//             // Move the background of the result box
//             result.style.backgroundPosition = "-" + (x * cx) + "px -" + (y * cy) + "px";
//         }

//         function getCursorPos(e) {
//             let a, x = 0, y = 0;
//             e = e || window.event;
//             // Get the image position
//             a = img.getBoundingClientRect();
//             // Calculate relative coordinates
//             x = e.pageX - a.left;
//             y = e.pageY - a.top;
//             // Consider page scrolling
//             x = x - window.pageXOffset;
//             y = y - window.pageYOffset;
//             return {x : x, y : y};
//         }
//     }
    
//     // ... Any other code (thumbnail clicks etc) ...
// });
// // Change Main Image
// function changeImage(element, imageName) {
//     if (element) {
//         document.querySelectorAll('.thumbnail-wrapper').forEach(el => el.classList.remove('active'));
//         element.classList.add('active');
//     }

//     const mainImg = document.getElementById('mainImage');
//     mainImg.src = `/uploads/variant-images/${imageName}`;

//     // Update Zoom Lens Background if it exists
//     const lens = document.querySelector('.zoom-lens');
//     if (lens) {
//         lens.style.backgroundImage = `url('/uploads/variant-images/${imageName}')`;
//     }
// }

// // Select Variant
// function selectVariant(variantId, price, stock) {
//     // Update hidden input
//     document.getElementById('selectedVariantId').value = variantId;

//     // Update active UI
//     document.querySelectorAll('.size-box').forEach(el => {
//         el.classList.remove('selected');
//         if (el.dataset.variantId === variantId) el.classList.add('selected');
//     });

//     // Update Price
//     document.getElementById('displayPrice').textContent = price;

//     // Update Stock Status
//     const stockStatus = document.querySelector('.stock-status');
//     currentStock = stock;

//     if (stock > 0) {
//         stockStatus.className = 'stock-status in-stock';
//         stockStatus.textContent = 'In Stock';
//         document.querySelector('.btn-add-cart').disabled = false;
//         document.querySelector('.btn-add-cart').style.opacity = '1';
//     } else {
//         stockStatus.className = 'stock-status out-of-stock';
//         stockStatus.textContent = 'Out of Stock';
//         document.querySelector('.btn-add-cart').disabled = true;
//         document.querySelector('.btn-add-cart').style.opacity = '0.5';
//     }


// }

// // Add to Cart
// async function addToCart() {
//     const variantId = document.getElementById('selectedVariantId').value;

//     if (!variantId) {
//         Swal.fire({
//             icon: 'warning',
//             title: 'Please select a size',
//             toast: true,
//             position: 'top-end',
//             showConfirmButton: false,
//             timer: 3000
//         });
//         return;
//     }

//     try {
//         const response = await axios.post('/cart/add', {
//             variantId,
//             quantity: 1
//         });

//         if (response.data.success) {
//             Swal.fire({
//                 icon: 'success',
//                 title: 'Added to Cart',
//                 text: 'Product has been added to your cart',
//                 showConfirmButton: false,
//                 timer: 1500
//             });
//             // Optional: Update cart count in header
//         }
//     } catch (error) {
//         console.error(error);
//         if (error.response && error.response.status === 401) {
//             window.location.href = '/login';
//         } else {
//             Swal.fire({
//                 icon: 'error',
//                 title: 'Oops...',
//                 text: error.response?.data?.message || 'Something went wrong!',
//             });
//         }
//     }
// }

// function filterByColor(btnElement, selectedColor) {
//     // 1. Update Active Color Button UI
//     document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('active'));
//     btnElement.classList.add('active');

//     // 2. Filter Size Boxes
//     const sizeBoxes = document.querySelectorAll('.size-box');
//     let firstVisibleBox = null;

//     sizeBoxes.forEach(box => {
//         const boxColor = box.dataset.color; // Read the data-color we added in EJS

//         if (boxColor === selectedColor) {
//             box.classList.remove('hidden'); // Show it
//             if (!firstVisibleBox) firstVisibleBox = box;
//             const newImage = box.dataset.image;
//             if (newImage) {
//                 changeImage(null, newImage); // Re-use your existing changeImage function
//             }
//         } else {
//             box.classList.add('hidden'); // Hide it
//             box.classList.remove('selected'); // Deselect if hidden
//         }
//     });

//     // 3. Optional: Auto-select the first available size for this color
//     // This helps user experience so they don't see a blank selection
//     if (firstVisibleBox) {
//         // Trigger the click logic for the first size
//         // (Assuming you stuck with the onclick refactor or event listeners, we simulate a click)
//         firstVisibleBox.click();
//     }

//     // 4. Update Thumbnails (Dynamic)
//     if (typeof variantImages !== 'undefined' && variantImages[selectedColor]) {
//         const images = variantImages[selectedColor];
//         const thumbnailContainer = document.querySelector('.thumbnails-column');

//         if (thumbnailContainer && images.length > 0) {
//             // Clear existing
//             thumbnailContainer.innerHTML = '';

//             // Create new
//             images.forEach((img, index) => {
//                 const thumbDiv = document.createElement('div');
//                 thumbDiv.className = `thumbnail-wrapper ${index === 2 ? 'active' : ''}`;
//                 thumbDiv.setAttribute('data-image', img);

//                 const imgTag = document.createElement('img');
//                 imgTag.src = `/uploads/variant-images/${img}`;
//                 imgTag.alt = "Thumbnail";

//                 thumbDiv.appendChild(imgTag);

//                 thumbDiv.addEventListener('click', function () {
//                     changeImage(this, img);
//                 });

//                 thumbnailContainer.appendChild(thumbDiv);
//             });

//             // Switch main image
//             changeImage(null, images[2]);
//         }
//     } else {
//         console.log("variantImages data missing or no images for color:", selectedColor);
//     }
// }

// // 4. Run on Page Load to allow only the initial color's sizes to show
// document.addEventListener('DOMContentLoaded', () => {
//     // Find the active color button and run the filter
//     const activeColorBtn = document.querySelector('.color-btn.active');
//     if (activeColorBtn) {
//         // We get the color text from the button
//         const color = activeColorBtn.textContent.trim();
//         filterByColor(activeColorBtn, color);
//     }

//     // ... any other existing DOMContentLoaded logic ...
// });
