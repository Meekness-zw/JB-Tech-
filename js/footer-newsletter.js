document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector(".jb-footer__newsletter-form");
  if (!form) return;

  const emailInput = form.querySelector('input[type="email"]');
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const email = emailInput.value.trim();
    if (!email) {
      return;
    }

    console.log("Subscribe:", email);
    alert("Thank you for subscribing to our newsletter!");
    emailInput.value = "";
  });
});

