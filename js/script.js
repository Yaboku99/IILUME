"use strict";

/* =========================================================
   NAVEGAÇÃO ENTRE TELAS
   Câmera -> Galeria -> Editor -> Galeria
   ========================================================= */
const welcomeScreen = document.getElementById("welcome-screen");
const studioScreen = document.getElementById("studio-screen");
const cameraScreen = document.getElementById("camera_screen");
const galleryScreen = document.getElementById("gallery_screen");
const editorScreen = document.getElementById("editor_screen");
const aiScreen = document.getElementById("ai_screen");
const aiEditorBackButton = document.getElementById("ai-editor-back");

const startButton = document.getElementById("start-button");
const studioCameraButton = document.getElementById("camera-button");
const studioMainCameraButton = document.getElementById("main-camera-button");
const studioGalleryButton = document.getElementById("gallery-button");
const studioGalleryNav = document.getElementById("studio-gallery-nav");
const studioSeeAllButton = document.getElementById("see-all-button");
const studioCreateNav = document.getElementById("studio-create-nav");
const imageInput = document.getElementById("image-input");

const editButton = document.getElementById("edit_button");
const galleryBackButton = document.getElementById("gallery-back-button");
const editorBackButton = document.getElementById("editor-back-button");
const editorStudioButton = document.getElementById("editor-studio-button");
const cameraGalleryButton = document.getElementById("cam-gallery-thumb");

const allScreens = [welcomeScreen, studioScreen, cameraScreen, galleryScreen, editorScreen, aiScreen].filter(Boolean);
let currentScreen = "welcome";
let galleryReturnScreen = "studio";
let editorReturnScreen = "gallery";


if (aiEditorBackButton) {
    aiEditorBackButton.addEventListener("click", () => {
        showScreen("editor");
    });
}

function showScreen(name) {
    const screens = {
        welcome: welcomeScreen,
        studio: studioScreen,
        camera: cameraScreen,
        gallery: galleryScreen,
        editor: editorScreen,
        ai: aiScreen
    };
    const target = screens[name];
    if (!target) return;

    allScreens.forEach((screen) => screen.classList.remove("active"));
    target.classList.add("active");
    currentScreen = name;

    if (name === "camera") {
        // A câmera só pede permissão quando realmente é aberta.
        initCamera();
    }

    if (name === "editor") {
        closeEditorModals();
    }

    if (name === "studio") {
        renderStudioCreations();
    }
}

/* =========================================================
   GALERIA
   ========================================================= */
let galleryPhotos = [
    { name: "foto1.jpg", src: "assets/images/gallery/foto1.jpg", favorite: false },
    { name: "foto2.jpg", src: "assets/images/gallery/foto2.jpg", favorite: false },
    { name: "foto3.jpg", src: "assets/images/gallery/foto3.jpg", favorite: false },
    { name: "foto4.jpg", src: "assets/images/gallery/foto4.jpg", favorite: false }
];
let currentPhotoIndex = 0;

const mainImage = document.getElementById("main_image");
const thumbnailContainer = document.getElementById("thumbnail_container");
const favoriteButton = document.getElementById("favorite_button");
const heartIcon = document.getElementById("heart_icon");
const infoButton = document.getElementById("info_button");
const shareButton = document.getElementById("share_button");
const deleteButton = document.getElementById("delete_button");
const photoInfo = document.getElementById("photo_info");
const photoName = document.getElementById("photo_name");
const galleryEmptyState = document.getElementById("gallery-empty-state");

function createFallbackDataUrl(index) {
    const palettes = [
        ["#081b22", "#0e6f82"],
        ["#100b2c", "#6842a8"],
        ["#1d0d18", "#aa3d72"],
        ["#081321", "#2955a6"]
    ];
    const [a, b] = palettes[index % palettes.length];
    const safeText = encodeURIComponent(`IILUME • ${index + 1}`);
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000">
            <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
            <rect width="800" height="1000" fill="url(#g)"/>
            <circle cx="620" cy="240" r="170" fill="rgba(255,255,255,.09)"/>
            <circle cx="170" cy="760" r="220" fill="rgba(0,240,255,.10)"/>
            <text x="400" y="510" fill="white" opacity=".8" font-family="Arial" font-size="42" text-anchor="middle">${safeText}</text>
        </svg>
    `)}`;
}

function useImageFallback(img, index) {
    if (img.dataset.fallbackApplied === "1") return;
    img.dataset.fallbackApplied = "1";
    img.src = createFallbackDataUrl(index);
}

function renderThumbnails() {
    thumbnailContainer.innerHTML = "";

    galleryPhotos.forEach((photo, index) => {
        const image = document.createElement("img");
        image.src = photo.src;
        image.alt = photo.name;
        image.className = "thumbnail" + (index === currentPhotoIndex ? " active" : "");
        image.addEventListener("error", () => useImageFallback(image, index), { once: true });
        image.addEventListener("click", () => selectPhoto(index));
        thumbnailContainer.appendChild(image);
    });
}

function selectPhoto(index) {
    if (!galleryPhotos.length) {
        currentPhotoIndex = 0;
        mainImage.removeAttribute("src");
        mainImage.classList.add("d-none");
        galleryEmptyState.classList.remove("d-none");
        photoName.textContent = "Nenhuma imagem";
        return;
    }

    currentPhotoIndex = Math.max(0, Math.min(index, galleryPhotos.length - 1));
    const photo = galleryPhotos[currentPhotoIndex];

    mainImage.classList.remove("d-none");
    galleryEmptyState.classList.add("d-none");
    mainImage.src = photo.src;
    mainImage.dataset.photoIndex = String(currentPhotoIndex);
    mainImage.onerror = () => useImageFallback(mainImage, currentPhotoIndex);
    photoName.textContent = photo.name;

    updateFavorite();
    renderThumbnails();
}

function toggleFavorite() {
    if (!galleryPhotos.length) return;
    galleryPhotos[currentPhotoIndex].favorite = !galleryPhotos[currentPhotoIndex].favorite;
    updateFavorite();
}

function updateFavorite() {
    const photo = galleryPhotos[currentPhotoIndex];
    const active = Boolean(photo && photo.favorite);
    favoriteButton.classList.toggle("favorite-active", active);
    heartIcon.setAttribute("fill", active ? "currentColor" : "none");
}

function toggleInfo() {
    photoInfo.classList.toggle("hidden");
}

async function sharePhoto() {
    if (!galleryPhotos.length) return;
    const photo = galleryPhotos[currentPhotoIndex];

    if (navigator.share) {
        try {
            await navigator.share({ title: "IILUME", text: photo.name });
            return;
        } catch (error) {
            // Cancelamento do compartilhamento não deve quebrar a tela.
        }
    }
    alert("Compartilhamento simulado!\n\n" + photo.name);
}

