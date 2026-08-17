// https://api.mediastack.com/v1/news?access_key=f60e15503742451d72661e001d2504c1
const apiKey = "f60e15503742451d72661e001d2504c1";
const apiUrl = `https://api.mediastack.com/v1/news?categories=science,business,technology&access_key=${apiKey}&countries=us,nz,au&limit=5`;
const container = document.getElementById("news-container");

async function loadNews() {
  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    const data = await response.json();
    const articles = data.data || [];

    if (!articles.length) {
      container.innerHTML = "<p>No news articles found.</p>";
      return;
    }

    container.innerHTML = articles
      .map(
        (article) => `
          <article>
            <h3>${article.title || "Untitled"}</h3>
            <p>${article.description || "No description available."}</p>
            <a href="${article.url || '#'}" target="_blank" rel="noreferrer">Read more</a>
          </article>
        `
      )
      .join("");
  } catch (error) {
    console.error("Unable to load news:", error);
    container.innerHTML = `<p>Unable to load news: ${error.message}</p>`;
  }
}

loadNews();