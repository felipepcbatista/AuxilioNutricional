document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');

    toggleButton.addEventListener('click', () => {
        nav.classList.toggle('active');
    });
    });
