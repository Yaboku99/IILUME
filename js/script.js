<!--navegacao-->
<!--camera-->
<!--galeria-->
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
    }

];

let currentPhotoIndex = 0;

const mainImage = document.getElementById("main_image");

const thumbnailContainer =
    document.getElementById("thumbnail_container");

const favoriteButton =
    document.getElementById("favorite_button");

const deleteButton =
    document.getElementById("delete_button");

const shareButton =
    document.getElementById("share_button");

const infoButton =
    document.getElementById("info_button");

const photoInfo =
    document.getElementById("photo_info");

const photoName =
    document.getElementById("photo_name");


function renderThumbnails() {

    thumbnailContainer.innerHTML = "";


    galleryPhotos.forEach((photo, index) => {

        const image = document.createElement("img");

        image.src = photo.src;

        image.alt = photo.name;

        image.classList.add("thumbnail");

        if (index === currentPhotoIndex) {

            image.classList.add("active");

        }

        image.addEventListener("click", function () {

            selectPhoto(index);

        });


        thumbnailContainer.appendChild(image);

    });

}

function selectPhoto(index) {

    currentPhotoIndex = index;

    const selectedPhoto =
        galleryPhotos[index];

    mainImage.src =
        selectedPhoto.src;

    photoName.textContent =
        selectedPhoto.name;

    updateFavoriteButton();

    renderThumbnails();

}

function toggleFavorite() {

    const selectedPhoto =
        galleryPhotos[currentPhotoIndex];


    selectedPhoto.favorite =
        !selectedPhoto.favorite;


    updateFavoriteButton();

}

function updateFavoriteButton() {

    const selectedPhoto =
        galleryPhotos[currentPhotoIndex];

    if (selectedPhoto.favorite) {

        favoriteButton.textContent = "★";

    } else {

        favoriteButton.textContent = "☆";

    }

}

function togglePhotoInfo() {

    photoInfo.classList.toggle("hidden");

}

function sharePhoto() {

    const selectedPhoto =
        galleryPhotos[currentPhotoIndex];


    alert(
        "Compartilhamento simulado!\n\n" +
        "Foto: " +
        selectedPhoto.name
    );

}

function deletePhoto() {

    if (galleryPhotos.length === 0) {

        return;

    }


    const selectedPhoto =
        galleryPhotos[currentPhotoIndex];


    const confirmation =
        confirm(
            "Deseja excluir " +
            selectedPhoto.name +
            "?"
        );


    if (!confirmation) {

        return;

    }

    galleryPhotos.splice(
        currentPhotoIndex,
        1
    );

    if (galleryPhotos.length === 0) {

        mainImage.src = "";

        thumbnailContainer.innerHTML = "";

        photoName.textContent = "";

        return;

    }

    if (
        currentPhotoIndex >=
        galleryPhotos.length
    ) {

        currentPhotoIndex =
            galleryPhotos.length - 1;

    }


    selectPhoto(currentPhotoIndex);

}

favoriteButton.addEventListener(
    "click",
    toggleFavorite
);


infoButton.addEventListener(
    "click",
    togglePhotoInfo
);


shareButton.addEventListener(
    "click",
    sharePhoto
);


deleteButton.addEventListener(
    "click",
    deletePhoto
);

renderThumbnails();

selectPhoto(0);

<!--edicao-->
<!--ia simulada-->
<!--favoritos-->
<!--exclusao-->
<!--controles interacoes-->