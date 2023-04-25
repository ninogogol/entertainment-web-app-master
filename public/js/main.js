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

// Update the locally stored bookmark list
const loadBookmarks = () => {
  axios.get('/data', {
    headers: {Authorization: `Bearer ${localStorage.getItem('token')}`},
    params: {bookmarks: 'true'}
  })
    .then(axiosObj => {
      if(axiosObj.data.error) {
        console.log('Server Error', axiosObj.data.error)
      } else {
        bookmarks = axiosObj.data
      }
    })
    .catch(err => {
      console.log('Error', err.name, err.message)
    })
}

// Initialize bookmarks variable to null
let bookmarks = null

// Function to display all bookmarked shows if the global 'bookmarks' variable is not empty
const getBookmarks = () => {
      if(!bookmarks) {
        console.log('Bookmarks could not be loaded (Global variable bookmarks is empty)')
      } else {
        //Display bookmarked shows
        displayResults(bookmarks, recommendedContainer)
      }
}

/**
 * Checks if a show is in the bookmarks list by its ID.
 *
 * @param {string} showId The ID of the show to check for in the bookmarks list.
 * @returns {boolean} Returns true if the show is in the bookmarks list, otherwise returns false.
 */
const isBookmark = (showId) => bookmarks.some(show => show.id === showId)

/**
 * Toggles the bookmark status of a show by its ID. Sends a GET request to the
 * '/data' endpoint to check if the show is bookmarked and then sends a POST
 * request to the '/bookmark' endpoint with the updated bookmark status.
 * @param {string} showId - The ID of the show to toggle the bookmark status for.
 */
const toggleBookmark = (showId) => {

  const isBookmarked = isBookmark(showId)
  axios.post('/bookmark', {id: showId, bookmarked: !isBookmarked}, {
    headers: {Authorization: `Bearer ${localStorage.getItem('token')}`}
  })    
    .then(res => {
      console.log(res.data.message)
      loadBookmarks()
  })
    .catch(err => {
      console.log('Error', err.name, err.message)
    })

}

// Load bookmarks, trending shows, and all shows on page load
loadBookmarks()
getTrendingShows()
getAllShows()


/**
 * @param {Array<Object} data 
 * @param {HTMLElement} container 
 * Displays show data within the specified container element.
 */
const displayResults = (data, container) => {

  container.innerHTML = ''

  data.forEach(show => {

    const isBookmarked = isBookmark(show.id)
    const bookmarkIconName = isBookmarked ? 'icon-bookmark-full.svg' : 'icon-bookmark-empty.svg'
    
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
        <img src="../assets/${bookmarkIconName}" alt="bookmark icon">
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
  search.value = ''
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
  search.value = ''
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
  search.value = ''
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
  search.value = ''
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

/**
 * Searches for shows based on the search term and the active filter, and displays the results.
 * @param {function} displayResults A function that takes the filtered shows and a container element
 *                                  to display the results.
 */
const searchShows = (displayResults) => {
  search.addEventListener('input', () => {
    const searchTerm = search.value.toLowerCase();

    // Determine the active filter
    const activeFilter = document.querySelector('header nav ul li a.active')
    let filter
    if (activeFilter) {
      filter = activeFilter.id.replace('filter-', '')
    } else {
      filter = 'home'
    }

    axios.get('/data', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(axiosObj => {
        if (axiosObj.data.error) {
          console.log('Server Error', axiosObj.data.error)
        } else {
          let filteredShows

          // Filter shows based on the active filter and the search term
          switch (filter) {
            case 'home':
              filteredShows = axiosObj.data
              break
            case 'movie':
              filteredShows = axiosObj.data.filter(show => show.category === 'Movie')
              break
            case 'tv-series':
              filteredShows = axiosObj.data.filter(show => show.category === 'TV Series')
              break
            case 'bookmarks':
              filteredShows = bookmarks
              break
          }

          // Further filter the shows based on the search term
          filteredShows = filteredShows.filter(show => show.title.toLowerCase().includes(searchTerm))
          
          // Update the h2 element with the number of results found
          if (searchTerm) {
            h2.innerText = `Found ${filteredShows.length} results for '${searchTerm}'`
            trendingContainer.style.display = 'none'
            h1.style.display = 'none'
          } else {
            switch (filter) {
              case 'home':
                h2.innerText = 'Recommended'
                trendingContainer.style.display = null
                h1.style.display = null
                break
              case 'movie':
                h2.innerText = 'Movies'
                break
              case 'tv-series':
                h2.innerText = 'TV Series'
                break
              case 'bookmarks':
                h2.innerText = 'Bookmarked Shows'
                break
            }
          }
          
          // Display the filtered shows using the displayResults function
          displayResults(filteredShows, recommendedContainer)
        }
      })
      .catch(err => {
        console.log('Error', err.name, err.message)
      })
  })
}

searchShows(displayResults)

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
    // window.location.href = '/'
    // console.log(window.location.href)
  }
}