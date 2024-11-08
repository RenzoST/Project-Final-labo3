document.addEventListener("DOMContentLoaded", () => {

  const formEl = document.querySelector("#search-form");
  const searchEl = document.querySelector("#search-input");
  const paginationsEl = document.querySelector(".paginations ul");
  const containerEl = document.querySelector("#movies-container");
  
  const { VITE_API_URL: urlApi, VITE_API_KEY: keyApi, VITE_API_TOKEN: tokenApi } = import.meta.env;
  
  let movieIds = [];
  
  let currentPage = parseInt(localStorage.getItem("currentPage")) || 1;
  const totalPages = 100;
  
  const buildApiUrl = (page = 1) => `${urlApi}/movie/changes?api_key=${keyApi}&page=${page}`;
  const movieUrl = (id) => `${urlApi}/movie/${id}?api_key=${keyApi}`;
  const searchUrl = (query, page = 1) => `${urlApi}/search/movie?api_key=${keyApi}&query=${query}&page=${page}`;
  
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${tokenApi}`
    }
  };
  
  // Función para obtener los IDs de las películas en la página actual
  const allMovies = async () => {
    try {
      const response = await fetch(buildApiUrl(currentPage), options);
      if (!response.ok) throw new Error("Error en la carga de datos");
  
      const data = await response.json();
      return movieIds = data.results
        .filter(movie => movie.adult === false) // Excluir las de contenido adulto
        .map(movie => movie.id);
  
    } catch (err) {
      console.error(err);
    }
  };
  
  // Función para obtener detalles de una película por su ID
  const getMovieDetails = async (id) => {
    try {
      const response = await fetch(movieUrl(id), options);
      if (!response.ok) throw new Error(`Error al obtener la película con ID: ${id}`);
      return await response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  };
  
  // Función para obtener detalles de todas las películas en el array de IDs
  const renderAllMovieDetails = async () => {
    try {
      const movieIds = await allMovies();
      const moviePromises = movieIds.slice(0, 20).map(id => getMovieDetails(id)); // Limitamos a 20 resultados
  
      const movies = await Promise.all(moviePromises);
      let validMovies = movies.filter(movie => movie !== null);
  
      renderMovies(validMovies);
  
      updatePagination();
      updateActivePage();
    } catch (error) {
      console.error("Error al obtener los detalles de las películas:", error);
    }
  };
  
  
  
  // Función para renderizar películas en el contenedor
  const renderMovies = (movies) => {
    let peliculas = "";
    movies.forEach((pelicula) => {
      peliculas += `
        <a class="enlace" href="detalles.html?id=${pelicula.id}">
          <div class="pelicula">
            <img class="poster" src="https://image.tmdb.org/t/p/w500/${pelicula.poster_path}" alt="${pelicula.title}">
            <h3 class="titulo">${pelicula.title}</h3>
          </div>
        </a>
      `;
    });
    containerEl.innerHTML = peliculas;
  };
  
  let searchMode = false; // Estado para indicar si estamos en modo búsqueda
  let searchQuery = ""; // Almacena el término de búsqueda actual
  
  const movieSearch = async (query, page = 1) => {
    try {
      console.log(`Buscando películas para: ${query}, Página: ${page}`);
      const response = await fetch(searchUrl(query, page), options);
      if (!response.ok) throw new Error("Error en la búsqueda de películas");
  
      const data = await response.json();
      const movies = data.results.filter(movie => movie.adult === false); // Excluir contenido adulto
  
      renderMovies(movies);
      console.log("Películas encontradas:", data.results);
  
      // Establecer en modo de búsqueda y actualizar el término de búsqueda actual
      searchMode = true;
      searchQuery = query;
  
      updatePagination(data.total_pages);
      updateActivePage();
    } catch (error) {
      console.error("Error en la búsqueda:", error);
    }
  };
  
  // Actualiza la paginación en función de si estamos en modo búsqueda o no
  const updatePagination = () => {
    paginationsEl.innerHTML = "";
  
    const startPage = currentPage > 5 ? currentPage - 4 : 1;
    const endPage = startPage + 6;
  
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
  
    updateActivePage();
  };
  
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
  
  
  // Función para actualizar la página y obtener películas, con lógica de búsqueda
  const updatePageAndFetchMovies = () => {
    localStorage.setItem("currentPage", currentPage);
  
    if (searchMode) {
      movieSearch(searchQuery, currentPage); 
    } else {
      renderAllMovieDetails(); 
    }
  };
  
  // Evento del formulario de búsqueda
  if (formEl) {
    formEl.addEventListener("submit", (e) => {
      e.preventDefault();
      if (searchEl && searchEl.value !== "") {
        currentPage = 1; // Reiniciar a la primera página en una nueva búsqueda
        movieSearch(searchEl.value); 
        searchEl.value = "";
      }
    });
  } else {
    console.error("No se encuentra el formulario con id 'search-form'");
  }


  // Carga inicial
  updatePageAndFetchMovies();
});

