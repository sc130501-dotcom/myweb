document.addEventListener("DOMContentLoaded", function () {

    fetch('carousel.html')
        .then(response => response.text())
        .then(data => {
            const carouselElement = document.getElementById('carousel');
            if (carouselElement) {
                carouselElement.innerHTML = data;
                const myCarouselElement = document.querySelector('#bestCarousel');

                if (window.bootstrap && myCarouselElement) {
                    new bootstrap.Carousel(myCarouselElement, {
                        interval: 3000,
                        ride: 'carousel'
                    }

                    )
                }
            }
        })
        .catch(error => console.error('Error loading carousel:', error));
});