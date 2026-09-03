//CONTACT FORM JAVASCRIPT

        const contactForm =
            document.getElementById("contact-form");

        const formMessage =
            document.getElementById("form-message");


        contactForm.addEventListener("submit", function(event) {

            event.preventDefault();

            formMessage.hidden = false;

            contactForm.reset();

        });