const loginForm = document.getElementById('login-form')
const errorMsg = document.createElement('div')


loginForm.addEventListener('submit', (event) => {
  event.preventDefault()

  const email = document.getElementById('email').value
  const password = document.getElementById('password').value

  if(email === '') {
    errorMsg.className = 'error-msg-email'
    errorMsg.innerText = 'Can’t be empty'
    loginForm.prepend(errorMsg)
    return
  }
  if(password === '') {
    errorMsg.className = 'error-msg-password'
    errorMsg.innerText = 'Can’t be empty'
    loginForm.prepend(errorMsg)
    return
  }

  axios.post('/login', { username: email, password })
    .then(response => {
      const token = response.data.token
      localStorage.setItem('token', token)
      window.location.href = '/authenticated?token=' + token
    })
    .catch(error => {
      console.error('Login failed', error)
      alert('Incorrect email or password. Please try again.')
    })
})