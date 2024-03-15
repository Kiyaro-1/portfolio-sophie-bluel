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
