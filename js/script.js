<!--camera-->
    document.addEventListener("DOMContentLoaded", () => {
    const videoEl = document.getElementById("cam-stream");
    const btnShutter = document.getElementById("cam-btn-shutter");
    const btnFlash = document.getElementById("cam-btn-flash");
    const iconFlash = document.getElementById("cam-icon-flash");
    const flashOverlay = document.getElementById("cam-flash-overlay");
    const shutterFlash = document.getElementById("cam-shutter-flash");
    const shutterIconFlash = document.getElementById("cam-shutter-icon-flash");
    const btnGrid = document.getElementById("cam-btn-grid");
    const gridEl = document.getElementById("cam-grid");
    const btnFlip = document.getElementById("cam-btn-flip");
    const iconType = document.getElementById("cam-icon-type");
    const textType = document.getElementById("cam-text-type");
    const thumbImg = document.getElementById("cam-thumb-img");

    // Elementos do Zoom e Dial
    const zoomTrigger = document.getElementById("cam-zoom-trigger");
    const zoomTriggerText = document.getElementById("cam-zoom-trigger-text");
    const zoomClose = document.getElementById("cam-zoom-close");
    const dialContainer = document.getElementById("cam-dial");
    const dialTicks = document.getElementById("cam-dial-ticks");
    const dialContent = document.getElementById("cam-dial-content");
    const lensItems = document.querySelectorAll(".cam-lens-item");

    // Imagens de Simulação (para testes sem webcam)
    const imgTraseira = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80";
    const imgFrontal = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80";

    let currentStream = null;
    let facingMode = "environment";
    let isFlashOn = false;

    // ESTADOS DO DIAL
    let currentAngle = 0;
    let isDragging = false;
    let startX = 0;
    let startAngle = 0;

    // 1. Desenha Traços do Dial
    function renderTicks() {
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
    // 2. Atualização do Zoom
    function updateZoom(angle) {
        currentAngle = Math.max(-35, Math.min(35, angle));

            dialTicks.setAttribute("transform", `rotate(${currentAngle}, 200, 200)`);
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

        lensItems.forEach((item) => {
            item.classList.toggle("active", item.dataset.lens === closest);
        });

        videoEl.classList.remove("cam-zoom-13mm", "cam-zoom-26mm", "cam-zoom-77mm");
        videoEl.classList.add(`cam-zoom-${closest}`);
    }

    // 3. Controle do Dial Retrátil
    zoomTrigger.addEventListener("click", () => {
        dialContainer.classList.remove("cam-dial-hidden");
        zoomTrigger.classList.add("d-none");
    });

    zoomClose.addEventListener("click", () => {
        dialContainer.classList.add("cam-dial-hidden");
        zoomTrigger.classList.remove("d-none");
    });

    // 4. Navegação por Scroll / Drag
    dialContainer.addEventListener("wheel", (e) => {
        e.preventDefault();
        updateZoom(currentAngle + (e.deltaY > 0 ? -5 : 5));
    }, { passive: false });

    dialContainer.addEventListener("mousedown", (e) => {
        isDragging = true;
        startX = e.clientX;
        startAngle = currentAngle;
    });

    window.addEventListener("mousemove", (e) => {
        if (isDragging) updateZoom(startAngle + (e.clientX - startX) * 0.25);
    });

    window.addEventListener("mouseup", () => isDragging = false);

    dialContainer.addEventListener("touchstart", (e) => {
        isDragging = true;
        startX = e.touches[0].clientX;
        startAngle = currentAngle;
    }, { passive: true });

    dialContainer.addEventListener("touchmove", (e) => {
        if (isDragging) updateZoom(startAngle + (e.touches[0].clientX - startX) * 0.25);
    }, { passive: true });

    dialContainer.addEventListener("touchend", () => isDragging = false);

    lensItems.forEach((item) => {
        item.addEventListener("click", (e) => {
            e.stopPropagation();
            updateZoom(-parseFloat(item.dataset.angle));
        });
    });

    // 5. Inicialização e Alternância da Câmera
    async function initCamera() {
        if (currentStream) {
            currentStream.getTracks().forEach((track) => track.stop());
        }

        try {
            currentStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: false
            });
            videoEl.srcObject = currentStream;
        } catch (err) {
            console.warn("Câmera indisponível. Ativando imagem de teste.", err);
            videoEl.srcObject = null;
            videoEl.poster = facingMode === "environment" ? imgTraseira : imgFrontal;
        }
    }

    // 6. Troca Frontal/Traseira
    btnFlip.addEventListener("click", async () => {
        btnFlip.querySelector("i").classList.add("cam-spin-icon");
        setTimeout(() => btnFlip.querySelector("i").classList.remove("cam-spin-icon"), 500);

        videoEl.classList.add("cam-flip-anim");
        setTimeout(() => videoEl.classList.remove("cam-flip-anim"), 500);

        facingMode = facingMode === "environment" ? "user" : "environment";

        if (facingMode === "user") {
            textType.textContent = "FRONTAL";
            iconType.className = "bi bi-person-bounding-box text-info fs-6";
        } else {
            textType.textContent = "TRASEIRA";
            iconType.className = "bi bi-camera-fill text-info fs-6";
        }

        await initCamera();
    });

    // 7. Disparo + Animações
    btnShutter.addEventListener("click", () => {
        shutterFlash.classList.add("active");
        setTimeout(() => shutterFlash.classList.remove("active"), 200);

        shutterIconFlash.classList.remove("d-none");
        setTimeout(() => shutterIconFlash.classList.add("d-none"), 350);

        const canvas = document.createElement("canvas");
        canvas.width = videoEl.videoWidth || 640;
        canvas.height = videoEl.videoHeight || 480;
        const ctx = canvas.getContext("2d");

        if (facingMode === "user") {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }

        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
        thumbImg.src = canvas.toDataURL("image/png");
        thumbImg.classList.remove("d-none");
    });

    // Toggles do Topo
    btnFlash.addEventListener("click", () => {
        isFlashOn = !isFlashOn;
        iconFlash.className = isFlashOn ? "bi bi-zap-fill text-warning" : "bi bi-zap";
        flashOverlay.classList.toggle("active", isFlashOn);
    });

    btnGrid.addEventListener("click", () => {
        gridEl.classList.toggle("d-none");
        btnGrid.classList.toggle("text-info");
    });

    renderTicks();
    updateZoom(0);
    initCamera();
});