function updateCameraGalleryThumb() {
    if (!thumbImg) return;

    if (!galleryPhotos.length) {
        thumbImg.removeAttribute("src");
        thumbImg.classList.add("d-none");
        return;
    }

    const lastIndex = galleryPhotos.length - 1;
    const lastPhoto = galleryPhotos[lastIndex];

    thumbImg.src = lastPhoto.src;
    thumbImg.alt = `Última foto: ${lastPhoto.name}`;
    thumbImg.classList.remove("d-none");
    thumbImg.onerror = () => useImageFallback(thumbImg, lastIndex);
}

function deletePhoto() {
    if (!galleryPhotos.length) return;

    const photo = galleryPhotos[currentPhotoIndex];
    if (!confirm("Deseja excluir " + photo.name + "?")) return;

    galleryPhotos.splice(currentPhotoIndex, 1);
    if (currentPhotoIndex >= galleryPhotos.length) currentPhotoIndex = galleryPhotos.length - 1;
    selectPhoto(Math.max(0, currentPhotoIndex));
    updateCameraGalleryThumb();
}

favoriteButton.addEventListener("click", toggleFavorite);
infoButton.addEventListener("click", toggleInfo);
shareButton.addEventListener("click", sharePhoto);
deleteButton.addEventListener("click", deletePhoto);
galleryBackButton.addEventListener("click", () => {
    closeGalleryInfo();
    showScreen(galleryReturnScreen);
});

/* =========================================================
   CÂMERA
   ========================================================= */
const videoEl = document.getElementById("cam-stream");
const fallbackEl = document.getElementById("cam-fallback");
const btnShutter = document.getElementById("cam-btn-shutter");
const btnFlash = document.getElementById("cam-btn-flash");
const btnStudio = document.getElementById("cam-btn-studio");
const iconFlash = document.getElementById("cam-icon-flash");
const flashOverlay = document.getElementById("cam-flash-overlay");
const shutterFlash = document.getElementById("cam-shutter-flash");
const shutterIconFlash = document.getElementById("cam-shutter-icon-flash");
const btnGrid = document.getElementById("cam-btn-grid");
const gridEl = document.getElementById("cam-grid");
const btnFlip = document.getElementById("cam-btn-flip");
const iconType = document.getElementById("cam-icon-type");
const textType = document.getElementById("cam-text-type");
const orientationTag = document.getElementById("cam-orientation-tag");
const thumbImg = document.getElementById("cam-thumb-img");
const zoomTrigger = document.getElementById("cam-zoom-trigger");
const zoomTriggerText = document.getElementById("cam-zoom-trigger-text");
const zoomClose = document.getElementById("cam-zoom-close");
const dialContainer = document.getElementById("cam-dial");
const dialTicks = document.getElementById("cam-dial-ticks");
const dialContent = document.getElementById("cam-dial-content");
const lensItems = document.querySelectorAll(".cam-lens-item");

let currentStream = null;
let facingMode = "environment";
let isFlashOn = false;
let currentAngle = 0;
let isDragging = false;
let startX = 0;
let startAngle = 0;

const imgTraseira = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80";
const imgFrontal = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80";

function renderTicks() {
    if (!dialTicks) return;
    dialTicks.innerHTML = "";
    const total = 35;
    const step = 100 / (total - 1);

    for (let i = 0; i < total; i++) {
        const angle = -50 + i * step;
        const rad = (angle - 90) * (Math.PI / 180);
        const rInner = 165;
        const rOuter = i % 5 === 0 ? 180 : 173;
        const x1 = 200 + rInner * Math.cos(rad);
        const y1 = 200 + rInner * Math.sin(rad);
        const x2 = 200 + rOuter * Math.cos(rad);
        const y2 = 200 + rOuter * Math.sin(rad);

        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);
        line.setAttribute("stroke-width", i % 5 === 0 ? "2" : "1");
        dialTicks.appendChild(line);
    }
}

function updateZoom(angle) {
    currentAngle = Math.max(-35, Math.min(35, angle));
    dialTicks.setAttribute("transform", `rotate(${currentAngle},200,200)`);
    dialContent.style.transform = `rotate(${currentAngle}deg)`;

    let closest = "26mm";
    let zoomText = "1x";
    if (currentAngle > 15) {
        closest = "13mm";
        zoomText = "0,5x";
    } else if (currentAngle < -15) {
        closest = "77mm";
        zoomText = "3x";
    }

    zoomTriggerText.textContent = zoomText;
    lensItems.forEach((item) => item.classList.toggle("active", item.dataset.lens === closest));
    videoEl.classList.remove("cam-zoom-13mm", "cam-zoom-26mm", "cam-zoom-77mm");
    videoEl.classList.add(`cam-zoom-${closest}`);

    // Mantém a mesma escala na imagem de demonstração quando a webcam não está disponível.
    if (fallbackEl) {
        fallbackEl.classList.remove("cam-zoom-13mm", "cam-zoom-26mm", "cam-zoom-77mm");
        fallbackEl.classList.add(`cam-zoom-${closest}`);
    }
}

zoomTrigger.addEventListener("click", () => {
    dialContainer.classList.remove("cam-dial-hidden");
    zoomTrigger.classList.add("d-none");
});
zoomClose.addEventListener("click", () => {
    dialContainer.classList.add("cam-dial-hidden");
    zoomTrigger.classList.remove("d-none");
});
dialContainer.addEventListener("wheel", (event) => {
    event.preventDefault();
    updateZoom(currentAngle + (event.deltaY > 0 ? -5 : 5));
}, { passive:false });
dialContainer.addEventListener("mousedown", (event) => {
    isDragging = true;
    startX = event.clientX;
    startAngle = currentAngle;
});
window.addEventListener("mousemove", (event) => {
    if (isDragging) updateZoom(startAngle + (event.clientX - startX) * .25);
});
window.addEventListener("mouseup", () => { isDragging = false; });
dialContainer.addEventListener("touchstart", (event) => {
    isDragging = true;
    startX = event.touches[0].clientX;
    startAngle = currentAngle;
}, { passive:true });
dialContainer.addEventListener("touchmove", (event) => {
    if (isDragging) updateZoom(startAngle + (event.touches[0].clientX - startX) * .25);
}, { passive:true });
dialContainer.addEventListener("touchend", () => { isDragging = false; });
lensItems.forEach((item) => {
    item.addEventListener("click", () => updateZoom(-parseFloat(item.dataset.angle)));
});

function showCameraFallback() {
    const demoImage = facingMode === "environment" ? imgTraseira : imgFrontal;
    fallbackEl.style.backgroundImage = `url("${demoImage}")`;
    fallbackEl.style.display = "block";
    fallbackEl.setAttribute("aria-hidden", "false");
    videoEl.srcObject = null;
    videoEl.style.opacity = "0";
}

