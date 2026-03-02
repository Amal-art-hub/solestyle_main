
/* exported addToCart, addToWishlist */

let currentStock = 0;

document.addEventListener("DOMContentLoaded", () => {
    // === 1. MAGNIFYING GLASS ZOOM ===
    const mainImgWrapper = document.querySelector(".main-image-wrapper");
    const mainImg = document.getElementById("mainImage");
    const lens = document.querySelector(".zoom-lens");
    const zoomLevel = 2; // 2x Zoom

    if (mainImgWrapper && mainImg && lens) {

        mainImgWrapper.addEventListener("mouseenter", () => {
            lens.style.display = "block";
            lens.style.backgroundImage = `url('${mainImg.src}')`;
            lens.style.backgroundSize = `${mainImg.scrollWidth * zoomLevel}px ${mainImg.scrollHeight * zoomLevel}px`;
        });

        mainImgWrapper.addEventListener("mouseleave", () => {
            lens.style.display = "none";
        });

        mainImgWrapper.addEventListener("mousemove", (e) => {
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

            lens.style.left = lensX + "px";
            lens.style.top = lensY + "px";

            // Move background in reverse to create zoom effect
            lens.style.backgroundPosition = `-${lensX * zoomLevel}px -${lensY * zoomLevel}px`;
        });
    }

    // === 2. THUMBNAIL CLICK ===
    document.querySelectorAll(".thumbnail-wrapper").forEach(thumb => {
        thumb.addEventListener("click", function () {
            changeImage(this, this.dataset.image);
        });
    });

    // === 3. VARIANT SELECTION (SIZE) ===
    document.querySelectorAll(".size-box").forEach(box => {
        box.addEventListener("click", function () {
            selectVariant(
                this.dataset.variantId,
                this.dataset.price,
                parseInt(this.dataset.stock),
                this.dataset.originalPrice,
                this.dataset.discount
            );
        });
    });

    // === 4. COLOR SELECTION (INITIAL) ===
    const activeColorBtn = document.querySelector(".color-btn.active");
    if (activeColorBtn) {
        filterByColor(activeColorBtn, activeColorBtn.textContent.trim());
    }
});

function changeImage(element, imageName) {
    if (element) {
        document.querySelectorAll(".thumbnail-wrapper").forEach(el => el.classList.remove("active"));
        element.classList.add("active");
    }

    const mainImg = document.getElementById("mainImage");
    const fullPath = imageName.startsWith("http") ? imageName : `/uploads/variant-images/${imageName}`;
    mainImg.src = fullPath;

    // Update Zoom Lens Background too
    const lens = document.querySelector(".zoom-lens");
    if (lens) {
        lens.style.backgroundImage = `url('${fullPath}')`;
    }
}

function selectVariant(variantId, price, stock, originalPrice, discount) {
    // 1. Update Hidden ID
    document.getElementById("selectedVariantId").value = variantId;

    // 2. Update Box Selection
    document.querySelectorAll(".size-box").forEach(el => {
        el.classList.remove("selected");
        if (el.dataset.variantId === variantId) el.classList.add("selected");
    });

    // 3. Update Price Display
    const displayPrice = document.getElementById("displayPrice");
    const displayOriginal = document.getElementById("displayOriginalPrice");
    const displayBadge = document.getElementById("displayBadge");

    // Always update current price
    displayPrice.textContent = price;

    if (discount > 0) {
        // --- SHOW OFFER ---
        displayPrice.parentElement.style.color = "#d9534f";

        if (displayOriginal) {
            displayOriginal.style.display = "inline";
            displayOriginal.textContent = "₹" + originalPrice;
        }
        if (displayBadge) {
            displayBadge.style.display = "inline-block";
            displayBadge.textContent = discount + "% OFF";
        }
    } else {
        // --- HIDE OFFER (Regular Price) ---
        displayPrice.parentElement.style.color = "#333";

        if (displayOriginal) displayOriginal.style.display = "none";
        if (displayBadge) displayBadge.style.display = "none";
    }

    // 4. Update Stock Status
    currentStock = stock;
    const stockStatus = document.querySelector(".stock-status");

    if (stock > 0) {
        stockStatus.className = "stock-status in-stock";
        stockStatus.textContent = "In Stock";
        document.querySelector(".btn-add-cart").disabled = false;
        document.querySelector(".btn-add-cart").style.opacity = "1";
    } else {
        stockStatus.className = "stock-status out-of-stock";
        stockStatus.textContent = "Out of Stock";
        document.querySelector(".btn-add-cart").disabled = true;
        document.querySelector(".btn-add-cart").style.opacity = "0.5";
    }
}

