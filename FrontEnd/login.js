document.addEventListener("DOMContentLoaded", function () {
  // Select the login form
  const loginForm = document.getElementById("loginform");
  // Select the error message
  const loginerror = document.getElementById("loginerror");

  // Add form submission event listener
  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent the default form submission

    // Get the email and password
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Make an API request
    try {
      const response = await fetch("http://localhost:5678/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const responseData = await response.json();

        // Assuming your API response has a property 'token'
        const token = responseData.token;

        // Store the token in localStorage for future use
        localStorage.setItem("accessToken", token);

        // Redirect to index.html when credentials are correct
        window.location.href = "index.html";
      } else {
        // Display an error message for non-200 status code
        loginerror.style.display = "block";
      }
    } catch (error) {
      // Handle any network or other errors
      console.error("Error:", error);
      loginerror.style.display = "block";
    }
  });
});