async function initCamera() {
    if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
        currentStream = null;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showCameraFallback();
        return;
    }

    try {
        currentStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode, width: { ideal:1280 }, height:{ ideal:720 } },
            audio:false
        });
        videoEl.srcObject = currentStream;
        videoEl.style.opacity = "1";
        fallbackEl.style.display = "none";
    } catch (error) {
        showCameraFallback();
    }
}

async function alternarCameraFrontalTraseira() {
    const icon = btnFlip?.querySelector("i");
    icon?.classList.add("cam-spin-icon");
    setTimeout(() => icon?.classList.remove("cam-spin-icon"), 500);

    videoEl?.classList.add("cam-flip-anim");
    setTimeout(() => videoEl?.classList.remove("cam-flip-anim"), 500);

    facingMode = facingMode === "environment" ? "user" : "environment";
    if (facingMode === "user") {
        textType.textContent = "FRONTAL";
        iconType.className = "bi bi-person-bounding-box";
        if (orientationTag) orientationTag.textContent = "FRONTAL";
    } else {
        textType.textContent = "TRASEIRA";
        iconType.className = "bi bi-camera-fill";
        if (orientationTag) orientationTag.textContent = "TRASEIRA";
    }
    await initCamera();
}

btnFlip?.addEventListener("click", () => {
    if (portraitMode && !portraitMode.classList.contains("portrait-show")) {
        openPortraitMode();
    } else {
        closePortraitMode();
    }
});

function addCapturedPhoto(dataUrl) {
    const captureNumber = galleryPhotos.filter((photo) => photo.captured).length + 1;
    const photo = {
        name: `captura-${String(captureNumber).padStart(2, "0")}.png`,
        src: dataUrl,
        favorite:false,
        captured:true
    };
    galleryPhotos.push(photo);
    selectPhoto(galleryPhotos.length - 1);
    updateCameraGalleryThumb();
    renderStudioCreations();
}

btnShutter.addEventListener("click", () => {
    shutterFlash.classList.remove("active");
    void shutterFlash.offsetWidth;
    shutterFlash.classList.add("active");
    shutterIconFlash.classList.remove("d-none");
    setTimeout(() => shutterIconFlash.classList.add("d-none"), 350);

    const canvas = document.createElement("canvas");
    canvas.width = videoEl.videoWidth || 640;
    canvas.height = videoEl.videoHeight || 480;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;
    if (facingMode === "user") {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
    }

    if (videoEl.readyState >= 2 && videoEl.videoWidth) {
        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
    } else {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, "#0a2028");
        gradient.addColorStop(1, "#2d145d");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgba(255,255,255,.8)";
        ctx.font = "bold 28px Arial";
        ctx.textAlign = "center";
        ctx.fillText("IILUME", canvas.width / 2, canvas.height / 2);
    }

    addCapturedPhoto(canvas.toDataURL("image/png"));
});

function updateFlashButton() {
    if (!iconFlash || !btnFlash) return;
    iconFlash.className = "cam-flash-symbol";
    btnFlash.classList.toggle("flash-active", isFlashOn);
    btnFlash.setAttribute("aria-label", isFlashOn ? "Desativar flash" : "Ativar flash");
    btnFlash.title = isFlashOn ? "Flash ativado" : "Flash desativado";
}

btnFlash.addEventListener("click", () => {
    isFlashOn = !isFlashOn;
    updateFlashButton();
    flashOverlay.classList.toggle("active", isFlashOn);
    document.getElementById("portraitFlashBtn")?.classList.toggle("portrait-active", isFlashOn);
});
btnGrid.addEventListener("click", () => {
    gridEl.classList.toggle("d-none");
    btnGrid.classList.toggle("text-info");
});

if (btnStudio) {
    btnStudio.addEventListener("click", () => {
        showScreen("studio");
    });
}

cameraGalleryButton.addEventListener("click", () => {
    closeGalleryInfo();
    if (galleryPhotos.length) {
        currentPhotoIndex = galleryPhotos.length - 1;
        selectPhoto(currentPhotoIndex);
    }
    galleryReturnScreen = "camera";
    showScreen("gallery");
});

/* =========================================================
   EDITOR — integração com a foto selecionada na galeria
   ========================================================= */
let imagemAtual = null;
let rotacaoAtual = 0;
let filtroAtual = "none";
let nivelZoom = 100;
let selectedEditorVersion = null;

function resetEditorState() {
    rotacaoAtual = 0;
    filtroAtual = "none";
    nivelZoom = 100;
    updateEditorZoomText();
}

function carregarImagem(src) {
    if (typeof src !== "string") {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.addEventListener("change", (event) => {
            const arquivo = event.target.files?.[0];
            if (!arquivo) return;
            const leitor = new FileReader();
            leitor.onload = (e) => mostrarImagem(e.target.result);
            leitor.readAsDataURL(arquivo);
        });
        input.click();
        return;
    }
    mostrarImagem(src);
}

function mostrarImagem(src) {
    const container = document.getElementById("editor-image-container");
    if (!container) return;

    container.innerHTML = "";
    const imagem = document.createElement("img");
    imagem.src = src;
    imagem.id = "imagem-editavel";
    imagem.alt = "Imagem selecionada para edição";
    imagem.style.maxWidth = "100%";
    imagem.style.maxHeight = "300px";
    imagem.style.objectFit = "contain";
    imagem.style.transition = ".3s";
    container.appendChild(imagem);

    imagemAtual = imagem;
    resetEditorState();
    updateImageTransform();
}

function updateImageTransform() {
    if (!imagemAtual) return;
    imagemAtual.style.transform = `rotate(${rotacaoAtual}deg) scale(${nivelZoom / 100})`;
    imagemAtual.style.filter = filtroAtual;
}

function updateEditorZoomText() {
    const value = document.getElementById("valor-zoom");
    if (value) value.textContent = `${nivelZoom}%`;
}

function aumentarZoom() {
    if (!imagemAtual) { carregarImagem(); return; }
    if (nivelZoom < 200) { nivelZoom += 10; updateImageTransform(); updateEditorZoomText(); }
}
function diminuirZoom() {
    if (!imagemAtual) { carregarImagem(); return; }
    if (nivelZoom > 50) { nivelZoom -= 10; updateImageTransform(); updateEditorZoomText(); }
}

function createModal(title, html) {
    closeEditorModals();
    const wrapper = document.createElement("div");
    wrapper.className = "editor-modal";
    wrapper.innerHTML = `<div class="editor-modal-card"><h2>${title}</h2>${html}</div>`;
    document.body.appendChild(wrapper);
    return wrapper;
}

function closeEditorModals() {
    document.querySelectorAll(".editor-modal").forEach((modal) => modal.remove());
}

