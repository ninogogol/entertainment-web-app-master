// DOM elements
const trendingContainer = document.getElementById('trending-container')
const recommendedContainer = document.getElementById('recommended-container')
const h1 = document.querySelector('h1')
const h2 = document.querySelector('h2')
const search = document.getElementById('search')

const navigation = document.querySelectorAll('header nav ul li a')
const filterHome = document.getElementById('filter-home')
const filterMovie = document.getElementById('filter-movie')
const filterTVSeries = document.getElementById('filter-tv-series')
const filterBookmarks = document.getElementById('filter-bookmarks')

// Call the checkToken function
checkToken()


// Function to fetch trending shows from the server and display them
const getTrendingShows = () => {
  axios.get('/data', {
    headers: {Authorization: `Bearer ${localStorage.getItem('token')}`}
  })
    .then(axiosObj => {
      if(axiosObj.data.error) {
        console.log('Server Error', axiosObj.data.error)
      } else {
        const trendingShows = axiosObj.data.filter(shows => shows.isTrending)
        displayResults(trendingShows, trendingContainer)
      }
    })
    .catch(err => {
      console.log('Error', err.name, err.message)
    })
}

// Function to fetch all shows (!isTrending) from the server and display them
const getAllShows = () => {
  axios.get('/data', {
    headers: {Authorization: `Bearer ${localStorage.getItem('token')}`}
  })
    .then(axiosObj => {
      if(axiosObj.data.error) {
        console.log('Server Error', axiosObj.data.error)
      } else {
        const allShows = axiosObj.data.filter(shows => shows.isTrending === false)
        displayResults(allShows, recommendedContainer)
      }
    })
    .catch(err => {
      console.log('Error', err.name, err.message)
    })
}

// Function to fetch all Movies from the server and display them
const getMovies = () => {
  axios.get('/data', {
    headers: {Authorization: `Bearer ${localStorage.getItem('token')}`}
  })
    .then(axiosObj => {
      if(axiosObj.data.error) {
        console.log('Server Error', axiosObj.data.error)
      } else {
        const allMovies = axiosObj.data.filter(movies => movies.category === 'Movie')
        displayResults(allMovies, recommendedContainer)
      }
    })
    .catch(err => {
      console.log('Error', err.name, err.message)
    })
}

// Function to fetch all TV Series from the server and display them
const getTvSeries = () => {
  axios.get('/data', {
    headers: {Authorization: `Bearer ${localStorage.getItem('token')}`}
  })
    .then(axiosObj => {
      if(axiosObj.data.error) {
        console.log('Server Error', axiosObj.data.error)
      } else {
        const allTvSeries = axiosObj.data.filter(tvSeries => tvSeries.category === 'TV Series')
        displayResults(allTvSeries, recommendedContainer)
      }
    })
    .catch(err => {
      console.log('Error', err.name, err.message)
    })
}

// Function to fetch all Bookmarked shows from the server and display them
const getBookmarks = () => {
  axios.get('/data', {
    headers: {Authorization: `Bearer ${localStorage.getItem('token')}`},
    params: {bookmarks: 'true'}
  })
    .then(axiosObj => {
      if(axiosObj.data.error) {
        console.log('Server Error', axiosObj.data.error)
      } else {
        //Display bookmarked shows
        const bookmarked = axiosObj.data
        displayResults(bookmarked, recommendedContainer)
      }
    })
    .catch(err => {
      console.log('Error', err.name, err.message)
    })
}

/**
 * Toggles the bookmark status of a show by its ID. Sends a GET request to the
 * '/data' endpoint to check if the show is bookmarked and then sends a POST
 * request to the '/bookmark' endpoint with the updated bookmark status.
 * @param {string} showId - The ID of the show to toggle the bookmark status for.
 */
const toggleBookmark = (showId) => {
  axios.get('/data', {
    headers: {Authorization: `Bearer ${localStorage.getItem('token')}`},
    params: {bookmarks: 'true'}
  })
    .then(axiosObj => {
      const isBookmarked = axiosObj.data.some(show => show.id === showId)
      axios.post('/bookmark', {id: showId, bookmarked: !isBookmarked}, {
        headers: {Authorization: `Bearer ${localStorage.getItem('token')}`}
      })    
        .then(res => {
        console.log(res.data.message)
      })
        .catch(err => {
          console.log('Error', err.name, err.message)
        })
    })
    .catch(err => {
      console.log('Error', err.name, err.message)
    })
}

