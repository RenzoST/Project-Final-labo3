const params = new URLSearchParams(window.location.search);
const movieId = params.get("id");
const containerEl = document.getElementById("container");
const API_URL = `https://api.themoviedb.org/3/movie/${movieId}?api_key=247b47a57e4ab0a9d01e0aadd3f72a14&language=es-MX`;
const TRAILER_URL = `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=247b47a57e4ab0a9d01e0aadd3f72a14&language=es-MX`;

const getData = async () => {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    const videoResponse = await fetch(TRAILER_URL);
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