function cortar() {
    if (!imagemAtual) { carregarImagem(); return; }

    const container = document.getElementById("editor-image-container");
    const rect = imagemAtual.getBoundingClientRect();
    const box = document.createElement("div");
    box.id = "area-corte";
    Object.assign(box.style, {
        position:"absolute", top:"20%", left:"15%", width:"70%", height:"60%",
        border:"2px solid #c13cff", boxShadow:"0 0 0 9999px rgba(0,0,0,.45)",
        zIndex:"20", cursor:"crosshair"
    });
    ["nw","ne","sw","se"].forEach((position) => {
        const handle = document.createElement("span");
        handle.className = "crop-handle";
        Object.assign(handle.style, { position:"absolute", width:"14px", height:"14px", borderRadius:"50%", background:"#c13cff", border:"2px solid #fff" });
        if (position.includes("n")) handle.style.top = "-7px";
        if (position.includes("s")) handle.style.bottom = "-7px";
        if (position.includes("w")) handle.style.left = "-7px";
        if (position.includes("e")) handle.style.right = "-7px";
        box.appendChild(handle);
    });
    container.appendChild(box);

    const controls = document.createElement("div");
    controls.style.cssText = "position:absolute;left:50%;bottom:12px;transform:translateX(-50%);z-index:30;display:flex;gap:8px;";
    controls.innerHTML = `<button class="modal-btn" id="cancelar-corte" type="button">Cancelar</button><button class="modal-primary" id="aplicar-corte" type="button" style="margin-top:0">✓ Cortar</button>`;
    container.appendChild(controls);

    controls.querySelector("#cancelar-corte").onclick = () => { box.remove(); controls.remove(); };
    controls.querySelector("#aplicar-corte").onclick = () => {
        const cropRect = box.getBoundingClientRect();
        const imageRect = imagemAtual.getBoundingClientRect();
        const scaleX = imagemAtual.naturalWidth / imageRect.width;
        const scaleY = imagemAtual.naturalHeight / imageRect.height;
        const x = Math.max(0, (cropRect.left - imageRect.left) * scaleX);
        const y = Math.max(0, (cropRect.top - imageRect.top) * scaleY);
        const width = Math.min(cropRect.width * scaleX, imagemAtual.naturalWidth - x);
        const height = Math.min(cropRect.height * scaleY, imagemAtual.naturalHeight - y);
        if (width <= 1 || height <= 1) { alert("Posicione a área de corte sobre a imagem."); return; }

        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(width));
        canvas.height = Math.max(1, Math.round(height));
        const ctx = canvas.getContext("2d");
        ctx.drawImage(imagemAtual, x, y, width, height, 0, 0, canvas.width, canvas.height);
        imagemAtual.src = canvas.toDataURL("image/png");
        box.remove(); controls.remove();
    };
}

function rotacionar() {
    if (!imagemAtual) { carregarImagem(); return; }
    const modal = createModal("🔄 Rotacionar imagem", `<div class="modal-grid"><button class="modal-btn" id="girar-esquerda" type="button">↶ Esquerda</button><button class="modal-btn" id="girar-direita" type="button">↷ Direita</button><button class="modal-btn" id="girar-180" type="button">↻ 180°</button><button class="modal-btn" id="resetar-rotacao" type="button">↺ Resetar</button></div><button class="modal-primary" id="fechar-rotacao" type="button">✓ Aplicar e fechar</button>`);
    modal.querySelector("#girar-esquerda").onclick = () => { rotacaoAtual -= 90; updateImageTransform(); };
    modal.querySelector("#girar-direita").onclick = () => { rotacaoAtual += 90; updateImageTransform(); };
    modal.querySelector("#girar-180").onclick = () => { rotacaoAtual += 180; updateImageTransform(); };
    modal.querySelector("#resetar-rotacao").onclick = () => { rotacaoAtual = 0; updateImageTransform(); };
    modal.querySelector("#fechar-rotacao").onclick = closeEditorModals;
}

function ajustar() {
    if (!imagemAtual) { carregarImagem(); return; }
    const modal = createModal("✨ Ajustes da imagem", `<label>☀️ Brilho: <strong id="valor-brilho">100%</strong></label><input id="slider-brilho" type="range" min="50" max="150" value="100" style="width:100%;margin:8px 0 16px"><label>◐ Contraste: <strong id="valor-contraste">100%</strong></label><input id="slider-contraste" type="range" min="50" max="150" value="100" style="width:100%;margin:8px 0"><button class="modal-primary" id="fechar-ajustes" type="button">✓ Aplicar ajustes</button>`);
    const brightness = modal.querySelector("#slider-brilho");
    const contrast = modal.querySelector("#slider-contraste");
    function updateAdjustments() {
        modal.querySelector("#valor-brilho").textContent = brightness.value + "%";
        modal.querySelector("#valor-contraste").textContent = contrast.value + "%";
        filtroAtual = `brightness(${brightness.value}%) contrast(${contrast.value}%)`;
        updateImageTransform();
    }
    brightness.addEventListener("input", updateAdjustments);
    contrast.addEventListener("input", updateAdjustments);
    modal.querySelector("#fechar-ajustes").onclick = closeEditorModals;
}

function aplicarFiltro() {
    if (!imagemAtual) { carregarImagem(); return; }
    const modal = createModal("✨ Filtros da imagem", `<div class="modal-grid"><button class="modal-btn filtro-opcao" data-filtro="none" type="button">🖼️ Original</button><button class="modal-btn filtro-opcao" data-filtro="grayscale(100%)" type="button">⚫ Preto e branco</button><button class="modal-btn filtro-opcao" data-filtro="sepia(100%)" type="button">🟤 Sépia</button><button class="modal-btn filtro-opcao" data-filtro="contrast(150%)" type="button">◐ Contraste</button><button class="modal-btn filtro-opcao" data-filtro="brightness(120%) saturate(140%)" type="button">☀️ Vibrante</button><button class="modal-btn filtro-opcao" data-filtro="hue-rotate(180deg)" type="button">🔵 Frio</button></div><button class="modal-primary" id="fechar-filtros" type="button">✓ Aplicar e fechar</button>`);
    modal.querySelectorAll(".filtro-opcao").forEach((button) => {
        button.onclick = () => { filtroAtual = button.dataset.filtro; updateImageTransform(); };
    });
    modal.querySelector("#fechar-filtros").onclick = closeEditorModals;
}

function salvarVersao() {
    if (!imagemAtual) {
        alert("Primeiro selecione uma imagem.");
        return;
    }

    const aiSource = imagemAtual.currentSrc || imagemAtual.src;
    if (window.initIILumeAI) {
        window.initIILumeAI(aiSource);
    }
    showScreen("ai");
}

function selecionarVersao(button) {
    document.querySelectorAll(".versoes button").forEach((item) => { item.textContent = "Selecionar"; });
    document.querySelectorAll(".versoes .versao").forEach((item) => item.classList.remove("selecionada"));
    const version = button.closest(".versao");
    if (!version) return;
    version.classList.add("selecionada");
    button.textContent = "✓ Selecionada";
    selectedEditorVersion = version;
}

