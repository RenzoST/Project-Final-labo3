document.addEventListener("DOMContentLoaded", () => {
  const formEl = document.querySelector("#search-form");
  const searchEl = document.querySelector("#search-input");
  const paginationsEl = document.querySelector(".paginations ul");
  const containerEl = document.querySelector("#movies-container");
  const ordenEl = document.querySelector("#orden");

  const {
    VITE_API_URL: urlApi,
    VITE_API_KEY: keyApi,
    VITE_API_TOKEN: tokenApi,
  } = import.meta.env;

  let movieIds = [];

  let currentPage = parseInt(localStorage.getItem("currentPage")) || 1;
  const totalPages = 100;

  const buildApiUrl = (page = 1) =>
    `${urlApi}/movie/changes?api_key=${keyApi}&page=${page}`;
  const movieUrl = (id) => `${urlApi}/movie/${id}?api_key=${keyApi}`;
  const searchUrl = (query, page = 1) =>
    `${urlApi}/search/movie?api_key=${keyApi}&query=${query}&page=${page}`;

  const popularUrl = (page) =>
    `${urlApi}/movie/popular?api_key=${keyApi}&language=es-MX&page=${page}`;
  const topRatedUrl = (page) =>
    `${urlApi}/movie/top_rated?api_key=${keyApi}&language=es-MX&page=${page}`;
  const upcomingUrl = (page) =>
    `${urlApi}/movie/upcoming?api_key=${keyApi}&language=es-MX&page=${page}`;

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${tokenApi}`,
    },
  };

  // Funcion para obtener las peliculas mas populares
  const popularMovies = async (page) => {
    try {
      const response = await fetch(popularUrl(page), options);
      if (!response.ok) throw new Error("Error en la carga de datos");

      const data = await response.json();
      return (movieIds = data.results
        .filter((movie) => movie.adult === false) // Excluir las de contenido adulto
        .map((movie) => movie.id));
    } catch (err) {
      console.error(err);
    }
  };

  // Funcion para obtener las peliculas mejor calificadas
  const topRatedMovies = async (page) => {
    try {
      const response = await fetch(topRatedUrl(page), options);
      if (!response.ok) throw new Error("Error en la carga de datos");

      const data = await response.json();
      return (movieIds = data.results
        .filter((movie) => movie.adult === false) // Excluir las de contenido adulto
        .map((movie) => movie.id));
    } catch (err) {
      console.error(err);
    }
  };

  // Funcion para obtener las peliculas proximas
  const upcomingMovies = async (page) => {
    try {
      const response = await fetch(upcomingUrl(page), options);
      if (!response.ok) throw new Error("Error en la carga de datos");

      const data = await response.json();
      return (movieIds = data.results
        .filter((movie) => movie.adult === false) // Excluir las de contenido adulto
        .map((movie) => movie.id));
    } catch (err) {
      console.error(err);
    }
  };

  ordenEl.addEventListener("change", async (e) => {
    e.preventDefault();
    currentPage = 1; // Reiniciar a la primera página cuando se selecciona una nueva categoría
    searchMode = false; // Salir del modo de búsqueda
    searchQuery = ""; // Limpiar el término de búsqueda

    try {
      let moviesToRender = [];
      switch (e.target.value) {
        case "popular":
          moviesToRender = await popularMovies(currentPage);
          break;
        case "top-rated":
          moviesToRender = await topRatedMovies(currentPage);
          break;
        case "upcoming":
          moviesToRender = await upcomingMovies(currentPage);
          break;
        case "all":
        default:
          moviesToRender = await allMovies();
          break;
      }

      // Llama a `renderMovies` para mostrar las películas obtenidas
      if (moviesToRender && moviesToRender.length > 0) {
        const moviePromises = moviesToRender
          .slice(0, 20)
          .map((id) => getMovieDetails(id));
        const movies = await Promise.all(moviePromises);
        const validMovies = movies.filter((movie) => movie !== null);
        renderMovies(validMovies);
      } else {
        console.error(
          "No se encontraron películas para la opción seleccionada."
        );
      }

      updatePagination(); // Actualiza la paginación en función de los datos cargados
      updateActivePage();
    } catch (error) {
      console.error("Error al obtener las películas:", error);
    }
  });

  // Función para obtener los IDs de las películas en la página actual
  const allMovies = async () => {
    try {
      const response = await fetch(buildApiUrl(currentPage), options);
      if (!response.ok) throw new Error("Error en la carga de datos");

      const data = await response.json();
      return (movieIds = data.results
        .filter((movie) => movie.adult === false) // Excluir las de contenido adulto
        .map((movie) => movie.id));
    } catch (err) {
      console.error(err);
    }
  };

  // Función para obtener detalles de una película por su ID
  const getMovieDetails = async (id) => {
    try {
      const response = await fetch(movieUrl(id), options);
      if (!response.ok)
        throw new Error(`Error al obtener la película con ID: ${id}`);
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
      const moviePromises = movieIds
        .slice(0, 20)
        .map((id) => getMovieDetails(id)); // Limitamos a 20 resultados

      const movies = await Promise.all(moviePromises);
      let validMovies = movies.filter((movie) => movie !== null);

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
      const movies = data.results.filter((movie) => movie.adult === false); // Excluir contenido adulto

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

  if (formEl) {
    formEl.addEventListener("submit", async (e) => {
      e.preventDefault();
      currentPage = 1; // Reiniciar a la primera página en una nueva búsqueda o selección de categoría

      const query = searchEl.value.trim();
      const categoriaSeleccionada = ordenEl.value;

      if (query !== "") {
        // Si hay un término de búsqueda, realiza la búsqueda
        searchMode = true;
        searchQuery = query;
        await movieSearch(query);
      } else {
        // Si no hay un término de búsqueda, usa la categoría seleccionada
        searchMode = false;
        try {
          let peliculasParaMostrar = [];
          switch (categoriaSeleccionada) {
            case "popular":
              peliculasParaMostrar = await popularMovies(currentPage);
              break;
            case "top-rated":
              peliculasParaMostrar = await topRatedMovies(currentPage);
              break;
            case "upcoming":
              peliculasParaMostrar = await upcomingMovies(currentPage);
              break;
            case "all":
            default:
              peliculasParaMostrar = await allMovies();
              break;
          }

          if (peliculasParaMostrar && peliculasParaMostrar.length > 0) {
            const moviePromises = peliculasParaMostrar
              .slice(0, 20)
              .map((id) => getMovieDetails(id));
            const peliculas = await Promise.all(moviePromises);
            const peliculasValidas = peliculas.filter(
              (pelicula) => pelicula !== null
            );
            renderMovies(peliculasValidas);
          } else {
            console.error(
              "No se encontraron películas para la opción seleccionada."
            );
          }

          updatePagination();
          updateActivePage();
        } catch (error) {
          console.error("Error al obtener las películas:", error);
        }
      }
      searchEl.value = "";
    });
  } else {
    console.error("No se encuentra el formulario con id 'search-form'");
  }

  // Carga inicial
  updatePageAndFetchMovies();
});
