const params = new URLSearchParams(window.location.search);
const movieId = params.get("id");
const containerEl = document.getElementById("container");

const { VITE_API_URL: urlApi, VITE_API_KEY: keyApi, VITE_API_TOKEN: tokenApi } = import.meta.env;
const movieUrl = (id) => `${urlApi}/movie/${id}?api_key=${keyApi}`;
const trailerUrl = (id) => `${urlApi}/movie/${id}/videos?api_key=${keyApi}`;

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${tokenApi}`
  }
}

const getData = async () => {
  try {
    const response = await fetch(movieUrl(movieId), options);
    const data = await response.json();

    console.log(data);
    const videoResponse = await fetch(trailerUrl(movieId), options);
    const videoData = await videoResponse.json();

    // Busca el tráiler en los resultados
    const trailer = videoData.results.find(
      (video) => video.type === "Trailer" && video.site === "YouTube"
    );

    const pelicula = `
            <div class="pelicula">
                <img class="poster" src="https://image.tmdb.org/t/p/w500/${
                  data.poster_path
                }" alt="Poster de ${data.title}">
                <h3 class="titulo">${data.title}</h3>
                <p class="sinopsis">${data.overview}</p>
                <p class="fecha-lanzamiento">Fecha de lanzamiento: ${
                  data.release_date
                }</p>
                ${
                  trailer
                    ? `<iframe class="trailer" width="560" height="315" src="https://www.youtube.com/embed/${trailer.key}" frameborder="0" allowfullscreen></iframe>`
                    : "<p>No se encontró tráiler.</p>"
                }
            </div>
        `;
    containerEl.innerHTML = pelicula;
  } catch (error) {
    console.error("Error fetching data:", error);
    containerEl.innerHTML =
      "<p>Hubo un error al cargar los datos de la película. Por favor, intenta nuevamente más tarde.</p>";
  }
};

getData();