function salvarVersaoSelecionada() {
    const version = selectedEditorVersion || document.querySelector(".versao.selecionada");
    if (!version) { alert("Selecione uma versão antes de salvar."); return; }
    const image = version.querySelector(".miniatura img");
    if (!image) { alert("Gere uma versão com IA primeiro."); return; }

    const download = document.createElement("a");
    download.download = "IILUME-versao.png";
    download.href = image.currentSrc || image.src;
    document.body.appendChild(download);
    download.click();
    download.remove();
}

function openEditorFromGallery() {
    if (!galleryPhotos.length) {
        alert("A galeria está vazia. Tire uma foto primeiro.");
        return;
    }
    const photo = galleryPhotos[currentPhotoIndex];
    selectedEditorVersion = null;
    editorReturnScreen = "gallery";
    mostrarImagem(photo.src);
    showScreen("editor");
}

editButton.addEventListener("click", openEditorFromGallery);
editorBackButton.addEventListener("click", () => {
    closeEditorModals();
    showScreen(editorReturnScreen);
    if (editorReturnScreen === "gallery") selectPhoto(currentPhotoIndex);
});

if (editorStudioButton) {
    editorStudioButton.addEventListener("click", () => {
        closeEditorModals();
        showScreen("studio");
    });
}

function closeGalleryInfo() {
    photoInfo.classList.add("hidden");
}


/* =========================================================
   WELCOME + MEU ESTÚDIO
   ========================================================= */
function renderStudioCreations() {
    const previews = [
        document.getElementById("studio-preview-1"),
        document.getElementById("studio-preview-2"),
        document.getElementById("studio-preview-3")
    ].filter(Boolean);

    previews.forEach((preview, index) => {
        const photo = galleryPhotos[index];
        if (!photo) {
            preview.innerHTML = index === 0
                ? '<i class="bi bi-image"></i><span>Sua criação</span>'
                : '<i class="bi bi-image"></i>';
            return;
        }

        preview.innerHTML = `<img src="${photo.src}" alt="${photo.name}" class="imported-image">`;
    });
}

if (startButton) {
    startButton.addEventListener("click", () => showScreen("studio"));
}

function openCameraFromStudio() {
    showScreen("camera");
}

function openGalleryFromStudio() {
    galleryReturnScreen = "studio";
    closeGalleryInfo();
    selectPhoto(currentPhotoIndex);
    showScreen("gallery");
}

function openEditorFromStudio() {
    if (galleryPhotos.length) {
        const photo = galleryPhotos[currentPhotoIndex];
        editorReturnScreen = "studio";
        selectedEditorVersion = null;
        mostrarImagem(photo.src);
    } else {
        editorReturnScreen = "studio";
    }
    showScreen("editor");
}

[studioCameraButton, studioMainCameraButton].filter(Boolean).forEach((button) => {
    button.addEventListener("click", openCameraFromStudio);
});

[studioGalleryButton, studioGalleryNav, studioSeeAllButton].filter(Boolean).forEach((button) => {
    button.addEventListener("click", openGalleryFromStudio);
});

if (studioCreateNav) {
    studioCreateNav.addEventListener("click", openEditorFromStudio);
}

if (imageInput) {
    imageInput.addEventListener("change", (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            alert("Selecione um arquivo de imagem.");
            imageInput.value = "";
            return;
        }

        const url = URL.createObjectURL(file);
        galleryPhotos.push({
            name: file.name,
            src: url,
            favorite: false,
            imported: true
        });
        currentPhotoIndex = galleryPhotos.length - 1;
        renderThumbnails();
        selectPhoto(currentPhotoIndex);
        renderStudioCreations();

        // A imagem importada fica disponível imediatamente na galeria.
        openGalleryFromStudio();
        imageInput.value = "";
    });
}

/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */
renderTicks();
updateZoom(0);
selectPhoto(0);
updateCameraGalleryThumb();
updateFlashButton();
renderStudioCreations();
showScreen("welcome");



/* =========================================================
   MODO RETRATO — integrado como submodo da Câmera
   ========================================================= */
const cameraVideoModeButton = document.getElementById("cam-mode-video");
const cameraPhotoModeButton = document.getElementById("cam-mode-photo");
const cameraPortraitModeButton = document.getElementById("cam-mode-portrait");
const cameraPanoramaModeButton = document.getElementById("cam-mode-panorama");
const portraitMode = document.getElementById("portrait-mode");
const portraitPhotoBack = document.getElementById("portrait-photo-back");

function setCameraModeButtonState(mode) {
    const buttons = [
        [cameraVideoModeButton, "video"],
        [cameraPhotoModeButton, "photo"],
        [cameraPortraitModeButton, "portrait"],
        [cameraPanoramaModeButton, "panorama"]
    ];
    buttons.forEach(([button, buttonMode]) => {
        if (!button) return;
        const active = mode === buttonMode;
        button.classList.toggle("cam-mode-active", active);
        button.setAttribute("aria-selected", String(active));
    });
}

function openPortraitMode() {
    if (!portraitMode) return;
    portraitMode.classList.add("portrait-show");
    btnFlip?.setAttribute("aria-label", "Voltar para Foto");
    if (btnFlip) btnFlip.title = "Voltar para Foto";
    portraitMode.setAttribute("aria-hidden", "false");
    setCameraModeButtonState("portrait");

    const portraitFlashButton = document.getElementById("portraitFlashBtn");
    if (portraitFlashButton) {
        portraitFlashButton.classList.toggle("portrait-active", isFlashOn);
    }
}

function closePortraitMode() {
    if (!portraitMode) return;
    portraitMode.classList.remove("portrait-show");
    btnFlip?.setAttribute("aria-label", "Abrir Retrato");
    if (btnFlip) btnFlip.title = "Abrir Retrato";
    portraitMode.setAttribute("aria-hidden", "true");
    setCameraModeButtonState("photo");
}

cameraPhotoModeButton?.addEventListener("click", closePortraitMode);
cameraPortraitModeButton?.addEventListener("click", openPortraitMode);
cameraVideoModeButton?.addEventListener("click", () => {
    closePortraitMode();
    setCameraModeButtonState("video");
    window.setTimeout(() => setCameraModeButtonState("photo"), 250);
});
cameraPanoramaModeButton?.addEventListener("click", () => {
    closePortraitMode();
    setCameraModeButtonState("panorama");
    window.setTimeout(() => setCameraModeButtonState("photo"), 250);
});
portraitPhotoBack?.addEventListener("click", () => {
    closePortraitMode();
    showScreen("studio");
});

