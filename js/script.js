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
    const editorScreen = document.getElementById("editor_screen");
const editButton = document.getElementById("edit_button");
    const backButton = document.getElementById("back_button");
    const cameraGalleryButton = document.querySelector(".cam-thumb-placeholder");

    function showScreen(screenToShow) {
        if (!screenToShow) return;

        document.querySelectorAll(".iilume-screen").forEach((screen) => {
            screen.classList.remove("active");
        });
document.getElementById("camera_screen")?.classList.remove("active");
document.getElementById("gallery_screen")?.classList.remove("active");
document.getElementById("editor_screen")?.classList.remove("active");
        screenToShow.classList.add("active");
    }

    if (cameraGalleryButton) {
        cameraGalleryButton.addEventListener("click", () => {
            showScreen(galleryScreen);
        });
    }

    if (editButton) {
    editButton.addEventListener("click", () => {
        showScreen(editorScreen);
    });
}

    if (backButton) {
        backButton.addEventListener("click", () => {
            showScreen(cameraScreen);
        });
    }
});
// ===== PESSOA 4 - EDITOR + SALVOS PELA IA =====

let imagemAtual = null;
let rotacaoAtual = 0;
let filtroAtual = "none";

function carregarImagem() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = function (evento) {
        const arquivo = evento.target.files[0];

        if (!arquivo) {
            return;
        }

        const leitor = new FileReader();

        leitor.onload = function (e) {
            mostrarImagem(e.target.result);
        };

        leitor.readAsDataURL(arquivo);
    };

    input.click();
}

function mostrarImagem(src) {
    const container = document.querySelector(".imagem-container");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    const imagem = document.createElement("img");

    imagem.src = src;
    imagem.id = "imagem-editavel";
    imagem.alt = "Imagem selecionada";

    imagem.style.maxWidth = "100%";
    imagem.style.maxHeight = "300px";
    imagem.style.objectFit = "contain";
    imagem.style.transition = "0.3s";

    container.appendChild(imagem);

    imagemAtual = imagem;
    rotacaoAtual = 0;
    filtroAtual = "none";

    atualizarImagem();
}

function atualizarImagem() {
    if (!imagemAtual) {
        return;
    }

  imagemAtual.style.transform = `rotate(${rotacaoAtual}deg) scale(${nivelZoom / 100})`;
    imagemAtual.style.filter = filtroAtual;
}