<!--navegacao-->

<!--galeria-->
/* FOTOS DA GALERIA */
let galleryPhotos = [
    {
        name: "foto1.jpg",
        src: "assets/images/gallery/foto1.jpg",
        favorite: false
    },

    {
        name: "foto2.jpg",
        src: "assets/images/gallery/foto2.jpg",
        favorite: false
    },

    {
        name: "foto3.jpg",
        src: "assets/images/gallery/foto3.jpg",
        favorite: false
    },

    {
        name: "foto4.jpg",
        src: "assets/images/gallery/foto4.jpg",
        favorite: false
    },

];

/* FOTO ATUAL */
let currentPhotoIndex = 0;

/* ELEMENTOS HTML */
const mainImage =
    document.getElementById(
        "main_image"
    );
const thumbnailContainer =
    document.getElementById(
        "thumbnail_container"
    );
const favoriteButton =
    document.getElementById(
        "favorite_button"
    );
const heartIcon =
    document.getElementById(
        "heart_icon"
    );
const infoButton =
    document.getElementById(
        "info_button"
    );
const shareButton =
    document.getElementById(
        "share_button"
    );
const deleteButton =
    document.getElementById(
        "delete_button"
    );
const photoInfo =
    document.getElementById(
        "photo_info"
    );
const photoName =
    document.getElementById(
        "photo_name"
    );

