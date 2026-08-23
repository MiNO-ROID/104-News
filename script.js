const API_KEY = "06aa2fbc275f46761c3e3f7ed69dc4f8";
const API_URL = "https://api.mediastack.com/v1/news";

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

function safeUrl(value, fallback = "#") {
    try {
        const url = new URL(value, window.location.href);
        return ["http:", "https:"].includes(url.protocol)
            ? url.href
            : fallback;
    } catch {
        return fallback;
    }
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
            article.source
        ].filter(Boolean).join(" ").toLowerCase();

        return searchableText.includes(searchTerm);
    });

    if (filteredArticles.length === 0) {
        newsContainer.innerHTML = `<p class="empty-message">No articles found.</p>`;
        return;
    }

    newsContainer.innerHTML = filteredArticles.map(article => {
        const imageUrl = safeUrl(article.image, "https://placehold.co/800x450/172554/ffffff?text=Daily+News");
        const title = escapeHtml(article.title || "Untitled article");
        const description = escapeHtml(article.description || "No description available.");
        const source = escapeHtml(article.source || "Unknown source");
        const url = safeUrl(article.url);

        return `
            <article class="news-card">
                <img class="news-image" src="${escapeHtml(imageUrl)}" alt="" loading="lazy">
                <div class="news-content">
                    <p class="article-source">${source}</p>
                    <h3>${title}</h3>
                    <p class="article-description">${description}</p>
                    <div class="article-footer">
                        <time>${formatDate(article.published_at)}</time>
                        <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">Read more</a>
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
        access_key: API_KEY,
        languages: "en",
        countries: "nz",
        limit: "20"
    });

    if (currentCategory !== "general") {
        params.set("categories", currentCategory);
    }

    try {
        const response = await fetch(`${API_URL}?${params}`);
        const data = await response.json();

        if (!response.ok || data.error) {
            throw new Error(data.error?.message || `Request failed with status ${response.status}`);
        }

        currentArticles = Array.isArray(data.data) ? data.data : [];
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
