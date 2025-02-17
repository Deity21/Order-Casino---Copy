document.addEventListener("DOMContentLoaded", function () {
    console.log("Admin panel loaded!");

    // Logout confirmation
    document.querySelector(".logout").addEventListener("click", function (e) {
        if (!confirm("Are you sure you want to log out?")) {
            e.preventDefault();
        }
    });
});
