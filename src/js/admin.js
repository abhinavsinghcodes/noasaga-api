// admin.js

document.addEventListener('DOMContentLoaded', function() {
    const addAnimeForm = document.getElementById('add-anime-form');
    const animeList = document.getElementById('anime-list');
    const searchResults = document.getElementById('search-results');
    const deleteAnimeBtn = document.getElementById('delete-anime-btn');
    const searchAnimeBtn = document.getElementById('search-anime-btn');
    const editAnimeForm = document.getElementById('edit-anime-form');

    // Fetch anime data from the backend
    async function fetchAnimeData() {
        const response = await fetch('/anime/data');
        const data = await response.json();
        return data;
    }

    // Update Anime List on Admin Panel
    async function updateAnimeList() {
        const data = await fetchAnimeData();
        const animeData = Object.keys(data);  // Get the anime names
        animeList.innerHTML = '';
        animeData.forEach(anime => {
            const li = document.createElement('li');
            li.textContent = anime;
            animeList.appendChild(li);
        });
    }

    // Add Anime
    addAnimeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const animeName = document.getElementById('anime-name').value.trim();
        const animeData = document.getElementById('anime-data').value.trim();
    
        if (animeName && animeData) {
            try {
                const jsonData = JSON.parse(animeData); // Convert the string to JSON
                const response = await fetch('/anime/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ animeName, animeData: jsonData })
                });
    
                if (response.ok) {
                    alert('Anime added successfully!');
                    updateAnimeList();  // Refresh the anime list
                } else {
                    const errorData = await response.json();
                    alert('Error: ' + errorData.error);  // Show server error message
                }
            } catch (error) {
                alert('Invalid JSON format for Anime Data.');
            }
        } else {
            alert('Both anime name and data are required.');
        }
    });
    

    // Delete Anime
    deleteAnimeBtn.addEventListener('click', async () => {
        const animeNameToDelete = document.getElementById('anime-name-to-delete').value.trim();
        if (animeNameToDelete) {
            await fetch(`/anime/delete/${animeNameToDelete}`, {
                method: 'DELETE'
            });
            alert('Anime deleted successfully!');
            updateAnimeList();  // Refresh the anime list
        }
    });

    // Search Anime
    searchAnimeBtn.addEventListener('click', async () => {
        const searchQuery = document.getElementById('anime-search').value.trim();
        if (searchQuery) {
            const data = await fetchAnimeData();
            const results = Object.keys(data).filter(anime => anime.toLowerCase().includes(searchQuery.toLowerCase()));
            searchResults.innerHTML = '';
            results.forEach(result => {
                const li = document.createElement('li');
                li.textContent = result;
                searchResults.appendChild(li);
            });
        }
    });

    // Edit Anime
    editAnimeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const animeNameToEdit = document.getElementById('anime-name-to-edit').value.trim();
        const newAnimeData = document.getElementById('new-anime-data').value.trim();
    
        try {
          // Parse the JSON data to ensure it's valid
          const jsonData = JSON.parse(newAnimeData);
        
          // Make the PUT request to edit anime
          await fetch(`/anime/edit/${animeNameToEdit}`, {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ updatedAnimeData: jsonData })
          });
          alert('Anime updated successfully!');
          updateAnimeList();  // Refresh the anime list
        } catch (error) {
          console.error('Invalid JSON format', error);
          alert('Failed to update anime. Ensure the new data is in valid JSON format.');
        }
    });
  

    // Initial update of the Anime List when the page loads
    updateAnimeList();
});
