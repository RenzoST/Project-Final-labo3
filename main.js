const searchEl = document.getElementById("search-input");
const formEl = document.getElementById("search-form");
const paginationsEl = document.querySelector(".paginations ul");
const containerEl = document.getElementById("movies-container");
const API_URL = `https://api.themoviedb.org/3/movie/popular?api_key=247b47a57e4ab0a9d01e0aadd3f72a14&language=es-MX&page=`;
const searchURL = `https://api.themoviedb.org/3/search/movie?api_key=247b47a57e4ab0a9d01e0aadd3f72a14&language=es-MX&query=`;

let currentPage = parseInt(localStorage.getItem("currentPage")) || 1;
const totalPages = 100; // Asumiendo 100 páginas para este ejemplo

// Función para obtener películas
const getMovies = async (url) => {
  try {
    const respuesta = await fetch(url);
    if (!respuesta.ok) {
      console.error("Error en la carga de datos");
      return;
    }
    const datos = await respuesta.json();
    // Se construye el HTML de las películas
    let peliculas = "";
    datos.results.forEach((pelicula) => {
      peliculas += `
      <a class="enlace" href="detalle_pelicula.html?id=${pelicula.id}">
      <div class="pelicula">
        <img class="poster" src="https://image.tmdb.org/t/p/w500/${pelicula.poster_path}">
        <h3 class="titulo">${pelicula.title}</h3>
      </div>
      </a>
      `;
    });
    containerEl.innerHTML = peliculas;
    // Actualizar página activa
    updateActivePage();
    updatePagination();
  } catch {
    console.error("Error");
  }
};

// Actualizar página activa
const updateActivePage = () => {
  const pages = paginationsEl.querySelectorAll("li[data-page]");
  pages.forEach((page) => {
    if (parseInt(page.getAttribute("data-page")) === currentPage) {
      page.classList.add("active");
    } else {
      page.classList.remove("active");
    }
  });
};

// Actualizar paginación
const updatePagination = () => {
  paginationsEl.innerHTML = "";

  const startPage = currentPage > 5 ? currentPage - 4 : 1;
  const endPage = currentPage > 5 ? currentPage + 1 : 5;

  if (currentPage > 1) {
    const prevLi = document.createElement("li");
    prevLi.id = "prev-btn";
    prevLi.innerText = "Anterior";
    paginationsEl.appendChild(prevLi);
    prevLi.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        updatePageAndFetchMovies();
      }
    });
  }

  for (let i = startPage; i <= endPage && i <= totalPages; i++) {
    const li = document.createElement("li");
    li.setAttribute("data-page", i);
    li.innerText = i;
    if (i === currentPage) {
      li.classList.add("active");
    }
    paginationsEl.appendChild(li);
    li.addEventListener("click", () => {
      currentPage = i;
      updatePageAndFetchMovies();
    });
  }

  if (currentPage < totalPages) {
    const nextLi = document.createElement("li");
    nextLi.id = "next-btn";
    nextLi.innerText = "Siguiente";
    paginationsEl.appendChild(nextLi);
    nextLi.addEventListener("click", () => {
      currentPage++;
      updatePageAndFetchMovies();
    });
  }
};

// Actualizar página y obtener películas
const updatePageAndFetchMovies = () => {
  localStorage.setItem("currentPage", currentPage);
  getMovies(API_URL + currentPage);
};

// Evento del formulario de búsqueda
formEl.addEventListener("submit", (e) => {
  e.preventDefault();
  const searchTerm = searchEl.value;
  if (searchTerm && searchTerm !== "") {
    getMovies(searchURL + searchTerm);
    searchEl.value = "";
  } else {
    window.location.reload();
  }
});

// Carga inicial
updatePageAndFetchMovies();
