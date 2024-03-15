document.addEventListener("DOMContentLoaded", function () {
  // Check if there is a valid token
  const token = localStorage.getItem("accessToken");

  // Select elements
  const categories = document.getElementById("categories");
  const loginbtn = document.getElementById("loginbtn");
  const logoutbtn = document.getElementById("logoutbtn");
  const modify = document.getElementById("modify");

  // If there is a valid token, then the user is logged in
  if (token) {
    categories.style.display = "none";
    loginbtn.style.display = "none";
    logoutbtn.style.display = "block";
    modify.style.display = "block";
  } else {
    loginbtn.style.display = "block";
    logoutbtn.style.display = "none";
    modify.style.display = "none";
  }
});

logoutbtn.addEventListener("click", function () {
  // Clear the flag in local storage
  localStorage.removeItem("accessToken");

  // Redirect to the login page
  window.location.href = "login.html";
});

// recover works
const works = await fetch("http://localhost:5678/api/works").then((works) =>
  works.json()
);

//generate works
function generateworks(works) {
  const divgallery = document.querySelector(".gallery");
  divgallery.innerHTML = "";
  for (let i = 0; i < works.length; i++) {
    const workElement = document.createElement("figure");
    const imageElement = document.createElement("img");
    const nomElement = document.createElement("figcaption");

    imageElement.src = works[i].imageUrl;
    nomElement.innerText = works[i].title;

    divgallery.appendChild(workElement);
    workElement.appendChild(imageElement);
    workElement.appendChild(nomElement);
  }
}

//first Works display
generateworks(works);

//recover categories
const btns = await fetch("http://localhost:5678/api/categories").then((works) =>
  works.json()
);

//generate categories
function generatebuttons(btns) {
  const divfiltres = document.querySelector(".filtres");
  for (let i = 0; i < btns.length; i++) {
    const titleElement = document.createElement("h3");
    const linkElement = document.createElement("a");

    linkElement.innerText = btns[i].name;
    linkElement.id = btns[i].id;

    divfiltres.appendChild(titleElement);
    titleElement.appendChild(linkElement);
    linkElement.classList.add("button1");
  }
}

//first categories display
generatebuttons(btns);

//filtre buttons
const filtres = document.querySelectorAll(".button1");
for (let i = 0; i < filtres.length; i++) {
  filtres[i].setAttribute("data-category", i);
}

//filtre buttons style
filtres.forEach(function (filtre) {
  filtre.addEventListener("click", () => {
    for (let i = 0; i < filtres.length; i++) {
      filtres[i].className = filtres[i].className.replace(" selected", "");
    }
    filtre.classList.add("selected");
    const divgallery = document.querySelector(".gallery");
    divgallery.innerHTML = "";
    //Filter works
    const categoryId = filtre.getAttribute("data-category");
    const filterimages =
      categoryId === "0"
        ? works
        : works.filter(function (work) {
            return work.categoryId === parseInt(categoryId);
          });
    generateworks(filterimages);
  });
});

//Handle gallery modal
let modal = null;

//Open the modal
const openmodal = (worksForModal) => (e) => {
  e.preventDefault();
  const target = document.getElementById("modal");
  target.classList.remove("hidden");
  target.removeAttribute("aria-hidden");
  target.setAttribute("aria-modal", "true");
  modal = target;
  modal.addEventListener("click", closemodal);
  modal.querySelector(".js-modal-close").addEventListener("click", closemodal);
  modal
    .querySelector(".js-modal-stop")
    .addEventListener("click", stopPropagation);

  // Generate modal content with the provided works
  generateworksmodal(worksForModal);
};