function cortar() {
    if (!imagemAtual) {
        carregarImagem();
        return;
    }

    const container = document.querySelector(".imagem-container");

    // Evita abrir o modo de corte duas vezes
    if (document.getElementById("area-corte")) {
        return;
    }

    const areaCorte = document.createElement("div");
    areaCorte.id = "area-corte";

    areaCorte.style.position = "absolute";
    areaCorte.style.top = "20%";
    areaCorte.style.left = "20%";
    areaCorte.style.width = "60%";
    areaCorte.style.height = "60%";
    areaCorte.style.border = "2px solid #c13cff";
    areaCorte.style.boxShadow = "0 0 0 9999px rgba(0,0,0,0.45)";
    areaCorte.style.zIndex = "20";
    areaCorte.style.cursor = "move";
   ["nw", "ne", "sw", "se"].forEach(posicao => {
    const alca = document.createElement("div");

    alca.className = "alca-corte";
    alca.dataset.posicao = posicao;

    alca.style.position = "absolute";
    alca.style.width = "16px";
    alca.style.height = "16px";
    alca.style.background = "#c13cff";
    alca.style.border = "2px solid white";
    alca.style.borderRadius = "50%";
    alca.style.zIndex = "25";

    if (posicao.includes("n")) alca.style.top = "-8px";
    if (posicao.includes("s")) alca.style.bottom = "-8px";
    if (posicao.includes("w")) alca.style.left = "-8px";
    if (posicao.includes("e")) alca.style.right = "-8px";

    areaCorte.appendChild(alca);
});

const alcas = areaCorte.querySelectorAll(".alca-corte");

alcas.forEach(alca => {
    alca.addEventListener("mousedown", function (evento) {
        evento.preventDefault();
        evento.stopPropagation();

        const posicao = alca.dataset.posicao;

        const inicioX = evento.clientX;
        const inicioY = evento.clientY;

        const larguraInicial = areaCorte.offsetWidth;
        const alturaInicial = areaCorte.offsetHeight;
        const esquerdaInicial = areaCorte.offsetLeft;
        const topoInicial = areaCorte.offsetTop;

        function redimensionar(e) {
            const dx = e.clientX - inicioX;
            const dy = e.clientY - inicioY;

            if (posicao.includes("e")) {
                areaCorte.style.width =
                    Math.max(60, larguraInicial + dx) + "px";
            }

            if (posicao.includes("s")) {
                areaCorte.style.height =
                    Math.max(60, alturaInicial + dy) + "px";
            }

            if (posicao.includes("w")) {
                const novaLargura = Math.max(60, larguraInicial - dx);

                areaCorte.style.width = novaLargura + "px";
                areaCorte.style.left = esquerdaInicial + dx + "px";
            }

            if (posicao.includes("n")) {
                const novaAltura = Math.max(60, alturaInicial - dy);

                areaCorte.style.height = novaAltura + "px";
                areaCorte.style.top = topoInicial + dy + "px";
            }
        }

        function parar() {
            document.removeEventListener("mousemove", redimensionar);
            document.removeEventListener("mouseup", parar);
        }

        document.addEventListener("mousemove", redimensionar);
        document.addEventListener("mouseup", parar);
    });
});
    areaCorte.style.overflow = "hidden";

    container.style.position = "relative";
    container.appendChild(areaCorte);

    const botoes = document.createElement("div");
    botoes.id = "controles-corte";

    botoes.style.position = "absolute";
    botoes.style.bottom = "15px";
    botoes.style.left = "50%";
    botoes.style.transform = "translateX(-50%)";
    botoes.style.display = "flex";
    botoes.style.gap = "10px";
    botoes.style.zIndex = "30";

    botoes.innerHTML = `
        <button id="cancelar-corte"
            style="
                padding:10px 18px;
                border:1px solid #a855f7;
                border-radius:8px;
                background:#17103d;
                color:white;
                cursor:pointer;
            ">
            Cancelar
        </button>

        <button id="aplicar-corte"
            style="
                padding:10px 18px;
                border:none;
                border-radius:8px;
                background:linear-gradient(90deg,#7b2cff,#c13cff);
                color:white;
                font-weight:bold;
                cursor:pointer;
            ">
            ✓ Cortar
        </button>
    `;

    container.appendChild(botoes);

    document.getElementById("cancelar-corte").onclick = function () {
        areaCorte.remove();
        botoes.remove();
    };

    document.getElementById("aplicar-corte").onclick = function () {
        const imagemRect = imagemAtual.getBoundingClientRect();
        const corteRect = areaCorte.getBoundingClientRect();

        const escalaX = imagemAtual.naturalWidth / imagemRect.width;
        const escalaY = imagemAtual.naturalHeight / imagemRect.height;

        const x = Math.max(0, (corteRect.left - imagemRect.left) * escalaX);
        const y = Math.max(0, (corteRect.top - imagemRect.top) * escalaY);

        const largura = Math.min(
            corteRect.width * escalaX,
            imagemAtual.naturalWidth - x
        );

        const altura = Math.min(
            corteRect.height * escalaY,
            imagemAtual.naturalHeight - y
        );

        if (largura <= 0 || altura <= 0) {
            alert("Posicione a área de corte sobre a imagem.");
            return;
        }

        const canvas = document.createElement("canvas");
        canvas.width = largura;
        canvas.height = altura;

        const ctx = canvas.getContext("2d");

        ctx.drawImage(
            imagemAtual,
            x,
            y,
            largura,
            altura,
            0,
            0,
            largura,
            altura
        );

        imagemAtual.src = canvas.toDataURL("image/png");

        areaCorte.remove();
        botoes.remove();
    };
}

