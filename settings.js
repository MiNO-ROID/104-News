  //SETTINGS JAVASCRIPT

// APPEARANCE

const themeButtons = document.querySelectorAll("[data-theme]");

themeButtons.forEach(button => {
    button.addEventListener("click", function () {

        themeButtons.forEach(item => {
            item.classList.remove("active");
        });

        this.classList.add("active");

        if (this.dataset.theme === "dark") {
            document.body.classList.add("dark-mode");

            // Save dark mode
            localStorage.setItem("theme", "dark");

        } else {
            document.body.classList.remove("dark-mode");

            // Save light mode
            localStorage.setItem("theme", "light");
        }
    });
});


        // TEXT SIZE
        const textSizeButtons =
            document.querySelectorAll("[data-size]");

        textSizeButtons.forEach(button => {

            button.addEventListener("click", () => {

                textSizeButtons.forEach(item =>
                    item.classList.remove("active")
                );

                button.classList.add("active");

                document.body.classList.remove(
                    "text-small",
                    "text-medium",
                    "text-large"
                );

                document.body.classList.add(
                    "text-" + button.dataset.size
                );

            });

        });


        // SAVE SETTINGS
        document
            .getElementById("save-settings")
            .addEventListener("click", () => {

                const message =
                    document.getElementById("settings-message");

                message.textContent =
                    "✓ Your settings have been saved successfully.";

            });

            // APPLY SAVED THEME ON EVERY PAGE

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
}

