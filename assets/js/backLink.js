const backLink = document.querySelector('.backLinkUrl')

if (backLink) {
  backLink.addEventListener('click', () => history.back())
}