// Call the getTrendingShows and getAllshows functions to fetch and display trending movies
getTrendingShows()
getAllShows()


/**
 * @param {Array<Object} data 
 * @param {HTMLElement} container 
 * Displays movie data within the specified container element.
 */
const displayResults = (data, container) => {

  container.innerHTML = ''

  data.forEach(show => {
    
    const thumbnail = show.thumbnail.regular.medium
    const title = show.title
    const year = show.year
    const category = show.category
    const rating = show.rating

    const showElement = document.createElement('div')
    showElement.classList.add('show')
    showElement.innerHTML = `
      <img src=".${thumbnail}" alt="thumbnails">
      <div class="bookmark">
        <img src="../assets/icon-bookmark-empty.svg" alt="bookmark icon">
      </div>
      <div class="play">
        <img src="../assets/icon-play.svg" alt="play icon">
        <span>Play</span>
      </div>
      <div class="info">
        <p>${year}</p><span>•</span>
        <p><img src="../assets/icon-category-${category}.svg" alt="${category} icon">${category}</p>
        <span>•</span><p>${rating}</p>
      </div>
      <h3>${title}</h3>
    `
    container.appendChild(showElement)

    // click event listener to toggle the bookmark status and update its appearance
    const bookmarkIcon = showElement.querySelector('.bookmark')
    addBookmarkClickListener(show.id, bookmarkIcon)
  })
}


/** FILTER
Event listeners for filters: Home, Movies, TV Series, Bookmarks.
Updates displayed content and active navigation state based on filter.
*/
filterHome.addEventListener('click', () => {
  trendingContainer.style.display = null
  h1.style.display = null
  navigation.forEach(navItem => {
    navItem.classList.remove('active')
  })
  filterHome.classList.add('active')
  search.setAttribute('placeholder', 'Search for movies or TV series')
  getTrendingShows()
  getAllShows()
})

filterMovie.addEventListener('click', () => {
  navigation.forEach(navItem => {
    navItem.classList.remove('active')
  })
  filterMovie.classList.add('active')
  search.setAttribute('placeholder', 'Search for movies')
  trendingContainer.style.display = 'none'
  h1.style.display = 'none'
  h2.innerText = 'Movies'
  getMovies()
})

filterTVSeries.addEventListener('click', () => {
  navigation.forEach(navItem => {
    navItem.classList.remove('active')
  })
  filterTVSeries.classList.add('active')
  search.setAttribute('placeholder', 'Search for TV series')
  trendingContainer.style.display = 'none'
  h1.style.display = 'none'
  h2.innerText = 'TV Series'
  getTvSeries()
})

filterBookmarks.addEventListener('click', () => {
  navigation.forEach(navItem => {
    navItem.classList.remove('active')
  })
  filterBookmarks.classList.add('active')
  search.setAttribute('placeholder', 'Search for bookmarked shows')
  trendingContainer.style.display = 'none'
  h1.style.display = 'none'
  h2.innerText = 'Bookmarked Shows'
  getBookmarks()
})

/**
 * Adds a click event listener to the bookmark icon to toggle the bookmark status and update the icon's appearance.
 * 
 * @param {string} showId - The ID of the show for which the bookmark icon is being added.
 * @param {HTMLElement} bookmarkIcon - The DOM element representing the bookmark icon for the show.
 */
const addBookmarkClickListener = (showId, bookmarkIcon) => {
  bookmarkIcon.addEventListener('click', () => {
    toggleBookmark(showId)

    const imgElement = bookmarkIcon.querySelector('img')
    if(imgElement.src.includes('icon-bookmark-empty.svg')) {
      imgElement.src = '../assets/icon-bookmark-full.svg'
    } else {
      imgElement.src = '../assets/icon-bookmark-empty.svg'
    }
  })
}

/* LOG OUT function 
remove the 'token' from local storage and 
redirect the user to the login page.*/
document.getElementById('log-out').addEventListener('click', () => { 
  localStorage.removeItem('token')
  window.location.href = '/'
})

// The checkToken function checks if a token exists in the localStorage
function checkToken() {
  const token = localStorage.getItem('token')
  if(!token) {
    alert('Please sign in') 
    window.location.href = '/'
    console.log(window.location.href)
  }
}