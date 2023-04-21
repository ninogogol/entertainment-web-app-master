const loginForm = document.getElementById('login-form')

loginForm.addEventListener('submit', (event) => {
  event.preventDefault()

  const email = document.getElementById('email').value
  const password = document.getElementById('password').value

  axios.post('/login', { username: email, password })
    .then(response => {
      const token = response.data.token
      localStorage.setItem('token', token)
      window.location.href = '/authenticated'
    })
    .catch(error => {
      console.error('Login failed', error)
      alert('Login failed. Please check your email and password.')
    })
})