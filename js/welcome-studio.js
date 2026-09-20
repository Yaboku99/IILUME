document.addEventListener("DOMContentLoaded", () => {

    const welcomeScreen = document.getElementById("welcome-screen");
    const studioScreen = document.getElementById("studio-screen");
    const startButton = document.getElementById("start-button");

    const cameraButton = document.getElementById("camera-button");
    const mainCameraButton = document.getElementById("main-camera-button");

    const galleryButton = document.getElementById("gallery-button");
    const seeAllButton = document.getElementById("see-all-button");

    const imageInput = document.getElementById("image-input");
    const galleryPlaceholders = document.querySelectorAll(".gallery-placeholder");

    // Navegação entre Welcome e Meu Estúdio
    if (startButton && welcomeScreen && studioScreen) {
        startButton.addEventListener("click", () => {
            welcomeScreen.classList.add("screen-hidden");
            studioScreen.classList.remove("screen-hidden");
        });
    }

    // Câmera
    function abrirCamera() {
        const cameraScreen = document.getElementById("camera_screen");

        if (cameraScreen) {
            studioScreen.classList.add("screen-hidden");
            cameraScreen.classList.add("active");
        } else {
            console.log("Tela da câmera ainda não foi integrada.");
        }
    }

    if (cameraButton) {
        cameraButton.addEventListener("click", abrirCamera);
    }

    if (mainCameraButton) {
        mainCameraButton.addEventListener("click", abrirCamera);
    }

    // Galeria
    function abrirGaleria() {
        const galleryScreen = document.getElementById("gallery_screen");

        if (galleryScreen) {
            studioScreen.classList.add("screen-hidden");
            galleryScreen.classList.add("active");
        } else {
            console.log("Tela da galeria ainda não foi integrada.");
        }
    }

    if (galleryButton) {
        galleryButton.addEventListener("click", abrirGaleria);
    }

    if (seeAllButton) {
        seeAllButton.addEventListener("click", abrirGaleria);
    }

    // Importação de imagem
    if (imageInput) {
        imageInput.addEventListener("change", (event) => {
            const arquivo = event.target.files[0];

            if (!arquivo) {
                return;
            }

            if (!arquivo.type.startsWith("image/")) {
                alert("Selecione um arquivo de imagem.");
                imageInput.value = "";
                return;
            }

            const imagemURL = URL.createObjectURL(arquivo);

            if (galleryPlaceholders.length > 0) {
                const primeiroCard = galleryPlaceholders[0];

                primeiroCard.innerHTML = `
                    <img
                        src="${imagemURL}"
                        alt="${arquivo.name}"
                        class="imported-image"
                    >
                `;
            }

            console.log("Imagem importada:", arquivo.name);
        });
    }

});