/* ===== Comportamento dos controles internos do Retrato ===== */
(() => {
    const portraitViewport = document.getElementById("portraitViewport");
    const portraitSubjectPhoto = document.getElementById("portraitSubjectPhoto");
    const portraitBokehLayer = document.getElementById("portraitBokehLayer");
    const portraitDofTag = document.getElementById("portraitDofTag");
    const portraitLightCarousel = document.getElementById("portraitLightCarousel");
    const portraitLightOptions = document.querySelectorAll(".portrait-light-option");
    const portraitLightModeLabel = document.getElementById("portraitLightModeLabel");
    const portraitBeautySlider = document.getElementById("portraitBeautySlider");
    const portraitGridBtn = document.getElementById("portraitGridBtn");
    const portraitGridOverlay = document.getElementById("portraitGridOverlay");
    const portraitFocusSquare = document.getElementById("portraitFocusSquare");
    const portraitTimerToggle = document.getElementById("portraitTimerToggle");
    const portraitCountdownOverlay = document.getElementById("portraitCountdownOverlay");
    const portraitCountdownNum = document.getElementById("portraitCountdownNum");
    const portraitShutterBtn = document.getElementById("portraitShutterBtn");
    const portraitFlashToast = document.getElementById("portraitFlashToast");
    const portraitToastMsg = document.getElementById("portraitToastMsg");
    const portraitSavedStrip = document.getElementById("portraitSavedStrip");
    const portraitSavedLabel = document.getElementById("portraitSavedLabel");
    const portraitFlashBtn = document.getElementById("portraitFlashBtn");
    const portraitSwitchCam = document.getElementById("portraitSwitchCam");
    const portraitPhotoTab = document.getElementById("portrait-photo-tab");

    if (!portraitViewport || !portraitSubjectPhoto) return;

    const portraitSubjectSrc = portraitSubjectPhoto.src;
    const portraitLightFilters = {
        soft: "brightness(1.2) contrast(.9) saturate(1)",
        medium: "brightness(1) contrast(1) saturate(1.1)",
        dramatic: "brightness(.85) contrast(1.35) saturate(1.3)"
    };
    const portraitLightLabels = { soft:"Suave", medium:"Média", dramatic:"Dramática" };
    const portraitApertureBlur = {"1.4":11,"1.8":7,"2.8":4,"4":1.5};
    let portraitCurrentLight = "medium";
    let portraitTimerOn = false;

    function portraitHaptic(ms){
        if (navigator.vibrate) {
            try { navigator.vibrate(ms); } catch (error) {}
        }
    }

    function updatePortraitSubjectFilter(){
        if (!portraitSubjectPhoto) return;
        const t = portraitBeautySlider ? Number(portraitBeautySlider.value) / 100 : 0.3;
        portraitSubjectPhoto.style.filter =
            portraitLightFilters[portraitCurrentLight] +
            ` blur(${(t * 0.5).toFixed(2)}px) brightness(${(1 + t * 0.05).toFixed(2)})`;
    }

    function selectPortraitLight(value, emitHaptic = true) {
        const allowed = ["soft", "medium", "dramatic"];
        if (!allowed.includes(value)) value = "medium";
        portraitCurrentLight = value;
        const selectedIndex = allowed.indexOf(value);

        portraitLightOptions.forEach((option, index) => {
            const isSelected = option.dataset.pos === value;
            option.classList.toggle("portrait-light-option-active", isSelected);
            option.setAttribute("aria-selected", String(isSelected));
            option.style.setProperty("--light-offset", `${(index - selectedIndex) * 72}px`);
        });

        if (portraitLightModeLabel) {
            portraitLightModeLabel.textContent = portraitLightLabels[value];
        }
        updatePortraitSubjectFilter();
        if (emitHaptic) portraitHaptic(10);
    }

    portraitLightOptions.forEach((option) => {
        option.addEventListener("click", () => selectPortraitLight(option.dataset.pos));
    });

    let portraitLightTouchStartX = null;
    portraitLightCarousel?.addEventListener("wheel", (event) => {
        event.preventDefault();
        const order = ["soft", "medium", "dramatic"];
        let index = order.indexOf(portraitCurrentLight);
        const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
        index += delta > 0 ? 1 : -1;
        index = Math.max(0, Math.min(order.length - 1, index));
        selectPortraitLight(order[index]);
    }, { passive: false });

    portraitLightCarousel?.addEventListener("touchstart", (event) => {
        portraitLightTouchStartX = event.touches[0]?.clientX ?? null;
    }, { passive: true });

    portraitLightCarousel?.addEventListener("touchend", (event) => {
        if (portraitLightTouchStartX == null) return;
        const endX = event.changedTouches[0]?.clientX;
        if (typeof endX !== "number") return;
        const delta = endX - portraitLightTouchStartX;
        portraitLightTouchStartX = null;
        if (Math.abs(delta) < 18) return;
        const order = ["soft", "medium", "dramatic"];
        let index = order.indexOf(portraitCurrentLight);
        index += delta < 0 ? 1 : -1;
        index = Math.max(0, Math.min(order.length - 1, index));
        selectPortraitLight(order[index]);
    }, { passive: true });

    portraitLightCarousel?.addEventListener("keydown", (event) => {
        const order = ["soft", "medium", "dramatic"];
        let index = order.indexOf(portraitCurrentLight);
        if (event.key === "ArrowRight") index += 1;
        else if (event.key === "ArrowLeft") index -= 1;
        else return;
        event.preventDefault();
        index = Math.max(0, Math.min(order.length - 1, index));
        selectPortraitLight(order[index]);
    });

    document.querySelectorAll(".portrait-aperture-chip").forEach((chip) => {
        chip.addEventListener("click", () => {
            // Mantém apenas uma abertura selecionada por vez.
            document.querySelectorAll(".portrait-aperture-chip").forEach((item) => {
                item.classList.remove("active", "portrait-active");
                item.setAttribute("aria-selected", "false");
            });
            chip.classList.add("active");
            chip.setAttribute("aria-selected", "true");
            const f = chip.dataset.f || "1.8";
            if (portraitBokehLayer) {
                portraitBokehLayer.style.filter = `blur(${portraitApertureBlur[f]}px)`;
                portraitBokehLayer.style.opacity = f === "4" ? ".35" : ".8";
            }
            if (portraitDofTag) {
                portraitDofTag.textContent = `f/${f} · Bokeh`;
            }
            portraitHaptic(10);
        });
    });

    portraitBeautySlider?.addEventListener("input", updatePortraitSubjectFilter);

    // O botão "Foto" dentro do Retrato retorna para o modo Foto da câmera.
    function goToPhotoModeFromPortrait(){
        closePortraitMode();
        cameraPhotoModeButton?.focus();
    }

    portraitPhotoTab?.addEventListener("click", goToPhotoModeFromPortrait);
    portraitPhotoTab?.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            goToPhotoModeFromPortrait();
        }
    });

    portraitGridBtn?.addEventListener("click", () => {
        portraitGridBtn.classList.toggle("portrait-active");
        portraitGridOverlay.classList.toggle("portrait-show");
        portraitHaptic(10);
    });

    portraitViewport.addEventListener("click", (event) => {
        if (event.target.closest(".portrait-icon-btn") || event.target.closest(".portrait-dof-tag")) return;
        const rect = portraitViewport.getBoundingClientRect();
        if (!portraitFocusSquare) return;
        portraitFocusSquare.style.left = `${event.clientX - rect.left}px`;
        portraitFocusSquare.style.top = `${event.clientY - rect.top}px`;
        portraitFocusSquare.classList.remove("portrait-show");
        void portraitFocusSquare.offsetWidth;
        portraitFocusSquare.classList.add("portrait-show");
        portraitHaptic(8);
    });

    portraitTimerToggle?.addEventListener("click", () => {
        portraitTimerOn = !portraitTimerOn;
        portraitTimerToggle.classList.toggle("portrait-active", portraitTimerOn);
        portraitHaptic(10);
    });

    function portraitShowToast(){
        if (!portraitToastMsg) return;
        portraitToastMsg.classList.add("portrait-show");
        setTimeout(() => portraitToastMsg.classList.remove("portrait-show"), 1800);
    }

    function portraitCapture(){
        if (portraitFlashToast) {
            portraitFlashToast.classList.add("portrait-on");
            setTimeout(() => portraitFlashToast.classList.remove("portrait-on"), 90);
        }
        portraitShowToast();
        portraitHaptic(25);

        if (portraitSavedStrip) {
            const thumb = document.createElement("img");
            thumb.className = "portrait-saved-thumb";
            thumb.src = portraitSubjectSrc;
            thumb.style.filter = portraitSubjectPhoto.style.filter || "none";
            portraitSavedStrip.prepend(thumb);
            while (portraitSavedStrip.children.length > 4) {
                portraitSavedStrip.removeChild(portraitSavedStrip.lastChild);
            }
        }
        portraitSavedLabel?.classList.add("portrait-show");

        // Integra a captura do Retrato com a galeria já existente.
        if (typeof addCapturedPhoto === "function") {
            addCapturedPhoto(portraitSubjectSrc);
        }
    }

    function runPortraitCountdownThenCapture(){
        let n = 3;
        portraitCountdownOverlay?.classList.add("portrait-show");
        if (portraitCountdownNum) portraitCountdownNum.textContent = String(n);
        portraitHaptic(15);

        const tick = setInterval(() => {
            n -= 1;
            if (n > 0) {
                if (portraitCountdownNum) {
                    portraitCountdownNum.textContent = String(n);
                    portraitCountdownNum.style.animation = "none";
                    void portraitCountdownNum.offsetWidth;
                    portraitCountdownNum.style.animation = "portraitCountPulse .9s ease";
                }
                portraitHaptic(15);
            } else {
                clearInterval(tick);
                portraitCountdownOverlay?.classList.remove("portrait-show");
                portraitCapture();
            }
        }, 900);
    }

    portraitShutterBtn?.addEventListener("click", () => {
        if (portraitTimerOn) runPortraitCountdownThenCapture();
        else portraitCapture();
    });

    // O flash do Retrato usa o mesmo estado do flash da câmera principal.
    portraitFlashBtn?.addEventListener("click", () => {
        isFlashOn = !isFlashOn;
        updateFlashButton();
        portraitFlashBtn.classList.toggle("portrait-active", isFlashOn);
        portraitFlashBtn.setAttribute("aria-label", isFlashOn ? "Desativar flash" : "Ativar flash");
        portraitHaptic(10);
    });

    portraitSwitchCam?.addEventListener("click", () => {
        closePortraitMode();
        portraitHaptic(10);
    });

    document.querySelectorAll(".portrait-mode-tabs span").forEach((tab) => {
        tab.addEventListener("click", () => {
            const mode = tab.dataset.portraitMode;
            if (mode === "photo") {
                // Volta explicitamente para o modo Foto da câmera.
                closePortraitMode();
                setCameraModeButtonState("photo");
                return;
            }
            if (mode === "portrait") return;
            portraitShowToast();
            if (portraitToastMsg) {
                portraitToastMsg.innerHTML = "<span>Modo disponível em outra etapa do projeto.</span>";
            }
        });
    });

    // Estado inicial da abertura: somente f/1.8 fica ativa.
    const initialAperture = document.querySelector('.portrait-aperture-chip[data-f="1.8"]');
    document.querySelectorAll(".portrait-aperture-chip").forEach((item) => {
        item.classList.remove("active", "portrait-active");
        item.setAttribute("aria-selected", "false");
    });
    initialAperture?.classList.add("active");
    initialAperture?.setAttribute("aria-selected", "true");

    selectPortraitLight("medium", false);
})();