//Handle Delete Work
const apiUrl = "http://localhost:5678/api/works";
async function deleteWork(index) {
  const workToDelete = works[index];
  const token = localStorage.getItem("accessToken");

  //check for authorization
  if (!token) {
    console.error("Authorization token not found.");
    return;
  }

  try {
    const response = await fetch(`${apiUrl}/${workToDelete.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    // Update works by removing the deleted work
    works.splice(index, 1);

    // Update the main page content
    generateworks(works);

    // Fetch updated works data
    const updatedResponse = await fetch("http://localhost:5678/api/works");
    const updatedWorks = await updatedResponse.json();

    // Update the modal content with the updated works
    generateworksmodal(updatedWorks);
  } catch (error) {
    console.error("Error deleting work:", error);
  }
}

async function generateworksmodal(worksForModal) {
  const divgallerymodal = document.querySelector(".gallery-modal");
  divgallerymodal.innerHTML = "";

  for (let i = 0; i < worksForModal.length; i++) {
    const containerElement = document.createElement("div");
    const imageElement = document.createElement("img");
    const deleteIcon = document.createElement("i");

    containerElement.className = "work-container";
    imageElement.src = worksForModal[i].imageUrl;
    deleteIcon.className = "fa-solid";
    deleteIcon.classList.add("fa-trash-can", "fa-sm");

    divgallerymodal.appendChild(containerElement);
    containerElement.appendChild(imageElement);
    containerElement.appendChild(deleteIcon);
    deleteIcon.addEventListener("click", function () {
      const workIndex = i;
      deleteWork(workIndex);
    });
  }
}

//Close gallery modal
/**
 *
 * @param {DOMEvent} e
 * @returns
 */
const closemodal = (e) => {
  if (modal === null) return;
  e.preventDefault();
  const target = document.getElementById("modal");
  target.classList.add("hidden");
  target.setAttribute("aria-hidden", "true");
  target.removeAttribute("aria-modal");
  target.removeEventListener("click", closemodal);
  target
    .querySelector(".js-modal-close")
    .removeEventListener("click", closemodal);
  target
    .querySelector(".js-modal-stop")
    .removeEventListener("click", stopPropagation);
  modal = null;
};

// Fetch works from API
const fetchWorks = async () => {
  try {
    const response = await fetch("http://localhost:5678/api/works");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const worksData = await response.json();
    // Call generateworksmodal initially with fetched works data
    generateworksmodal(worksData);
  } catch (error) {
    console.error("Error fetching works:", error);
  }
};
fetchWorks();

const stopPropagation = (e) => {
  e.stopPropagation();
};

document.querySelectorAll(".js-modal").forEach((a) => {
  a.addEventListener("click", async (e) => {
    // Fetch works data
    const response = await fetch("http://localhost:5678/api/works");
    const worksData = await response.json();

    // Open modal with the fetched works
    openmodal(worksData)(e);
  });
});

//handle Escape key closes modal
window.addEventListener("keydown", function (e) {
  if (e.key === "Escape" || e.key === "Esc") {
    closemodal(e);
    closemodal2(e);
  }
});

//Handle add-work modal
let modal2 = null;

//Open add-work modal
const openmodal2 = (e) => {
  e.preventDefault();
  const target = document.querySelector(e.target.getAttribute("href"));
  target.classList.remove("hidden");
  target.removeAttribute("aria-hidden");
  target.setAttribute("aria-modal", "true");
  modal2 = target;
  modal2.addEventListener("click", closemodal2);
  modal2
    .querySelector(".js-modal-close1")
    .addEventListener("click", closemodal2);
  modal2
    .querySelector(".js-modal-stop1")
    .addEventListener("click", stopPropagation);

  // Handle file input change event
  const fileInput = modal2.querySelector("#fileInput");
  fileInput.value = "";
  fileInput.addEventListener("change", function () {
    previewImage(fileInput);
  });
};

//Close add-work modal
const closemodal2 = (e) => {
  if (modal2 === null) return;
  e.preventDefault();
  modal2.classList.add("hidden");
  modal2.setAttribute("aria-hidden", "true");
  modal2.removeAttribute("aria-modal");
  modal2.removeEventListener("click", closemodal2);
  modal2
    .querySelector(".js-modal-close1")
    .removeEventListener("click", closemodal2);
  modal2
    .querySelector(".js-modal-stop1")
    .removeEventListener("click", stopPropagation);
  modal2 = null;
};

document.querySelectorAll(".js-modal-return").forEach((a) => {
  a.addEventListener("click", async (e) => {
    // Fetch works data
    const response = await fetch("http://localhost:5678/api/works");
    const worksData = await response.json();

    // Close add-work modal
    closemodal2(e);

    // Open modal with the fetched works
    openmodal(worksData)(e);
  });
});

document.querySelectorAll(".js-modal-add").forEach((a) => {
  a.addEventListener("click", async (e) => {
    // Fetch works data
    const response = await fetch("http://localhost:5678/api/works");
    const worksData = await response.json();

    // Open add-work modal
    openmodal2(e);

    // Close gallery modal
    closemodal(e);
  });
});

document
  .getElementById("confirmButton")
  .addEventListener("click", confirmImage);

// Fetching categories from API
fetch("http://localhost:5678/api/categories")
  .then((response) => response.json())
  .then((categories) => {
    const categorySelect = document.getElementById("category");

    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.text = "Select a category";
    emptyOption.style.color = "#999";
    categorySelect.add(emptyOption);

    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.text = category.name;
      categorySelect.add(option);
    });
  });

//image preview
function previewImage(input) {
  const imagePreview = document.getElementById("imagePreview");
  const preview = document.getElementById("preview");
  const otherElements = document.querySelectorAll(
    ".add-work-btn > *:not(#imagePreview)"
  );

  if (input.files && input.files[0]) {
    const reader = new FileReader();

    reader.onload = function (e) {
      preview.src = e.target.result;
      imagePreview.style.display = "block";

      // Hide other elements
      otherElements.forEach((element) => {
        element.style.display = "none";
      });
    };

    reader.readAsDataURL(input.files[0]);
  }
}

//Image validation
async function confirmImage() {
  const fileInput = document.getElementById("fileInput");
  const uploadError = document.getElementById("uploadError");
  const formData = new FormData();
  formData.append("image", fileInput.files[0]);
  formData.append("title", document.getElementById("title").value);
  formData.append("category", document.getElementById("category").value);

  try {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      console.error("Authorization token not found.");
      return;
    }

    const response = await fetch("http://localhost:5678/api/works", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      fileInput.value = "";
      document.getElementById("imagePreview").style.display = "none";
      const otherElements = document.querySelectorAll(
        ".add-work-btn > *:not(#imagePreview):not(#fileInput)"
      );
      otherElements.forEach((element) => {
        element.style.display = "";
      });
      clearForm();

      const updatedResponse = await fetch("http://localhost:5678/api/works");
      const updatedWorks = await updatedResponse.json();

      generateworksmodal(updatedWorks);

      generateworks(updatedWorks);
    } else {
      uploadError.style.display = "block";
      throw new Error("Network response was not ok");
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    uploadError.style.display = "block";
  }
}

function clearForm() {
  const form = document.getElementById("imageForm");
  form.reset();
}
