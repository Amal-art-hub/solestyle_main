// Product Details Interactions

// Initial State
let currentStock = 0;

document.addEventListener('DOMContentLoaded', () => {
    // Zoom Effect
    const mainImgWrapper = document.querySelector('.main-image-wrapper');
    const mainImg = document.getElementById('mainImage');
    const lens = document.querySelector('.zoom-lens');

    if (mainImgWrapper && mainImg) {
        mainImgWrapper.addEventListener('mousemove', moveLens);
        mainImgWrapper.addEventListener('mouseenter', () => lens.style.display = 'block');
        mainImgWrapper.addEventListener('mouseleave', () => lens.style.display = 'none');
    }

    function moveLens(e) {
        const { left, top, width, height } = mainImgWrapper.getBoundingClientRect();
        const x = e.clientX - left;
        const y = e.clientY - top;

        // Position lens
        let lensX = x - lens.offsetWidth / 2;
        let lensY = y - lens.offsetHeight / 2;

        // Boundaries
        if (lensX < 0) lensX = 0;
        if (lensX > width - lens.offsetWidth) lensX = width - lens.offsetWidth;
        if (lensY < 0) lensY = 0;
        if (lensY > height - lens.offsetHeight) lensY = height - lens.offsetHeight;

        lens.style.left = lensX + 'px';
        lens.style.top = lensY + 'px';

        // Move background image in lens (zoom)
        const cx = mainImg.offsetWidth / lens.offsetWidth;
        const cy = mainImg.offsetHeight / lens.offsetHeight;

        lens.style.backgroundImage = `url('${mainImg.src}')`;
        lens.style.backgroundSize = `${mainImg.width * 2}px ${mainImg.height * 2}px`;
        lens.style.backgroundPosition = `-${lensX * 2}px -${lensY * 2}px`;
    }

    // Add Event Listeners for Thumbnails
    document.querySelectorAll('.thumbnail-wrapper').forEach(thumb => {
        thumb.addEventListener('click', function () {
            changeImage(this, this.dataset.image);
        });
    });

    // Add Event Listeners for Variants
    document.querySelectorAll('.size-box').forEach(box => {
        box.addEventListener('click', function () {
            // dataset properties are strings, so we parse if needed, though pure string is fine for display
            selectVariant(this.dataset.variantId, this.dataset.price, parseInt(this.dataset.stock));
        });
    });
});

// Change Main Image
function changeImage(element, imageName) {
    // Only try to update classes if an element was actually clicked
    if (element) {
        document.querySelectorAll('.thumbnail-wrapper').forEach(el => el.classList.remove('active'));
        element.classList.add('active');
    }

    // Update main image source
    const mainImg = document.getElementById('mainImage');
    mainImg.src = `/uploads/variant-images/${imageName}`;

    // Also update the Zoom Lens background
    const lens = document.querySelector('.zoom-lens');
    if (lens) {
        lens.style.backgroundImage = `url('/uploads/variant-images/${imageName}')`;
    }
}

// Select Variant
function selectVariant(variantId, price, stock) {
    // Update hidden input
    document.getElementById('selectedVariantId').value = variantId;

    // Update active UI
    document.querySelectorAll('.size-box').forEach(el => {
        el.classList.remove('selected');
        if (el.dataset.variantId === variantId) el.classList.add('selected');
    });

    // Update Price
    document.getElementById('displayPrice').textContent = price;

    // Update Stock Status
    const stockStatus = document.querySelector('.stock-status');
    currentStock = stock;

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

    // Update Images (optional - strict variant mapping)
    // Note: The thumbnail clicks already handle minor image changes.
    // If you want switching size to completely reset global images, you can render them here.
}

// Add to Cart
async function addToCart() {
    const variantId = document.getElementById('selectedVariantId').value;

    if (!variantId) {
        Swal.fire({
            icon: 'warning',
            title: 'Please select a size',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
        });
        return;
    }

    try {
        const response = await axios.post('/cart/add', {
            variantId,
            quantity: 1
        });

        if (response.data.success) {
            Swal.fire({
                icon: 'success',
                title: 'Added to Cart',
                text: 'Product has been added to your cart',
                showConfirmButton: false,
                timer: 1500
            });
            // Optional: Update cart count in header
        }
    } catch (error) {
        console.error(error);
        if (error.response && error.response.status === 401) {
            window.location.href = '/login';
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: error.response?.data?.message || 'Something went wrong!',
            });
        }
    }
}

function filterByColor(btnElement, selectedColor) {
    // 1. Update Active Color Button UI
    document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');

    // 2. Filter Size Boxes
    const sizeBoxes = document.querySelectorAll('.size-box');
    let firstVisibleBox = null;

    sizeBoxes.forEach(box => {
        const boxColor = box.dataset.color; // Read the data-color we added in EJS

        if (boxColor === selectedColor) {
            box.classList.remove('hidden'); // Show it
            if (!firstVisibleBox) firstVisibleBox = box;
            const newImage = box.dataset.image;
            if (newImage) {
                changeImage(null, newImage); // Re-use your existing changeImage function
            }
        } else {
            box.classList.add('hidden'); // Hide it
            box.classList.remove('selected'); // Deselect if hidden
        }
    });

    // 3. Optional: Auto-select the first available size for this color
    // This helps user experience so they don't see a blank selection
    if (firstVisibleBox) {
        // Trigger the click logic for the first size
        // (Assuming you stuck with the onclick refactor or event listeners, we simulate a click)
        firstVisibleBox.click();
    }

    // 4. Update Thumbnails (Dynamic)
    if (typeof variantImages !== 'undefined' && variantImages[selectedColor]) {
        const images = variantImages[selectedColor];
        const thumbnailContainer = document.querySelector('.thumbnails-column');

        if (thumbnailContainer && images.length > 0) {
            // Clear existing
            thumbnailContainer.innerHTML = '';

            // Create new
            images.forEach((img, index) => {
                const thumbDiv = document.createElement('div');
                thumbDiv.className = `thumbnail-wrapper ${index === 2 ? 'active' : ''}`;
                thumbDiv.setAttribute('data-image', img);

                const imgTag = document.createElement('img');
                imgTag.src = `/uploads/variant-images/${img}`;
                imgTag.alt = "Thumbnail";

                thumbDiv.appendChild(imgTag);

                thumbDiv.addEventListener('click', function () {
                    changeImage(this, img);
                });

                thumbnailContainer.appendChild(thumbDiv);
            });

            // Switch main image
            changeImage(null, images[2]);
        }
    } else {
        console.log("variantImages data missing or no images for color:", selectedColor);
    }
}

// 4. Run on Page Load to allow only the initial color's sizes to show
document.addEventListener('DOMContentLoaded', () => {
    // Find the active color button and run the filter
    const activeColorBtn = document.querySelector('.color-btn.active');
    if (activeColorBtn) {
        // We get the color text from the button
        const color = activeColorBtn.textContent.trim();
        filterByColor(activeColorBtn, color);
    }

    // ... any other existing DOMContentLoaded logic ...
});
