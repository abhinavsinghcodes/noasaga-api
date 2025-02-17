require('dotenv').config();
const express = require('express');
const fs = require('fs').promises;  // Async fs
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Path to episodes.json
const episodesFilePath = path.join(__dirname, 'episodes.json');

app.use('/src', express.static(path.join(__dirname, 'src')));

// Middleware to parse JSON request bodies
app.use(express.json());

// Route to serve admin.html as the home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/admin.html'));
});

// Load anime data (this will be used in API routes)
async function loadAnimeData() {
  try {
    const data = await fs.readFile(episodesFilePath, 'utf-8');
    return JSON.parse(data).anime_list;
  } catch (error) {
    console.error('Error loading anime data:', error);
    throw new Error('Failed to load anime data');
  }
}

// Save updated anime data to episodes.json
async function saveAnimeData(animeData) {
  try {
    await fs.writeFile(episodesFilePath, JSON.stringify({ anime_list: animeData }, null, 2));
  } catch (error) {
    console.error('Error saving anime data:', error);
    throw new Error('Failed to save anime data');
  }
}

// Get entire anime data
app.get('/anime/data', async (req, res) => {
    try {
        const animeData = await loadAnimeData();
        if (animeData) {
            res.json(animeData);  // Send valid JSON
        } else {
            res.status(404).json({ error: 'No anime data found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to load anime data' });
    }
});

// Get anime list
app.get('/anime', async (req, res) => {
  try {
    const animeData = await loadAnimeData();
    const animeList = Object.keys(animeData);
    res.json({ animeList });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load anime list' });
  }
});

// Add Anime
// Server route for adding anime
app.post('/anime/add', async (req, res) => {
    const animeData = req.body.anime_list; // The entire anime list from the body

    // Make sure anime list data is provided
    if (!animeData) {
        return res.status(400).json({ error: 'Anime data is required' });
    }

    try {
        // Assuming `anime_list` is an object where each anime title is a key
        const animeName = Object.keys(animeData)[0]; // Get the first anime name

        // You can process further and save it to your database or JSON
        // Example: saving to a JSON file or database
        const existingData = await readAnimeData(); // Read the current data
        existingData[animeName] = animeData[animeName]; // Add the new anime data

        // Save back to JSON or database
        await saveAnimeData(existingData); // Replace this with your data saving method
        
        return res.status(200).json({ message: 'Anime added successfully' });
    } catch (err) {
        console.error('Error saving anime:', err);
        return res.status(500).json({ error: 'Failed to add anime' });
    }
});


// Admin Routes: Delete an anime from episodes.json
app.delete('/anime/delete/:animeName', async (req, res) => {
    const { animeName } = req.params;
  
    try {
      const animeData = await loadAnimeData();
      
      // Ensure the anime exists
      if (!animeData[animeName.toLowerCase()]) {
        return res.status(404).json({ error: 'Anime not found' });
      }
  
      // Delete the anime from data
      delete animeData[animeName.toLowerCase()];
      
      await saveAnimeData(animeData);  // Save updated data
  
      res.status(200).json({ message: 'Anime deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to delete anime' });
    }
  });
  
// Admin Routes: Edit an existing anime's data in episodes.json
app.put('/admin/anime/edit/:animeName', async (req, res) => {
  const { animeName } = req.params;
  const { updatedAnimeData } = req.body;

  try {
    const animeData = await loadAnimeData();

    if (!animeData[animeName.toLowerCase()]) {
      return res.status(404).json({ error: 'Anime not found' });
    }

    animeData[animeName.toLowerCase()] = updatedAnimeData;

    await saveAnimeData(animeData);  // Save updated data to file

    res.status(200).json({ message: 'Anime updated successfully', animeData: animeData[animeName.toLowerCase()] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update anime' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
