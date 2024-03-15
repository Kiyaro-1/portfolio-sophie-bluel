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
const openmodal = (e) => {
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

      // Update the modal content
      generateworksmodal(works);

      // Update the main page content
      generateworks(works);
    } catch (error) {
      console.error("Error deleting work:", error);
    }
  }

  //generate works in the modal
  function generateworksmodal(works) {
    const divgallerymodal = document.querySelector(".gallery-modal");
    divgallerymodal.innerHTML = "";
    for (let i = 0; i < works.length; i++) {
      const containerElement = document.createElement("div");
      const imageElement = document.createElement("img");
      const deleteIcon = document.createElement("i");

      containerElement.className = "work-container";
      imageElement.src = works[i].imageUrl;
      deleteIcon.className = "fa-solid";
      deleteIcon.classList.add("fa-trash-can", "fa-sm");

      divgallerymodal.appendChild(containerElement);
      containerElement.appendChild(imageElement);
      containerElement.appendChild(deleteIcon);
      deleteIcon.addEventListener("click", function () {
        const workIndex = i; // Store the current index
        deleteWork(workIndex); // deleteWork function with the stored index
      });
    }
  }
  generateworksmodal(works);
};

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

const stopPropagation = (e) => {
  e.stopPropagation();
};

document.querySelectorAll(".js-modal").forEach((a) => {
  a.addEventListener("click", openmodal);
});

//handle Escape key closes modal
window.addEventListener("keydown", function (e) {
  if (e.key === "Escape" || e.key === "Esc") {
    closemodal(e);
    closemodal2(e);
  }
});
