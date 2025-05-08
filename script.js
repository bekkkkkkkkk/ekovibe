const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    const container = canvas.parentElement;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    const imgWidth = baseImage.naturalWidth;
    const imgHeight = baseImage.naturalHeight;
    
    let canvasWidth, canvasHeight;
    
    const containerRatio = containerWidth / containerHeight;
    const imageRatio = imgWidth / imgHeight;
    
    if (imageRatio > containerRatio) {
        canvasWidth = containerWidth;
        canvasHeight = containerWidth / imageRatio;
    } else {
        canvasHeight = containerHeight;
        canvasWidth = containerHeight * imageRatio;
    }
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    drawBaseImage();
}

const galleryImages = [
    'assets/eko.png',
    'assets/muscular-eko.jpeg',
    'assets/romanian-eko.jpeg',
    'assets/summer-calling-eko.jpeg',
    'assets/super-eko.jpeg',
    'assets/winner-eko.jpeg'
];
let selectedBaseIndex = 0;

function renderGallery() {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = '';
    galleryImages.forEach((src, idx) => {
        const img = document.createElement('img');
        img.src = src;
        img.className = 'gallery-img' + (idx === selectedBaseIndex ? ' selected' : '');
        img.alt = 'Base ' + (idx + 1);
        img.addEventListener('click', () => {
            selectedBaseIndex = idx;
            baseImage.src = src;
            renderGallery();
        });
        gallery.appendChild(img);
    });
}

const baseImage = new Image();
baseImage.src = galleryImages[selectedBaseIndex];
baseImage.onload = () => {
    resizeCanvas();
};

function drawBaseImage(showHandles = true) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
    
    drawCustomText();
    drawUploadedImage(showHandles);
}

let customText = '';
let textPosition = null;
let isTextDragging = false;
let textDragOffset = { x: 0, y: 0 };

let uploadedImage = null;
let imagePosition = { x: 0, y: 0 };
let imageScale = 1;
let isImageDragging = false;
let dragStart = { x: 0, y: 0 };
let isImageResizing = false;
let resizeStart = { x: 0, y: 0 };
let initialScale = 1;
const IMAGE_SIZE = 100;
const RESIZE_HANDLE_SIZE = 24;

function drawCustomText() {
    if (!customText) return;
    ctx.font = '24px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    let pos = textPosition || { x: canvas.width / 2, y: canvas.height - 30 };
    ctx.fillText(customText, pos.x, pos.y);
}

function drawUploadedImage(showHandles = true) {
    if (!uploadedImage) return;
    const w = IMAGE_SIZE * imageScale;
    const h = IMAGE_SIZE * imageScale;
    ctx.drawImage(uploadedImage, imagePosition.x, imagePosition.y, w, h);
    if (showHandles) {
        const handleX = imagePosition.x + w - RESIZE_HANDLE_SIZE;
        const handleY = imagePosition.y + h - RESIZE_HANDLE_SIZE;
        ctx.save();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#111';
        ctx.fillStyle = '#fff';
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.rect(handleX, handleY, RESIZE_HANDLE_SIZE, RESIZE_HANDLE_SIZE);
        ctx.fill();
        ctx.stroke();
        ctx.font = '18px Arial';
        ctx.fillStyle = '#111';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('↘', handleX + RESIZE_HANDLE_SIZE / 2, handleY + RESIZE_HANDLE_SIZE / 2 + 1);
        ctx.restore();
    }
}

function isOnText(x, y) {
    let pos = textPosition || { x: canvas.width / 2, y: canvas.height - 30 };
    return (
        x >= pos.x - 60 && x <= pos.x + 60 &&
        y >= pos.y - 24 && y <= pos.y + 8
    );
}

function isOnImage(x, y) {
    const w = IMAGE_SIZE * imageScale;
    const h = IMAGE_SIZE * imageScale;
    return (
        uploadedImage &&
        x >= imagePosition.x && x <= imagePosition.x + w &&
        y >= imagePosition.y && y <= imagePosition.y + h
    );
}

function isOnResizeHandle(x, y) {
    const w = IMAGE_SIZE * imageScale;
    const h = IMAGE_SIZE * imageScale;
    return (
        x >= imagePosition.x + w - RESIZE_HANDLE_SIZE &&
        x <= imagePosition.x + w &&
        y >= imagePosition.y + h - RESIZE_HANDLE_SIZE &&
        y <= imagePosition.y + h
    );
}

function handleMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (isOnText(x, y)) {
        isTextDragging = true;
        let pos = textPosition || { x: canvas.width / 2, y: canvas.height - 30 };
        textDragOffset = { x: x - pos.x, y: y - pos.y };
    } else if (isOnResizeHandle(x, y)) {
        isImageResizing = true;
        resizeStart = { x, y };
        initialScale = imageScale;
    } else if (isOnImage(x, y)) {
        isImageDragging = true;
        dragStart = { x: x - imagePosition.x, y: y - imagePosition.y };
    }
}

function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (isTextDragging) {
        textPosition = { x: x - textDragOffset.x, y: y - textDragOffset.y };
        drawBaseImage();
    } else if (isImageDragging) {
        imagePosition.x = x - dragStart.x;
        imagePosition.y = y - dragStart.y;
        drawBaseImage();
    } else if (isImageResizing) {
        const dx = x - (imagePosition.x + IMAGE_SIZE * imageScale);
        let newScale = initialScale + dx / IMAGE_SIZE;
        if (newScale < 0.2) newScale = 0.2;
        if (newScale > 5) newScale = 5;
        imageScale = newScale;
        drawBaseImage();
    }
}

function handleMouseUp() {
    isTextDragging = false;
    isImageDragging = false;
    isImageResizing = false;
}

function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    if (isOnText(x, y)) {
        isTextDragging = true;
        let pos = textPosition || { x: canvas.width / 2, y: canvas.height - 30 };
        textDragOffset = { x: x - pos.x, y: y - pos.y };
    } else if (isOnResizeHandle(x, y)) {
        isImageResizing = true;
        resizeStart = { x, y };
        initialScale = imageScale;
    } else if (isOnImage(x, y)) {
        isImageDragging = true;
        dragStart = { x: x - imagePosition.x, y: y - imagePosition.y };
    }
    if (e.touches.length === 2 && uploadedImage) {
        isImageResizing = true;
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        resizeStart = { dist };
        initialScale = imageScale;
    }
}

function handleTouchMove(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    if (isTextDragging && e.touches.length === 1) {
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        textPosition = { x: x - textDragOffset.x, y: y - textDragOffset.y };
        drawBaseImage();
    } else if (isImageDragging && e.touches.length === 1) {
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        imagePosition.x = x - dragStart.x;
        imagePosition.y = y - dragStart.y;
        drawBaseImage();
    } else if (isImageResizing && e.touches.length === 2) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        let newScale = initialScale * (dist / resizeStart.dist);
        if (newScale < 0.2) newScale = 0.2;
        if (newScale > 5) newScale = 5;
        imageScale = newScale;
        drawBaseImage();
    } else if (isImageResizing && e.touches.length === 1) {
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const dx = x - (imagePosition.x + IMAGE_SIZE * imageScale);
        let newScale = initialScale + dx / IMAGE_SIZE;
        if (newScale < 0.2) newScale = 0.2;
        if (newScale > 5) newScale = 5;
        imageScale = newScale;
        drawBaseImage();
    }
}

function handleTouchEnd(e) {
    e.preventDefault();
    isTextDragging = false;
    isImageDragging = false;
    isImageResizing = false;
}

canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mouseup', handleMouseUp);
canvas.addEventListener('mouseleave', handleMouseUp);

canvas.addEventListener('touchstart', handleTouchStart);
canvas.addEventListener('touchmove', handleTouchMove);
canvas.addEventListener('touchend', handleTouchEnd);

document.getElementById('addText').addEventListener('click', () => {
    customText = document.getElementById('customText').value;
    if (!textPosition) {
        textPosition = { x: canvas.width / 2, y: canvas.height - 30 };
    }
    drawBaseImage();
});

document.getElementById('imageUpload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            uploadedImage = new Image();
            uploadedImage.src = event.target.result;
            uploadedImage.onload = () => {
                imagePosition = {
                    x: (canvas.width - IMAGE_SIZE) / 2,
                    y: (canvas.height - IMAGE_SIZE) / 2
                };
                imageScale = 1;
                drawBaseImage();
            };
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('downloadBtn').addEventListener('click', () => {
    drawBaseImage(false);
    const link = document.createElement('a');
    link.download = 'eko-vibe-canvas.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    drawBaseImage(true);
});

window.addEventListener('resize', resizeCanvas);

canvas.addEventListener('mousemove', function(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (isOnResizeHandle(x, y)) {
        canvas.style.cursor = 'nwse-resize';
    } else if (isOnText(x, y)) {
        canvas.style.cursor = 'move';
    } else if (isOnImage(x, y)) {
        canvas.style.cursor = 'grab';
    } else {
        canvas.style.cursor = 'default';
    }
});

window.addEventListener('DOMContentLoaded', renderGallery); 