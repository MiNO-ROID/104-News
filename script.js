const API_KEY = "YOUR_API_KEY";
const API_URL = "https://newsapi.org/v2/top-headlines";
const COUNTRY = "us";

const newsContainer = document.getElementById("news-container");
const loading = document.getElementById("loading");
const errorMessage = document.getElementById("error");
const searchInput = document.getElementById("search-input");
const refreshButton = document.getElementById("refresh-button");
const feedTitle = document.getElementById("feed-title");
const categoryList = document.getElementById("category-list");

let currentArticles = [];
let currentCategory = "general";

function escapeHtml(value = "") {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function setLoading(isLoading) {
    loading.hidden = !isLoading;
    refreshButton.disabled = isLoading;
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.hidden = false;
}

function clearError() {
    errorMessage.textContent = "";
    errorMessage.hidden = true;
}

function formatDate(dateString) {
    if (!dateString) return "Date unavailable";

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "Date unavailable";

    return new Intl.DateTimeFormat("en-NZ", {
        dateStyle: "medium"
    }).format(date);
}

function displayNews(articles) {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const filteredArticles = articles.filter(article => {
        const searchableText = [
            article.title,
            article.description,
            article.source?.name
        ].filter(Boolean).join(" ").toLowerCase();

        return searchableText.includes(searchTerm);
    });

    if (filteredArticles.length === 0) {
        newsContainer.innerHTML = `<p class="empty-message">No articles found.</p>`;
        return;
    }

    newsContainer.innerHTML = filteredArticles.map(article => {
        const imageUrl = article.urlToImage || "https://placehold.co/800x450/172554/ffffff?text=Daily+News";
        const title = escapeHtml(article.title || "Untitled article");
        const description = escapeHtml(article.description || "No description available.");
        const source = escapeHtml(article.source?.name || "Unknown source");
        const url = escapeHtml(article.url || "#");

        return `
            <article class="news-card">
                <img class="news-image" src="${imageUrl}" alt="" loading="lazy">
                <div class="news-content">
                    <p class="article-source">${source}</p>
                    <h3>${title}</h3>
                    <p class="article-description">${description}</p>
                    <div class="article-footer">
                        <time>${formatDate(article.publishedAt)}</time>
                        <a href="${url}" target="_blank" rel="noopener noreferrer">Read more</a>
                    </div>
                </div>
            </article>
        `;
    }).join("");
}

async function loadNews() {
    setLoading(true);
    clearError();

    const params = new URLSearchParams({
        country: COUNTRY,
        apiKey: API_KEY
    });

    if (currentCategory !== "general") {
        params.set("category", currentCategory);
    }

    try {
        const response = await fetch(`${API_URL}?${params}`);
        const data = await response.json();

        if (!response.ok || data.status === "error") {
            throw new Error(data.message || `Request failed with status ${response.status}`);
        }

        currentArticles = Array.isArray(data.articles) ? data.articles : [];
        displayNews(currentArticles);
    } catch (error) {
        currentArticles = [];
        newsContainer.innerHTML = "";
        showError(`Unable to load news. ${error.message}`);
    } finally {
        setLoading(false);
    }
}

categoryList.addEventListener("click", event => {
    const button = event.target.closest(".category-button");
    if (!button) return;

    document.querySelectorAll(".category-button").forEach(item => {
        item.classList.toggle("active", item === button);
    });

    currentCategory = button.dataset.category;
    feedTitle.textContent = button.textContent;
    searchInput.value = "";
    loadNews();
});

searchInput.addEventListener("input", () => displayNews(currentArticles));
refreshButton.addEventListener("click", loadNews);

loadNews();