function filterByColor(btnElement, selectedColor) {
    document.querySelectorAll(".color-btn").forEach(btn => btn.classList.remove("active"));
    btnElement.classList.add("active");

    const sizeBoxes = document.querySelectorAll(".size-box");
    let firstVisibleBox = null;

    sizeBoxes.forEach(box => {
        if (box.dataset.color === selectedColor) {
            box.classList.remove("hidden");
            if (!firstVisibleBox) firstVisibleBox = box;
            const newImage = box.dataset.image;
            if (newImage) changeImage(null, newImage);
        } else {
            box.classList.add("hidden");
            box.classList.remove("selected");
        }
    });

    if (firstVisibleBox) firstVisibleBox.click();

    // Update Thumbnails
    if (typeof variantImages !== "undefined" && variantImages[selectedColor]) {
        const images = variantImages[selectedColor];
        const thumbnailContainer = document.querySelector(".thumbnails-column");
        if (thumbnailContainer && images.length > 0) {
            thumbnailContainer.innerHTML = "";
            images.forEach((img, index) => {
                const thumbDiv = document.createElement("div");
                thumbDiv.className = `thumbnail-wrapper ${index === 2 ? "active" : ""}`; // Default to 3rd img
                thumbDiv.setAttribute("data-image", img);
                const fullPath = img.startsWith("http") ? img : `/uploads/variant-images/${img}`;
                thumbDiv.innerHTML = `<img src="${fullPath}" alt="Thumbnail">`;
                thumbDiv.addEventListener("click", function () { changeImage(this, img); });
                thumbnailContainer.appendChild(thumbDiv);
            });
            const defaultImg = images[2] || images[0];
            changeImage(null, defaultImg);
        }
    }
}

async function addToCart() {
    const variantId = document.getElementById("selectedVariantId").value;
    if (!variantId) {
        Swal.fire({ icon: "warning", title: "Please select a size", toast: true, position: "top-end", showConfirmButton: false, timer: 3000 });
        return;
    }
    try {
        const response = await axios.post("/cart/add", { variantId, quantity: 1 });
        if (response.data.success) {
            Swal.fire({ icon: "success", title: "Added to Cart", showConfirmButton: false, timer: 1500 });
        }
    } catch (error) {
        if (error.response?.status === 401) window.location.href = "/login";
        else Swal.fire({ icon: "error", title: "Oops...", text: error.response?.data?.message || "Error" });
    }
}


/* Add this function at the bottom of public/js/user/productDetails.js */

async function addToWishlist(event) {
    // 1. Get IDs from Hidden Inputs (The "Better" Way)
    const variantId = document.getElementById("selectedVariantId").value;
    // NOTE: Make sure you added <input type="hidden" id="productId" value="<%= product._id %>"> in EJS
    const productId = document.getElementById("productId") ? document.getElementById("productId").value : null;

    // 2. Validation
    if (!variantId) {
        Swal.fire({
            icon: "warning",
            title: "Please select a size",
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000
        });
        return;
    }

    // Fallback if forgotten in EJS (Safety First!)
    if (!productId) {
        console.error("Product ID missing in EJS");
        return;
    }

    try {
        // 3. Send Request
        const response = await axios.post("/user/wishlist/add", {
            productId: productId,
            variantId: variantId
        });

        if (response.data.success) {
            // Update UI Instantly
            const icon = document.getElementById("wishlistIcon");
            if (icon) {
                icon.classList.remove("far");
                icon.classList.add("fas");
                icon.style.color = "red";
            }

            Swal.fire({
                icon: "success",
                title: "Added to Wishlist",
                showConfirmButton: false,
                timer: 1500
            });
        } else {
            // If "Item already in wishlist"
            Swal.fire({
                icon: "info",
                title: "Info",
                text: response.data.message
            });
        }
    } catch (error) {
        if (error.response && error.response.status === 401) {
            // Not logged in -> Go to login
            window.location.href = "/login";
        } else {
            console.error(error);
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: error.response?.data?.message || "Error adding to wishlist"
            });
        }
    }
}


async function buyNow() {
    const variantId = document.getElementById("selectedVariantId").value;
    if (!variantId) {
        Swal.fire({ icon: "warning", title: "Please select a size", toast: true, position: "top-end", showConfirmButton: false, timer: 3000 });
        return;
    }

    try {
        // Step 1: Add to cart
        const response = await axios.post("/cart/add", { variantId, quantity: 1 });

        if (response.data.success) {
            // Step 2: Redirect to checkout on success
            window.location.href = "/checkout";
        }
    } catch (error) {
        if (error.response?.status === 401) {
            window.location.href = "/login";
        } else {
            Swal.fire({
                icon: "error",
                title: "Wait...",
                text: error.response?.data?.message || "Something went wrong"
            });
        }
    }
}




























