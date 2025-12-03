function togglePassword() {
    const pwd = document.getElementById("password");
    pwd.type = pwd.type === "password" ? "text" : "password";
}

document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const res = await axios.post("/login", {
            email,
            password,
        });

        if (res.data.success) {
            Swal.fire({
                icon: "success",
                title: "Login Successful",
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                window.location.href = res.data.redirectUrl;
            });
        } else {
            Swal.fire({
                icon: "error",
                title: "Login Failed",
                text: res.data.message
            });
        }

    } catch (err) {
        Swal.fire({
            icon: "error",
            title: "Server Error",
            text: "Please try again later"
        });
    }
});
