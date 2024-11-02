const allGamesEl = document.querySelector('#allgames');
const resultsEl = document.querySelector('#results');
const showMoreBtnEl = document.querySelector('#btn-show-more');
const searchEl = document.querySelector('#search');
const formEl = document.querySelector('form');

let page = 1;

const npcs = [];
const weapons = [];

const { VITE_API_URL: apiUrl, VITE_ACCESS_KEY: accessKey } = import.meta.env;


fetchNpcs()

async function fetchNpcs() 
{

  let inputData = searchEl.value;

  let url = new URL(apiUrl);
  url.searchParams.append("search", inputData);
  url.searchParams.append("key", accessKey);
  url.searchParams.append("page", page);

  if (page === 1) {
    resultsEl.innerHTML = "";
  }

  const response = await fetch(url);
  const { results } = await response.json();

  results?.map((result) => {
    const imageWrapper = document.createElement("article");
    imageWrapper.classList.add("search-result");

    const image = document.createElement("img");
    image.src = result.background_image;

    const name = document.createElement("h3");
    name.textContent = result.name;


    imageWrapper.appendChild(image);
    imageWrapper.appendChild(name);

    resultsEl.appendChild(imageWrapper);
  });

  if( results.length < 20 ){
    showMoreBtnEl.style.display = "none";
  }
  else{
    showMoreBtnEl.style.display = "block";
  }
  
  console.log(results);
  page++;

}

showMoreBtnEl.addEventListener("click", () => fetchNpcs());

formEl.addEventListener("submit", (e) => {
  e.preventDefault();
  page = 1;
  fetchNpcs();
});

