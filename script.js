const API_KEY = "YOUR_MEDIASTACK_ACCESS_KEY";
const API_URL = "https://api.mediastack.com/v1/news";

const newsContainer = document.getElementById("news-container");
const savedContainer = document.getElementById("saved-container");
const loading = document.getElementById("loading");
const errorMessage = document.getElementById("error");
const searchInput = document.getElementById("search-input");
const refreshButton = document.getElementById("refresh-button");
const feedTitle = document.getElementById("feed-title");
const categoryList = document.getElementById("category-list");
const searchToggle = document.getElementById("search-toggle");
const closeSearch = document.getElementById("close-search");
const searchPanel = document.getElementById("search-panel");
const homeView = document.getElementById("home-view");
const savedView = document.getElementById("saved-view");
const settingsView = document.getElementById("settings-view");
const navItems = document.querySelectorAll(".nav-item");

let currentArticles = [];
let currentCategory = "general";
let savedArticles = JSON.parse(localStorage.getItem("savedArticles") || "[]");

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
        return ["http:", "https:"].includes(url.protocol) ? url.href : fallback;
    } catch {
        return fallback;
    }
}

function articleId(article) {
    return article.url || `${article.title}-${article.published_at}`;
}

function isSaved(article) {
    return savedArticles.some(savedArticle => articleId(savedArticle) === articleId(article));
}

function saveArticles() {
    localStorage.setItem("savedArticles", JSON.stringify(savedArticles));
}

function toggleSavedArticle(article) {
    if (isSaved(article)) {
        savedArticles = savedArticles.filter(savedArticle => {
            return articleId(savedArticle) !== articleId(article);
        });
    } else {
        savedArticles.unshift(article);
    }

    saveArticles();
    displayNews(currentArticles);
    displaySavedArticles();
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

function openSearchPanel() {
    searchPanel.hidden = false;
    searchToggle.setAttribute("aria-expanded", "true");
    searchInput.focus();
}

function closeSearchPanel() {
    searchPanel.hidden = true;
    searchToggle.setAttribute("aria-expanded", "false");
}

function formatDate(dateString) {
    if (!dateString) return "Date unavailable";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "Date unavailable";
    }

    return new Intl.DateTimeFormat("en-NZ", {
        dateStyle: "medium"
    }).format(date);
}

function createArticleCard(article) {
    const imageUrl = safeUrl(
        article.image,
        "https://placehold.co/800x450/172554/ffffff?text=Daily+News"
    );
    const title = escapeHtml(article.title || "Untitled article");
    const description = escapeHtml(article.description || "No description available.");
    const source = escapeHtml(article.source || "Unknown source");
    const url = safeUrl(article.url);
    const saved = isSaved(article);
    const encodedArticle = encodeURIComponent(JSON.stringify(article));

    return `
        <article class="news-card">
            <img class="news-image" src="${escapeHtml(imageUrl)}" alt="" loading="lazy">
            <div class="news-content">
                <div class="article-top-row">
                    <p class="article-source">${source}</p>
                    <button
                        class="save-button ${saved ? "saved" : ""}"
                        type="button"
                        data-article="${encodedArticle}"
                        aria-label="${saved ? "Remove saved article" : "Save article"}"
                    >
                        <svg aria-hidden="true" viewBox="0 0 24 24">
                            <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"></path>
                        </svg>
                    </button>
                </div>
                <h3>${title}</h3>
                <p class="article-description">${description}</p>
                <div class="article-footer">
                    <time>${formatDate(article.published_at)}</time>
                    <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">Read more</a>
                </div>
            </div>
        </article>
    `;
}

function addSaveButtonEvents(container) {
    container.querySelectorAll(".save-button").forEach(button => {
        button.addEventListener("click", () => {
            const article = JSON.parse(decodeURIComponent(button.dataset.article));
            toggleSavedArticle(article);
        });
    });
}

function displayNews(articles) {
    const searchTerm = searchInput.value.trim().toLowerCase();

    const filteredArticles = articles.filter(article => {
        const searchableText = [
            article.title,
            article.description,
            article.source
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        return searchableText.includes(searchTerm);
    });

    if (filteredArticles.length === 0) {
        newsContainer.innerHTML = `<p class="empty-message">No articles found.</p>`;
        return;
    }

    newsContainer.innerHTML = filteredArticles.map(createArticleCard).join("");
    addSaveButtonEvents(newsContainer);
}

function displaySavedArticles() {
    if (savedArticles.length === 0) {
        savedContainer.innerHTML = `
            <p class="empty-message">
                No saved articles yet. Tap the bookmark icon on a story to save it.
            </p>
        `;
        return;
    }

    savedContainer.innerHTML = savedArticles.map(createArticleCard).join("");
    addSaveButtonEvents(savedContainer);
}

function showView(viewName) {
    homeView.hidden = viewName !== "home";
    savedView.hidden = viewName !== "saved";
    settingsView.hidden = viewName !== "settings";

    navItems.forEach(item => {
        const active = item.dataset.view === viewName;
        item.classList.toggle("active", active);
        item.toggleAttribute("aria-current", active);
    });

    if (viewName === "categories") {
        homeView.hidden = false;
        openSearchPanel();
        return;
    }

    closeSearchPanel();

    if (viewName === "saved") {
        displaySavedArticles();
    }
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
            throw new Error(
                data.error?.message || `Request failed with status ${response.status}`
            );
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

searchToggle.addEventListener("click", () => {
    showView("home");
    openSearchPanel();
});

closeSearch.addEventListener("click", closeSearchPanel);

document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !searchPanel.hidden) {
        closeSearchPanel();
    }
});

navItems.forEach(item => {
    item.addEventListener("click", () => {
        showView(item.dataset.view);
    });
});

categoryList.addEventListener("click", event => {
    const button = event.target.closest(".category-button");

    if (!button) {
        return;
    }

    document.querySelectorAll(".category-button").forEach(item => {
        item.classList.toggle("active", item === button);
    });

    currentCategory = button.dataset.category;
    feedTitle.textContent = button.textContent;
    searchInput.value = "";
    showView("home");
    loadNews();
});

searchInput.addEventListener("input", () => {
    displayNews(currentArticles);
});

refreshButton.addEventListener("click", loadNews);

displaySavedArticles();
loadNews();