function rotacionar() {
    if (!imagemAtual) {
        carregarImagem();
        return;
    }

    let painel = document.getElementById("painel-rotacao");

    if (painel) {
        painel.remove();
    }

    painel = document.createElement("div");
    painel.id = "painel-rotacao";

    painel.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 9999;
            width: 300px;
            padding: 20px;
            border-radius: 16px;
            background: #11072b;
            border: 1px solid #a855f7;
            box-shadow: 0 0 25px rgba(168,85,247,0.5);
            color: white;
        ">

            <h2 style="margin-bottom:18px;">
                🔄 Rotacionar imagem
            </h2>

            <div style="
                display:grid;
                grid-template-columns:1fr 1fr;
                gap:10px;
            ">

                <button id="girar-esquerda" style="
                    padding:14px;
                    border:1px solid #a855f7;
                    border-radius:10px;
                    background:#17103d;
                    color:white;
                    cursor:pointer;
                ">
                    ↶ Esquerda
                </button>

                <button id="girar-direita" style="
                    padding:14px;
                    border:1px solid #a855f7;
                    border-radius:10px;
                    background:#17103d;
                    color:white;
                    cursor:pointer;
                ">
                    ↷ Direita
                </button>

                <button id="girar-180" style="
                    padding:14px;
                    border:1px solid #a855f7;
                    border-radius:10px;
                    background:#17103d;
                    color:white;
                    cursor:pointer;
                ">
                    ↻ 180°
                </button>

                <button id="resetar-rotacao" style="
                    padding:14px;
                    border:1px solid #a855f7;
                    border-radius:10px;
                    background:#17103d;
                    color:white;
                    cursor:pointer;
                ">
                    ↺ Resetar
                </button>

            </div>

            <button id="fechar-rotacao" style="
                width:100%;
                margin-top:14px;
                padding:12px;
                border:none;
                border-radius:10px;
                background:linear-gradient(90deg,#7b2cff,#c13cff);
                color:white;
                font-weight:bold;
                cursor:pointer;
            ">
                ✓ Aplicar e fechar
            </button>

        </div>
    `;

    document.body.appendChild(painel);

    document.getElementById("girar-esquerda").addEventListener("click", function () {
        rotacaoAtual -= 90;
        atualizarImagem();
    });

    document.getElementById("girar-direita").addEventListener("click", function () {
        rotacaoAtual += 90;
        atualizarImagem();
    });

    document.getElementById("girar-180").addEventListener("click", function () {
        rotacaoAtual += 180;
        atualizarImagem();
    });

    document.getElementById("resetar-rotacao").addEventListener("click", function () {
        rotacaoAtual = 0;
        atualizarImagem();
    });

    document.getElementById("fechar-rotacao").addEventListener("click", function () {
        painel.remove();
    });
}

   function ajustar() {
    if (!imagemAtual) {
        carregarImagem();
        return;
    }

    let painel = document.getElementById("painel-ajustes");

    if (painel) {
        painel.remove();
    }

    painel = document.createElement("div");
    painel.id = "painel-ajustes";

    painel.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 360px;
            padding: 25px;
            background: #10082b;
            border: 1px solid #a855f7;
            border-radius: 18px;
            box-shadow: 0 0 35px rgba(168, 85, 247, 0.5);
            z-index: 9999;
            color: white;
        ">

            <h2 style="margin-bottom: 25px;">
                ✨ Ajustes da imagem
            </h2>

            <label>
                ☀️ Brilho:
                <strong id="valor-brilho">100%</strong>
            </label>

            <input
                id="slider-brilho"
                type="range"
                min="50"
                max="150"
                value="100"
                style="width: 100%;"
            >

            <br><br>

            <label>
                ◐ Contraste:
                <strong id="valor-contraste">100%</strong>
            </label>

            <input
                id="slider-contraste"
                type="range"
                min="50"
                max="150"
                value="100"
                style="width: 100%;"
            >

            <br><br>

            <button
                id="fechar-ajustes"
                style="
                    width: 100%;
                    padding: 12px;
                    border: none;
                    border-radius: 10px;
                    background: linear-gradient(90deg, #7b2cff, #c13cff);
                    color: white;
                    font-weight: bold;
                    cursor: pointer;
                "
            >
                ✓ Aplicar ajustes
            </button>

        </div>
    `;

    document.body.appendChild(painel);

    const sliderBrilho = document.getElementById("slider-brilho");
    const sliderContraste = document.getElementById("slider-contraste");

    const valorBrilho = document.getElementById("valor-brilho");
    const valorContraste = document.getElementById("valor-contraste");

    function atualizarAjustes() {
        const brilho = sliderBrilho.value;
        const contraste = sliderContraste.value;

        valorBrilho.textContent = brilho + "%";
        valorContraste.textContent = contraste + "%";

        filtroAtual = `brightness(${brilho}%) contrast(${contraste}%)`;

        imagemAtual.style.filter = filtroAtual;
    }

    sliderBrilho.addEventListener("input", atualizarAjustes);
    sliderContraste.addEventListener("input", atualizarAjustes);

    document.getElementById("fechar-ajustes").addEventListener("click", function () {
        painel.remove();
    });
} 

function aplicarFiltro() {
    if (!imagemAtual) {
        carregarImagem();
        return;
    }

    const painel = document.createElement("div");

    painel.style.position = "fixed";
    painel.style.top = "50%";
    painel.style.left = "50%";
    painel.style.transform = "translate(-50%, -50%)";
    painel.style.width = "360px";
    painel.style.padding = "25px";
    painel.style.background = "#0e082b";
    painel.style.border = "1px solid #a855f7";
    painel.style.borderRadius = "18px";
    painel.style.boxShadow = "0 0 35px rgba(168, 85, 247, 0.5)";
    painel.style.zIndex = "9999";
    painel.style.color = "white";

    painel.innerHTML = `
        <h2 style="
            margin-bottom: 20px;
            color: white;
            text-align: center;
        ">
            ✨ Filtros da imagem
        </h2>

        <div style="
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
        ">

            <button class="filtro-opcao" data-filtro="none">
                🖼️ Original
            </button>

            <button class="filtro-opcao" data-filtro="grayscale(100%)">
                ⚫ Preto e branco
            </button>

            <button class="filtro-opcao" data-filtro="sepia(100%)">
                🟤 Sépia
            </button>

            <button class="filtro-opcao" data-filtro="contrast(150%)">
                ◐ Contraste
            </button>

            <button class="filtro-opcao" data-filtro="brightness(120%) saturate(140%)">
                ☀️ Vibrante
            </button>

            <button class="filtro-opcao" data-filtro="hue-rotate(180deg)">
                🔵 Frio
            </button>

        </div>

        <button id="fechar-filtros" style="
            width: 100%;
            margin-top: 20px;
            padding: 12px;
            border: none;
            border-radius: 10px;
            background: linear-gradient(90deg, #7b2cff, #c13cff);
            color: white;
            font-weight: bold;
            cursor: pointer;
        ">
            ✓ Aplicar e fechar
        </button>
    `;

    document.body.appendChild(painel);

    const botoesFiltro = painel.querySelectorAll(".filtro-opcao");

    botoesFiltro.forEach(function(botao) {

        botao.style.padding = "15px 10px";
        botao.style.border = "1px solid #a855f7";
        botao.style.borderRadius = "10px";
        botao.style.background = "#17103d";
        botao.style.color = "white";
        botao.style.cursor = "pointer";
        botao.style.fontWeight = "bold";

        botao.addEventListener("mouseenter", function() {
            botao.style.background = "#7b2cff";
            botao.style.transform = "translateY(-2px)";
        });

        botao.addEventListener("mouseleave", function() {
            botao.style.background = "#17103d";
            botao.style.transform = "translateY(0)";
        });

        botao.addEventListener("click", function() {

            filtroAtual = botao.dataset.filtro;

            imagemAtual.style.filter = filtroAtual;

            botoesFiltro.forEach(function(b) {
                b.style.border = "1px solid #a855f7";
            });

            botao.style.border = "2px solid white";
        });
    });

    document.getElementById("fechar-filtros").addEventListener("click", function() {
        painel.remove();
    });
}

function salvarVersao() {
    if (!imagemAtual) {
        alert("Primeiro selecione uma imagem.");
        return;
    }

    const versoes = document.querySelectorAll(".versoes .versao");

    if (versoes.length === 0) {
        return;
    }

    let versaoEncontrada = false;

    for (let i = 0; i < versoes.length; i++) {
        const miniatura = versoes[i].querySelector(".miniatura");

        if (miniatura && !miniatura.querySelector("img")) {

            let filtro = "none";

           if (i === 0) {
    filtro = "grayscale(100%)";
} else if (i === 1) {
    filtro = "sepia(70%)";
} else if (i === 2) {
    filtro = "contrast(150%)";
}   
            miniatura.innerHTML = `
                <img src="${imagemAtual.src}"
                     alt="Versão processada pela IA"
                     style="width:100%; height:100%; object-fit:cover; filter:${filtro};">
            `;

            versaoEncontrada = true;
           
        }
    }

    if (!versaoEncontrada) {
        const novaVersao = document.createElement("div");

        novaVersao.className = "versao";

        novaVersao.innerHTML = `
            <div class="miniatura">
                <img src="${imagemAtual.src}"
                     alt="Nova versão processada pela IA"
                     style="width:100%; height:100%; object-fit:cover; filter:contrast(120%);">
            </div>

            <button onclick="selecionarVersao(this)">
                Selecionar
            </button>
        `;

        document.querySelector(".versoes").appendChild(novaVersao);
    }

    alert("✨ Nova versão processada pela IA foi criada!");
}

function selecionarVersao(botao) {
    const botoes = document.querySelectorAll(".versoes button");
    const versoes = document.querySelectorAll(".versoes .versao");

    botoes.forEach(function (b) {
        b.textContent = "Selecionar";
    });

    versoes.forEach(function (versao) {
        versao.classList.remove("selecionada");
    });

    botao.textContent = "✓ Selecionada";

    const versaoSelecionada = botao.closest(".versao");

    if (versaoSelecionada) {
        versaoSelecionada.classList.add("selecionada");
    }

    alert("Versão selecionada para salvar!");
}
// ===== ZOOM DA IMAGEM =====

let nivelZoom = 100;

function atualizarZoom() {
    if (!imagemAtual) {
        return;
    }

    imagemAtual.style.transform = `rotate(${rotacaoAtual}deg) scale(${nivelZoom / 100})`;

    const valorZoom = document.getElementById("valor-zoom");
    valorZoom.textContent = nivelZoom + "%";
}

function aumentarZoom() {
    if (!imagemAtual) {
        alert("Selecione uma imagem primeiro.");
        return;
    }

    if (nivelZoom < 200) {
        nivelZoom += 10;
        atualizarZoom();
    }
}

function diminuirZoom() {
    if (!imagemAtual) {
        alert("Selecione uma imagem primeiro.");
        return;
    }

    if (nivelZoom > 50) {
        nivelZoom -= 10;
        atualizarZoom();
    }
}
// ===== SALVAR VERSÃO SELECIONADA =====

// ===== SALVAR VERSÃO SELECIONADA =====

function salvarVersaoSelecionada() {
    const versaoSelecionada = document.querySelector(".versao.selecionada");

    if (!versaoSelecionada) {
        alert("Selecione uma versão antes de salvar.");
        return;
    }

    const imagem = versaoSelecionada.querySelector(".miniatura img");

    if (!imagem) {
        alert("Gere uma versão com IA primeiro.");
        return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = imagem.naturalWidth;
    canvas.height = imagem.naturalHeight;

    ctx.filter = imagem.style.filter || "none";
    ctx.drawImage(imagem, 0, 0, canvas.width, canvas.height);

    const link = document.createElement("a");
    link.download = "ILLUME-versao.png";
    link.href = canvas.toDataURL("image/png");
    link.click();

    alert("Versão salva com sucesso!");
}