/* MINIATURAS */
function renderThumbnails() {
    thumbnailContainer.innerHTML = "";
    galleryPhotos.forEach(
        (photo, index) => {
            const image =
                document.createElement(
                    "img"
                );
            image.src =
                photo.src;
            image.alt =
                photo.name;
            image.classList.add(
                "thumbnail"
            );
            if (
                index ===
                currentPhotoIndex
            ) {
                image.classList.add(
                    "active"
                );
            }
            image.addEventListener(
                "click",
                function () {
                    selectPhoto(index);
                }
            );
            thumbnailContainer.appendChild(
                image
            );
        }
    );

}

/* SELECIONAR FOTO */
function selectPhoto(index) {
    currentPhotoIndex = index;
    const photo =
        galleryPhotos[index];
    mainImage.src =
        photo.src;
    photoName.textContent =
        photo.name;
    updateFavorite();
    renderThumbnails();
}

/* FAVORITO */
function toggleFavorite() {
    const photo =
        galleryPhotos[
            currentPhotoIndex
            ];
    photo.favorite =
        !photo.favorite;
    updateFavorite();
}
function updateFavorite() {
    const photo =
        galleryPhotos[
            currentPhotoIndex
            ];
    if (photo.favorite) {
        favoriteButton.classList.add(
            "favorite-active"
        );
        heartIcon.setAttribute(
            "fill",
            "currentColor"
        );
    } else {
        favoriteButton.classList.remove(
            "favorite-active"
        );
        heartIcon.setAttribute(
            "fill",
            "none"
        );
    }
}

/* INFORMAÇÕES */
function toggleInfo() {
    photoInfo.classList.toggle(
        "hidden"
    );
}

/* COMPARTILHAR */
function sharePhoto() {
    const photo =
        galleryPhotos[
            currentPhotoIndex
            ];
    alert(
        "Compartilhamento simulado!\n\n" +
        photo.name
    );
}

/* EXCLUIR */
function deletePhoto() {
    if (
        galleryPhotos.length === 0
    ) {
        return;
    }
    const photo =
        galleryPhotos[
            currentPhotoIndex
            ];
    const confirmation =
        confirm(
            "Deseja excluir " +
            photo.name +
            "?"
        );
    if (!confirmation) {
        return;
    }
    galleryPhotos.splice(
        currentPhotoIndex,
        1
    );
    if (
        galleryPhotos.length === 0
    ) {
        mainImage.style.display =
            "none";
        thumbnailContainer.innerHTML =
            "";
        return;
    }
    if (
        currentPhotoIndex >=
        galleryPhotos.length
    ) {
        currentPhotoIndex =
            galleryPhotos.length - 1;
    }
    selectPhoto(
        currentPhotoIndex
    );
}

/* EVENTOS */
favoriteButton.addEventListener(
    "click",
    toggleFavorite
);

infoButton.addEventListener(
    "click",
    toggleInfo
);

shareButton.addEventListener(
    "click",
    sharePhoto
);

deleteButton.addEventListener(
    "click",
    deletePhoto
);

/* INICIAR*/
renderThumbnails();
selectPhoto(0);

<!--edicao-->
<!--ia simulada-->

<!--controles interacoes-->
/* ===== INTEGRAÇÃO ENTRE CÂMERA E GALERIA ===== */
document.addEventListener("DOMContentLoaded", () => {
    const cameraScreen = document.getElementById("camera_screen");
    const galleryScreen = document.getElementById("gallery_screen");
    const backButton = document.getElementById("back_button");
    const cameraGalleryButton = document.querySelector(".cam-thumb-placeholder");

    function showScreen(screenToShow) {
        if (!screenToShow) return;

        document.querySelectorAll(".iilume-screen").forEach((screen) => {
            screen.classList.remove("active");
        });

        screenToShow.classList.add("active");
    }

    if (cameraGalleryButton) {
        cameraGalleryButton.addEventListener("click", () => {
            showScreen(galleryScreen);
        });
    }

    if (backButton) {
        backButton.addEventListener("click", () => {
            showScreen(cameraScreen);
        });
    }
});
