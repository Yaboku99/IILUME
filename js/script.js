<!--navegacao-->
<!--camera-->
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
<!--favoritos-->
<!--exclusao-->
<!--controles interacoes-->