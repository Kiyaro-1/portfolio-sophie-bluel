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
