const registerForm = document.getElementById('register-form')
const errorMsg = document.createElement('div')

registerForm.addEventListener('submit', (event) => {
  event.preventDefault()

  const email = document.getElementById('email').value
  const password = document.getElementById('password').value
  const repeatPassword = document.getElementById('repeatPassword').value

  if(!isValidEmail(email)) {
    errorMsg.className = 'error-msg-email'
    errorMsg.innerText = 'Invalid email address'
    registerForm.prepend(errorMsg)
    return
  }
  if (password !== repeatPassword) {
    alert('The entered passwords do not match. Please check them and try again.')
    return
  }
  if(email === '') {
    errorMsg.className = 'error-msg-email'
    errorMsg.innerText = 'Can’t be empty'
    registerForm.prepend(errorMsg)
    return
  }
  if(password === '') {
    errorMsg.className = 'error-msg-password'
    errorMsg.innerText = 'Can’t be empty'
    registerForm.prepend(errorMsg)
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

const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email)
}