/* =========================================================
   MODO IA — lógica do protótipo fornecido, isolada para o IILUME
   ========================================================= */
(() => {
  const testPhotoSrc = document.getElementById('ai-testPhoto').src;

    // Presets de estilo — cada um interpola da imagem "crua" até seu visual completo
    const PRESETS = {
      natural:  {brightness:1.55, contrast:1.22, saturate:1.30, hue:0,   sepia:0,   label:'Natural'},
      vivido:   {brightness:1.60, contrast:1.35, saturate:1.70, hue:0,   sepia:0,   label:'Vívido'},
      noturno:  {brightness:1.75, contrast:1.15, saturate:1.15, hue:-8,  sepia:0,   label:'Noturno'},
      retrato:  {brightness:1.45, contrast:1.20, saturate:1.20, hue:0,   sepia:.10, label:'Retrato'},
      cinema:   {brightness:1.30, contrast:1.40, saturate:.92,  hue:-5,  sepia:0,   label:'Cinema'},
    };
    let currentPreset = 'natural';

    const slider = document.getElementById('ai-intensitySlider');
    const valueLabel = document.getElementById('ai-intensityValue');
    const aiBtn = document.getElementById('ai-aiBtn');
    const analyzingOverlay = document.getElementById('ai-analyzingOverlay');
    const analyzingText = document.getElementById('ai-analyzingText');
    const analyzingBarFill = document.getElementById('ai-analyzingBarFill');
    const compareWrap = document.getElementById('ai-compareWrap');
    const compareBefore = document.getElementById('ai-compareBefore');
    const compareHandle = document.getElementById('ai-compareHandle');
    const toast = document.getElementById('ai-toastMsg');
    const cancelBtn = document.getElementById('ai-cancelBtn');
    const confirmBtn = document.getElementById('ai-confirmBtn');
    const afterPhoto = document.getElementById('ai-sceneAfter');
    const depoisSub = document.getElementById('ai-depoisSub');
    const gridBtn = document.getElementById('ai-gridBtn');
    const gridOverlay = document.getElementById('ai-gridOverlay');
    const savedStrip = document.getElementById('ai-savedStrip');
    const savedLabel = document.getElementById('ai-savedLabel');
    const camReadout = document.getElementById('ai-camReadout');

    function haptic(ms){ if (navigator.vibrate) { try { navigator.vibrate(ms); } catch(e){} } }

    function buildFilter(presetKey, t){
      const p = PRESETS[presetKey];
      const b = 1 + (p.brightness - 1) * t;
      const c = 1 + (p.contrast - 1) * t;
      const s = 1 + (p.saturate - 1) * t;
      const h = p.hue * t;
      const sep = p.sepia * t;
      return `brightness(${b.toFixed(2)}) contrast(${c.toFixed(2)}) saturate(${s.toFixed(2)}) hue-rotate(${h.toFixed(1)}deg) sepia(${sep.toFixed(2)})`;
    }

    function applyIntensity(){
      const t = slider.value / 100;
      afterPhoto.style.filter = buildFilter(currentPreset, t);
      // "melhora" as leituras de ISO/velocidade proporcionalmente à intensidade
      const iso = Math.round(1600 - (1600 - 100) * t);
      const shutter = Math.round(15 + (250 - 15) * t);
      depoisSub.textContent = `ISO ${iso} · 1/${shutter}s`;
    }

    slider.addEventListener('input', () => {
      valueLabel.textContent = slider.value;
      applyIntensity();
    });

    const presetRow = document.getElementById('ai-presetRow');
    document.querySelectorAll('.ai-preset-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.ai-preset-chip').forEach(c => c.classList.remove('ai-active'));
        chip.classList.add('ai-active');
        currentPreset = chip.dataset.preset;
        applyIntensity();
        chip.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        haptic(10);
      });
    });

    if (presetRow) {
      presetRow.addEventListener('wheel', (event) => {
        if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
          event.preventDefault();
          presetRow.scrollLeft += event.deltaY;
        }
      }, { passive: false });
    }

    gridBtn.addEventListener('click', () => {
      gridBtn.classList.toggle('ai-active');
      gridOverlay.classList.toggle('ai-show');
      haptic(10);
    });

    // Simula a análise de IA em etapas, com barra de progresso
    const PHASES = [
      'Detectando cenário...',
      'Corrigindo exposição...',
      'Reduzindo ruído...',
      'Aumentando nitidez...',
      'Aplicando estilo ' + PRESETS[currentPreset].label + '...',
      'Finalizando...'
    ];

    aiBtn.addEventListener('click', () => {
      if (aiBtn.classList.contains('ai-busy')) return;
      haptic(15);
      aiBtn.classList.add('busy', 'pulse');
      setTimeout(() => aiBtn.classList.remove('ai-pulse'), 500);
      compareWrap.classList.remove('ai-show');
      analyzingOverlay.classList.add('ai-show');

      const phases = [
        'Detectando cenário...',
        'Corrigindo exposição...',
        'Reduzindo ruído...',
        'Aumentando nitidez...',
        `Aplicando estilo ${PRESETS[currentPreset].label}...`,
        'Finalizando...'
      ];
      let step = 0;
      analyzingText.textContent = phases[0];
      analyzingBarFill.style.width = '0%';

      const stepMs = 380;
      const interval = setInterval(() => {
        step++;
        analyzingBarFill.style.width = Math.min(100, (step / phases.length) * 100) + '%';
        if (step < phases.length) {
          analyzingText.style.opacity = 0;
          setTimeout(() => { analyzingText.textContent = phases[step]; analyzingText.style.opacity = 1; }, 120);
        } else {
          clearInterval(interval);
        }
      }, stepMs);

      setTimeout(() => {
        analyzingOverlay.classList.remove('ai-show');
        compareWrap.classList.add('ai-show');
        aiBtn.classList.remove('ai-busy');
        applyIntensity();
        showToast(`Estilo ${PRESETS[currentPreset].label} aplicado`, '✨');
        haptic(20);
      }, phases.length * stepMs + 250);
    });

    function showToast(msg, icon){
      toast.innerHTML = (icon ? `<span>${icon}</span>` : '') + `<span>${msg}</span>`;
      toast.classList.add('ai-show');
      setTimeout(() => toast.classList.remove('ai-show'), 2400);
    }

    cancelBtn.addEventListener('click', () => {
      compareWrap.classList.remove('ai-show');
      haptic(10);
    });

    let savedCount = 0;
    confirmBtn.addEventListener('click', () => {
      if (!compareWrap.classList.contains('ai-show')) {
        showToast('Aplique a IA antes de salvar', '⚠️');
        return;
      }
      savedCount++;
      const thumb = document.createElement('img');
      thumb.className = 'saved-thumb';
      thumb.src = testPhotoSrc;
      thumb.style.filter = afterPhoto.style.filter;
      savedStrip.prepend(thumb);
      while (savedStrip.children.length > 4) savedStrip.removeChild(savedStrip.lastChild);
      savedLabel.classList.add('ai-show');
      showToast('Foto salva em "Salvos pela IA"', '✅');
      haptic(25);
    });

    // Arrasto do comparador antes/depois
    let dragging = false;
    const viewport = document.getElementById('ai-viewport');

    function moveHandle(clientX){
      const rect = viewport.getBoundingClientRect();
      let pct = ((clientX - rect.left) / rect.width) * 100;
      pct = Math.max(0, Math.min(100, pct));
      compareHandle.style.left = pct + '%';
      compareBefore.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    }

    compareHandle.addEventListener('mousedown', () => dragging = true);
    compareHandle.addEventListener('touchstart', () => dragging = true, {passive:true});
    window.addEventListener('mouseup', () => dragging = false);
    window.addEventListener('touchend', () => dragging = false);
    window.addEventListener('mousemove', e => { if(dragging) moveHandle(e.clientX); });
    window.addEventListener('touchmove', e => { if(dragging) moveHandle(e.touches[0].clientX); }, {passive:true});

    applyIntensity();

  const aiImageDefault = document.getElementById('ai-testPhoto') ? document.getElementById('ai-testPhoto').src : '';
  window.initIILumeAI = function(src){
    const img = document.getElementById('ai-testPhoto');
    const before = document.getElementById('ai-compareBefore');
    const after = document.getElementById('ai-sceneAfter');
    if (img && src) img.src = src;
    if (before && src) before.src = src;
    if (after && src) after.src = src;
    const wrap = document.getElementById('ai-compareWrap');
    const overlay = document.getElementById('ai-analyzingOverlay');
    if (wrap) wrap.classList.remove('ai-show');
    if (overlay) overlay.classList.remove('ai-show');
  };

  const aiCancel = document.getElementById('ai-cancelBtn');
  if (aiCancel) {
    aiCancel.addEventListener('click', () => {
      const wrap = document.getElementById('ai-compareWrap');
      if (wrap) wrap.classList.remove('ai-show');
      if (typeof showScreen === 'function') showScreen('editor');
    });
  }
})();
