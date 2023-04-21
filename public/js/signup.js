const registerForm = document.getElementById('register-form')

registerForm.addEventListener('submit', (event) => {
  event.preventDefault()

  const email = document.getElementById('email').value
  const password = document.getElementById('password').value
  const repeatPassword = document.getElementById('repeatPassword').value

  if (password !== repeatPassword) {
    alert('The entered passwords do not match. Please check them and try again.')
    return
  }

  axios.post('/signup', { username: email, password, passwordRepeat: repeatPassword })
    .then(response => {
      if (response.status === 201) {
        alert('Registration successful. You will now be redirected to the login page.')
        window.location.href = '/login.html'
      } else {
        alert('Registration failed. Please try again.')
      }
    })
    .catch(error => {
      console.error('Registration failed', error)
      alert('Registration failed. Please try again.')
    })
})