document.addEventListener("DOMContentLoaded", function () {
    fetch('header.html')
        .then(response => response.text())
        .then(data => {
            const headerElement = document.getElementById('header');

            if (headerElement) {
                headerElement.innerHTML = data;

                if (typeof initLogin === 'function') {
                    initLogin();
                }

                if (typeof Login === 'function') {
                    Login();
                }

                if (typeof initSignup === 'function') {
                    initSignup();
                }

                if (typeof updateLoginState === 'function') {
                    updateLoginState();
                }
            }
        })
        .catch(error => console.error('Error loading header:', error));

    fetch('footer.html')
        .then(response => response.text())
        .then(data => {
            const footerElement = document.getElementById('footer');
            if (footerElement) {
                footerElement.innerHTML = data;
            }
        })
        .catch(error => console.error('Error loading footer:', error));
})