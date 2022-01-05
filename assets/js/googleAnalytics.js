const el = document.getElementById('google-analytics')

window.dataLayer = window.dataLayer || []
function gtag() {
  dataLayer.push(arguments)
}
gtag('js', new Date())

gtag('config', `${el.dataset.analytics}`)
