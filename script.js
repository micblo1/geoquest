// Intro Animation
window.onload = () => {
  const introScreen = document.getElementById("intro-screen");
  const homeScreen = document.getElementById("home-screen");
  const logo = document.getElementById("logo");
  const globe = document.getElementById("globe");
 
 
  document.getElementById("continue-btn").onclick = nextStep;
 
 
  setTimeout(() => {
    logo.style.animation = "fadeOut 1s ease-in-out forwards";
  }, 2500);
 
 
  setTimeout(() => {
    logo.style.display = "none";
    globe.style.opacity = "1";
    globe.style.animation = "spin 2s linear infinite";
  }, 3500);
 
 
  setTimeout(() => {
    globe.style.animation = "fadeOut 1s ease-in-out forwards";
  }, 5500);
 
 
  setTimeout(() => {
    introScreen.style.display = "none";
    homeScreen.style.display = "block";
    homeScreen.classList.remove("hidden");
    homeScreen.style.animation = "fadeIn 1s ease-in-out forwards";
  }, 6500);
 };
 
 
 function resetFeedbackScreen(lessonType) {
  const feedbackScreen = document.getElementById("feedback-screen");
  const feedbackTitle = document.getElementById("feedback-title");
  const feedbackMessage = document.getElementById("feedback-message");
  const correctLocationContainer = document.getElementById("correct-location-container");
  const feedbackFlagContainer = document.getElementById("correct-flag-image-container");

  // Reset feedback screen elements
  feedbackScreen.style.opacity = "0";
  feedbackScreen.style.display = "none"; // Hide it completely until ready
  feedbackTitle.textContent = '';
  feedbackMessage.textContent = '';
  
  if (correctLocationContainer) {
    correctLocationContainer.innerHTML = ''; // Clear old map data
    correctLocationContainer.style.display = "none"; // Hide the map container
  }
  if (feedbackFlagContainer) {
    feedbackFlagContainer.innerHTML = ''; // Clear old flag data
    feedbackFlagContainer.style.display = "none"; // Hide the flag container
  }

  // Reset content based on lesson type
  if (lessonType === "locate") {
    if (correctLocationContainer) {
      correctLocationContainer.style.display = "block"; // Show map container for locate lessons
    }
  } else if (lessonType === "flags") {
    if (feedbackFlagContainer) {
      feedbackFlagContainer.style.display = "block"; // Show flag container for flags lessons
    }
  }
}

 
 
 
 let startTime;
 let correctAnswers = 0;
 let totalQuestions = 0;
 let currentStep = 0;
 let currentSubStep = "info"; // Tracks whether the user is on "info", "question", or "feedback"
 let currentLessonKey = null; // Tracks the active lesson key
 let locateMap; // Leaflet map instance
 let selectedCountryCoordinates = null;
 
 
 
 
 window.addEventListener("resize", () => {
  if (locateMap) {
    locateMap.invalidateSize();
  }
 });
 
 
 function adjustFeedbackScreen() {
  const feedbackScreen = document.getElementById('feedback-screen');
  const viewportHeight = window.innerHeight;
 
 
  // Calculate max height, leaving room for padding
  const maxHeight = viewportHeight * 0.9; // 90% of viewport height
  feedbackScreen.style.maxHeight = `${maxHeight}px`;
 
 
  // Prevent scrolling by adjusting overflow
  if (feedbackScreen.scrollHeight > maxHeight) {
    feedbackScreen.style.overflowY = "hidden"; // Disable scrolling
  } else {
    feedbackScreen.style.overflowY = "auto"; // Allow scrolling if content fits
  }
 }
 
 
 // Call the function on page load and window resize
 window.addEventListener('load', adjustFeedbackScreen);
 window.addEventListener('resize', adjustFeedbackScreen);
 
 
 
 
 function startLocateLesson(country) {
  resetFeedbackScreen('locate');
  const mapLessonScreen = document.getElementById("map-lesson-screen");
  mapLessonScreen.style.display = "flex";
 
 
  // Initialize the map
  locateMap = L.map("map-container").setView([20, 80], 4); // Center on Asia
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
  }).addTo(locateMap);
 
 
  // Add click event to select a country
  locateMap.on("click", (e) => {
    selectedCountryCoordinates = [e.latlng.lat, e.latlng.lng];
 
 
    // Clear previous marker
    locateMap.eachLayer((layer) => {
      if (layer instanceof L.Marker) locateMap.removeLayer(layer);
    });
 
 
    // Add new marker
    L.marker(selectedCountryCoordinates).addTo(locateMap).bindPopup("Your Selection").openPopup();
  });
 }
 
 function submitLocate() {
  console.log("submitLocate() function triggered");

  if (!selectedCountryCoordinates || !selectedCountryCoordinates.length) {
    alert("Please select a country on the map before submitting!");
    return;
  }

  const currentLesson = lessons[currentLessonKey][currentStep];
  if (!currentLesson || !currentLesson.question || !currentLesson.question.correctCoordinates) {
    console.error("Lesson data is invalid or missing required fields.");
    return;
  }

  const correctLatLng = currentLesson.question.correctCoordinates;
  const correctCountry = currentLesson.name.replace(/\s*\(Repeat\)$/, ""); // Strip "(Repeat)"

  const isCorrect = selectedCountryName === correctCountry;
  console.log("Selected Country:", selectedCountryName);
  console.log("Correct Country:", correctCountry);

  // Update accuracy
  totalQuestions++;
  if (isCorrect) {
    correctAnswers++;
  }

  // Hide the map lesson screen
  const mapLessonScreen = document.getElementById("map-lesson-screen");
  mapLessonScreen.style.display = "none";

  // Show the feedback screen
  const feedbackScreen = document.getElementById("feedback-screen");
  const feedbackTitle = document.getElementById("feedback-title");
  const feedbackMessage = document.getElementById("feedback-message");
  feedbackScreen.style.display = "flex";
  feedbackScreen.style.opacity = "1";

  feedbackScreen.style.backgroundColor = isCorrect ? "#65AD67" : "#F2564B"; // Green for correct, red for incorrect
  feedbackTitle.innerText = isCorrect ? "Correct!" : "Incorrect!";

  feedbackMessage.innerText = isCorrect
    ? `You correctly located ${correctCountry}.`
    : `You selected ${selectedCountryName || "a location"}, ${Math.round(
        locateDistance(selectedCountryCoordinates[0], selectedCountryCoordinates[1], correctLatLng[0], correctLatLng[1])
      )} miles away from ${correctCountry}.`;

  // Reset and redraw the map in the feedback container
  const parent = document.getElementById("correct-location-container").parentNode;
  const oldContainer = document.getElementById("correct-location-container");
  parent.removeChild(oldContainer);

  const newContainer = document.createElement("div");
  newContainer.id = "correct-location-container";
  newContainer.style.width = "90%";
  newContainer.style.height = "450px";
  newContainer.style.margin = "20px auto";
  newContainer.style.borderRadius = "10px";
  newContainer.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3)";
  newContainer.style.backgroundColor = "#eaeaea";
  parent.appendChild(newContainer);

  const feedbackMap = L.map("correct-location-container", {
    zoomControl: true,
    attributionControl: false,
  });

  L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png",
    {
      subdomains: "abcd",
    }
  ).addTo(feedbackMap);

  // Highlight selected and correct countries
  fetch("world.geo.json-master/countries/countries.geo.json")
    .then((response) => response.json())
    .then((geojson) => {
      let selectedCountryLayer = null;
      let correctCountryLayer = null;

      const geoLayer = L.geoJSON(geojson, {
        style: (feature) => {
          if (feature.properties.name === selectedCountryName) {
            // Selected country (red if incorrect)
            return {
              color: isCorrect ? "#4CAF50" : "#FF5733", // Green for correct, red for incorrect
              weight: 1, // Thinner border
              opacity: 1,
              fillOpacity: 0.6,
              fillColor: isCorrect ? "#65AD67" : "#F2564B", // Green for correct, red for incorrect
            };
          } else if (feature.properties.name === correctCountry) {
            // Correct country (always green)
            return {
              color: "#4CAF50", // Green border
              weight: 1, // Thinner border
              opacity: 1,
              fillOpacity: 0.6,
              fillColor: "#65AD67", // Green fill
            };
          }
          return {
            // Non-highlighted countries (default)
            color: "#AAAAAA", // Light gray for borders
            weight: 0.5, // Very thin borders
            opacity: 0.8,
            fillOpacity: 0, // No fill
          };
        },
        onEachFeature: (feature, layer) => {
          // Store the layers for the selected and correct countries
          if (feature.properties.name === selectedCountryName) {
            selectedCountryLayer = layer;
          } else if (feature.properties.name === correctCountry) {
            correctCountryLayer = layer;
          }
        },
      }).addTo(feedbackMap);

      // Calculate bounds to fit both countries
      let bounds = null;
      if (selectedCountryLayer && correctCountryLayer) {
        const selectedBounds = selectedCountryLayer.getBounds();
        const correctBounds = correctCountryLayer.getBounds();
        bounds = selectedBounds.extend(correctBounds); // Combine both bounds
      } else if (selectedCountryLayer) {
        bounds = selectedCountryLayer.getBounds();
      } else if (correctCountryLayer) {
        bounds = correctCountryLayer.getBounds();
      }

      if (bounds) {
        feedbackMap.fitBounds(bounds, { padding: [20, 20] }); // Add padding around the bounds
      }
    })
    .catch((error) => console.error("Error loading GeoJSON:", error));
}


 
 // Helper function to format numbers with commas
 function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
 }
 
 
 // Helper function to format numbers with commas
 function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
 }
 
 
 
 
 // Helper function to format numbers with commas
 function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
 }
 
 
 
 
 function renderLocateQuestion(country) {
  console.log("Rendering locate question for:", country.name);
 
 
  const mapLessonScreen = document.getElementById("map-lesson-screen");
  const mapQuestion = document.getElementById("map-question");
 

   // Update question text without " (Repeat)"
   mapQuestion.innerText = `Locate ${country.name.replace(/\s*\(Repeat\)$/, "")} on this map`;

 
 
  // Show map lesson screen
  mapLessonScreen.style.display = "flex";
  mapLessonScreen.style.opacity = "1";
 
 
  // Remove any existing map instance
  if (locateMap) {
    console.log("Removing existing map instance.");
    locateMap.off();
    locateMap.remove();
  }
 
 
  // Initialize the map
  console.log("Initializing map...");
  locateMap = L.map("map-container", {
    zoomControl: true,
    scrollWheelZoom: true,
    attributionControl: false,
  }).setView([20, 0], 2);
 
 
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
  }).addTo(locateMap);
 
 
  // Ensure Leaflet adjusts to the correct dimensions after rendering
  setTimeout(() => {
    locateMap.invalidateSize();
  }, 200);
 
 
  // Add GeoJSON layer for interactivity
  fetch("world.geo.json-master/countries/countries.geo.json")
    .then((response) => response.json())
    .then((geojson) => {
      let selectedLayer = null;
 
 
      const geoLayer = L.geoJSON(geojson, {
        style: {
          color: "#595959", // Border color
          weight: 1,
          opacity: 0.8,
          fillOpacity: 0.2, // Default fill opacity
          fillColor: "#cce1ff", // Default fill color
        },
        onEachFeature: (feature, layer) => {
          layer.on({
            click: () => {
              // Capture selected country's center coordinates
              const bounds = layer.getBounds();
              selectedCountryCoordinates = [
                bounds.getCenter().lat,
                bounds.getCenter().lng,
              ];
              selectedCountryName = feature.properties.name;
 
 
              // Reset previously selected country style
              if (selectedLayer) {
                selectedLayer.setStyle({
                  fillColor: "#cce1ff", // Default fill color
                  fillOpacity: 0.2,    // Default fill opacity
                });
              }
 
 
              // Highlight the clicked country
              layer.setStyle({
                fillColor: "#7aa0de", // Light blue highlight
                fillOpacity: 0.8,    // Increase opacity
              });
 
 
              selectedLayer = layer; // Update the selected layer
 
 
              // Debugging logs
              console.log(`Selected country: ${selectedCountryName}`);
              console.log(`Selected coordinates: ${selectedCountryCoordinates}`);
            },
            mouseover: (e) => {
              const hoveredLayer = e.target;
              hoveredLayer.setStyle({
                weight: 2,
                color: "#666", // Darker border
                fillOpacity: 0.5,
              });
            },
            mouseout: (e) => {
              const hoveredLayer = e.target;
              if (hoveredLayer !== selectedLayer) {
                hoveredLayer.setStyle({
                  weight: 1,
                  color: "#595959", // Default border color
                  fillOpacity: 0.2, // Default fill opacity
                });
              }
            },
          });
        },
      }).addTo(locateMap);
    })
    .catch((error) => console.error("Error loading GeoJSON:", error));
 }
 
 
 // Function to reset styles for all countries
 function resetCountryStyles() {
  feedbackMap.eachLayer((layer) => {
    if (!(layer instanceof L.TileLayer)) feedbackMap.removeLayer(layer);
  });
 }
 
 
 function locateDistance(lat1, lng1, lat2, lng2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Radius of Earth in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
 
 
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
 
 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
 }
 
 
 
 
 
 
 
 
 // Lesson Data
 const lessons = {
  "Central America - Flags": [
    {
      name: "Panama",
      info: {
        description:
          "Panama is a country on the isthmus linking Central and South America. The Panama Canal, a famous feat of human engineering, cuts through its center, linking the Atlantic and Pacific oceans to create an essential shipping route.",
        map: "assets/panama-map.png",
        flag: "assets/panama-flag.png",
        details: {
          Capital: "Panama City",
          Area: "29,157 sq miles",
          Population: "4.4 Million",
          Language: "Spanish",
        },
      },
      question: {
        text: "Which is Panama's Flag?",
        options: [
          { src: "assets/bhutan-flag.png", correct: false },
          { src: "assets/panama-flag.png", correct: true },
          { src: "assets/nicaragua-flag.png", correct: false },
          { src: "assets/belize-flag.png", correct: false },
        ],
      },
    },
    {
      name: "Honduras",
      info: {
        description:
          "Honduras is located in Central America, bordered by Guatemala, El Salvador, and Nicaragua. Known for its rich natural resources, Honduras is home to Mayan ruins, rainforests, and beautiful beaches.",
        map: "assets/honduras-map.png",
        flag: "assets/honduras-flag.png",
        details: {
          Capital: "Tegucigalpa",
          Area: "43,433 sq miles",
          Population: "10 Million",
          Language: "Spanish",
        },
      },
      question: {
        text: "Which is Honduras's Flag?",
        options: [
          { src: "assets/netherlands-flag.png", correct: false },
          { src: "assets/france-flag.png", correct: false },
          { src: "assets/honduras-flag.png", correct: true },
          { src: "assets/spain-flag.png", correct: false },
        ],
      },
    },
    {
      name: "Belize",
      info: {
        description:
          "Belize is a nation on the eastern coast of Central America, with Caribbean Sea shorelines to the east and dense jungle to the west. Offshore, the massive Belize Barrier Reef, dotted with hundreds of low-lying islands called cayes, hosts rich marine life. Belize’s jungle areas are home to Mayan ruins.",
        map: "assets/belize-map.png",
        flag: "assets/belize-flag.png",
        details: {
          Capital: "Belmopan",
          Area: "22,966 sq miles",
          Population: "410,000",
          Language: "Spanish",
        },
      },
      question: {
        text: "Which is Belize's Flag?",
        options: [
          { src: "assets/belize-flag.png", correct: true },
          { src: "assets/nicaragua-flag.png", correct: false },
          { src: "assets/honduras-flag.png", correct: false },
          { src: "assets/spain-flag.png", correct: false },
        ],
      },
    },
    {
      name: "Panama (Repeat)",
      question: {
        text: "Can you remember which is Panama's Flag?",
        options: [
          { src: "assets/netherlands-flag.png", correct: false },
          { src: "assets/panama-flag.png", correct: true },
          { src: "assets/france-flag.png", correct: false },
          { src: "assets/spain-flag.png", correct: false },
        ],
      },
    },
    {
      name: "Nicaragua",
      info: {
        description:
          "Nicaragua, set between the Pacific Ocean and the Caribbean Sea, is a Central American nation known for its dramatic terrain of lakes, volcanoes and beaches. Vast Lake Managua and the iconic stratovolcano Momotombo sit north of the capital Managua.",
        map: "assets/nicaragua-map.png",
        flag: "assets/nicaragua-flag.png",
        details: {
          Capital: "Managua",
          Area: "50,340 sq miles",
          Population: "7 Million",
          Language: "Spanish",
        },
      },
      question: {
        text: "Which is Nicaragua's Flag?",
        options: [
          { src: "assets/belize-flag.png", correct: false },
          { src: "assets/nicaragua-flag.png", correct: true },
          { src: "assets/bhutan-flag.png", correct: false },
          { src: "assets/honduras-flag.png", correct: false },
        ],
      },
    },
    {
      name: "Honduras (Repeat)",
      question: {
        text: "Can you remember which is Honduras's Flag?",
        options: [
          { src: "assets/honduras-flag.png", correct: true },
          { src: "assets/panama-flag.png", correct: false },
          { src: "assets/nicaragua-flag.png", correct: false },
          { src: "assets/ireland-flag.png", correct: false },
        ],
      },
    },
    {
      name: "Costa Rica",
      info: {
        description:
          "Costa Rica is a rugged, rainforested Central American country with coastlines on the Caribbean and Pacific. Though its capital, San Jose, is home to cultural institutions like the Pre-Columbian Gold Museum, Costa Rica is known for its beaches, volcanoes, and biodiversity. Roughly a quarter of its area is made up of protected jungle, teeming with wildlife including spider monkeys and quetzal birds",
        map: "assets/costarica-map.png",
        flag: "assets/costarica-flag.png",
        details: {
          Capital: "San José",
          Area: "19,730 sq miles",
          Population: "5.2 Million",
          Language: "Spanish",
        },
      },
      question: {
        text: "Which is Costa Rica's Flag?",
        options: [
          { src: "assets/belize-flag.png", correct: false },
          { src: "assets/nicaragua-flag.png", correct: false },
          { src: "assets/costarica-flag.png", correct: true },
          { src: "assets/elsalvador-flag.png", correct: false },
        ],
      },
    },
    {
      name: "El Salvador",
      info: {
        description:
          "El Salvador is the smallest and most densely populated of the seven Central American countries. Despite having little level land, it traditionally was an agricultural country, heavily dependent upon coffee exports. By the end of the 20th century, however, the service sector had come to dominate the economy. It is known also as 'the land of the valcanoes', as it has many.",
        map: "assets/elsalvador-map.png",
        flag: "assets/elsalvador-flag.png",
        details: {
          Capital: "San Salvador",
          Area: "8,123 sq miles",
          Population: "6.3 Million",
          Language: "Spanish",
        },
      },
      question: {
        text: "Which is El Salvador's Flag?",
        options: [
          { src: "assets/guatemala-flag.png", correct: false },
          { src: "assets/belize-flag.png", correct: false },
          { src: "assets/honduras-flag.png", correct: false },
          { src: "assets/elsalvador-flag.png", correct: true },
          ],
        },
      },
      {
        name: "Guatemala",
        info: {
          description:
            "Guatemala is home to volcanoes, rainforests and ancient Mayan sites. The capital, Guatemala City, features the stately National Palace of Culture and the National Museum of Archaeology and Ethnology. Antigua, west of the capital, contains preserved Spanish colonial buildings. Lake Atitlán, formed in a massive volcanic crater, is surrounded by coffee fields and villages.",
          map: "assets/guatemala-map.png",
          flag: "assets/guatemala-flag.png",
          details: {
            Capital: "Guatemala City",
            Area: "42,043 sq miles",
            Population: "17.6 Million",
            Language: "Spanish",
          },
        },
        question: {
          text: "Which is Guatemala's Flag?",
          options: [
            { src: "assets/guatemala-flag.png", correct: true },
            { src: "assets/panama-flag.png", correct: false },
            { src: "assets/belize-flag.png", correct: false },
            { src: "assets/elsalvador-flag.png", correct: true },
            ],
          },
        },
        {
          name: "Belize (Repeat)",
          question: {
            text: "Can you remember which is Belize's Flag?",
            options: [
              { src: "assets/belize-flag.png", correct: true },
              { src: "assets/panama-flag.png", correct: false },
              { src: "assets/nicaragua-flag.png", correct: false },
              { src: "assets/ireland-flag.png", correct: false },
            ],
          },
        },
        {
          name: "Costa Rica (Repeat)",
          question: {
            text: "Can you remember which is Costa Rica's Flag?",
            options: [
              { src: "assets/guatemala-flag.png", correct: false },
              { src: "assets/honduras-flag.png", correct: false },
              { src: "assets/costarica-flag.png", correct: true },
              { src: "assets/panama-flag.png", correct: false },
            ],
          },
        },
        {
          name: "Nicaragua (Repeat)",
          question: {
            text: "Can you remember which is Nicaragua's Flag?",
            options: [
              { src: "assets/elsalvador-flag.png", correct: false },
              { src: "assets/nicaragua-flag.png", correct: true },
              { src: "assets/belize-flag.png", correct: false },
              { src: "assets/belgium-flag.png", correct: false },
            ],
          },
        },
        {
          name: "El Salvador (Repeat)",
          question: {
            text: "Can you remember which is El Salvador's Flag?",
            options: [
              { src: "assets/guatemala-flag.png", correct: true },
              { src: "assets/panama-flag.png", correct: false },
              { src: "assets/elsalvador-flag.png", correct: true },
              { src: "assets/ireland-flag.png", correct: false },
            ],
          },
        },
  ],
  "Western Europe - Flags": [
  {
    name: "Portugal",
    info: {
      description:
        "Portugal, located in Southern Europe, is known for its rich history, maritime heritage, and stunning coastlines. It is one of the oldest nations in Europe.",
      map: "assets/portugal-map.png",
      flag: "assets/portugal-flag.png",
      details: {
        Capital: "Lisbon",
        Area: "35,603 sq miles",
        Population: "10.3 Million",
        Language: "Portuguese",
      },
    },
    question: {
      text: "Which is Portugal's Flag?",
      options: [
        { src: "assets/netherlands-flag.png", correct: false },
        { src: "assets/france-flag.png", correct: false },
        { src: "assets/portugal-flag.png", correct: true },
        { src: "assets/spain-flag.png", correct: false },
      ],
    },
  },
  {
    name: "Netherlands",
    info: {
      description:
        "The Netherlands is renowned for its flat landscape, canals, tulip fields, windmills, and cycling routes. It is one of the most densely populated countries in Europe.",
      map: "assets/netherlands-map.png",
      flag: "assets/netherlands-flag.png",
      details: {
        Capital: "Amsterdam",
        Area: "16,040 sq miles",
        Population: "17.4 Million",
        Language: "Dutch",
      },
    },
    question: {
      text: "Which is the Netherlands's Flag?",
      options: [
        { src: "assets/netherlands-flag.png", correct: true },
        { src: "assets/france-flag.png", correct: false },
        { src: "assets/portugal-flag.png", correct: false },
        { src: "assets/spain-flag.png", correct: false },
      ],
    },
  },
  {
    name: "France",
    info: {
      description:
        "France is famous for its history, art, cuisine, and architecture. Paris, its capital, is home to iconic landmarks such as the Eiffel Tower and the Louvre.",
      map: "assets/france-map.png",
      flag: "assets/france-flag.png",
      details: {
        Capital: "Paris",
        Area: "248,573 sq miles",
        Population: "67.39 Million",
        Language: "French",
      },
    },
    question: {
      text: "Which is France's Flag?",
      options: [
        { src: "assets/netherlands-flag.png", correct: false },
        { src: "assets/france-flag.png", correct: true },
        { src: "assets/spain-flag.png", correct: false },
        { src: "assets/germany-flag.png", correct: false },
      ],
    },
  },
  {
    name: "Portugal (Repeat)",
    question: {
      text: "Can you remember which is Portugal's Flag?",
      options: [
        { src: "assets/netherlands-flag.png", correct: false },
        { src: "assets/portugal-flag.png", correct: true },
        { src: "assets/spain-flag.png", correct: false },
        { src: "assets/france-flag.png", correct: false },
      ],
    },
  },
  {
    name: "United Kingdom",
    info: {
      description:
        "The United Kingdom, consisting of England, Scotland, Wales, and Northern Ireland, is known for its history, monarchy, and iconic landmarks like Big Ben and Stonehenge.",
      map: "assets/uk-map.png",
      flag: "assets/uk-flag.png",
      details: {
        Capital: "London",
        Area: "93,628 sq miles",
        Population: "67.33 Million",
        Language: "English",
      },
    },
    question: {
      text: "Which is the United Kingdom's Flag?",
      options: [
        { src: "assets/uk-flag.png", correct: true },
        { src: "assets/netherlands-flag.png", correct: false },
        { src: "assets/france-flag.png", correct: false },
        { src: "assets/germany-flag.png", correct: false },
      ],
    },
  },
  {
    name: "Netherlands (Repeat)",
    question: {
      text: "Can you remember which is the Netherlands's Flag?",
      options: [
        { src: "assets/netherlands-flag.png", correct: true },
        { src: "assets/france-flag.png", correct: false },
        { src: "assets/spain-flag.png", correct: false },
        { src: "assets/portugal-flag.png", correct: false },
      ],
    },
  },
  {
    name: "Spain",
    info: {
      description:
        "Spain is known for its diverse culture, historic landmarks, and vibrant festivals. It is home to famous cities such as Madrid and Barcelona.",
      map: "assets/spain-map.png",
      flag: "assets/spain-flag.png",
      details: {
        Capital: "Madrid",
        Area: "195,364 sq miles",
        Population: "47.35 Million",
        Language: "Spanish",
      },
    },
    question: {
      text: "Which is Spain's Flag?",
      options: [
        { src: "assets/spain-flag.png", correct: true },
        { src: "assets/france-flag.png", correct: false },
        { src: "assets/netherlands-flag.png", correct: false },
        { src: "assets/portugal-flag.png", correct: false },
      ],
    },
  },
  {
    name: "Ireland",
    info: {
      description:
        "Ireland, also known as the Emerald Isle, is known for its lush landscapes, rich folklore, and the vibrant city of Dublin.",
      map: "assets/ireland-map.png",
      flag: "assets/ireland-flag.png",
      details: {
        Capital: "Dublin",
        Area: "32,595 sq miles",
        Population: "5.01 Million",
        Language: "Irish, English",
      },
    },
    question: {
      text: "Which is Ireland's Flag?",
      options: [
        { src: "assets/ireland-flag.png", correct: true },
        { src: "assets/uk-flag.png", correct: false },
        { src: "assets/france-flag.png", correct: false },
        { src: "assets/spain-flag.png", correct: false },
      ],
    },
  },
  {
    name: "United Kingdom (Repeat)",
    question: {
      text: "Can you remember which is the United Kingdom's Flag?",
      options: [
        { src: "assets/uk-flag.png", correct: true },
        { src: "assets/ireland-flag.png", correct: false },
        { src: "assets/france-flag.png", correct: false },
        { src: "assets/spain-flag.png", correct: false },
      ],
    },
  },
  {
    name: "France (Repeat)",
    question: {
      text: "Can you remember which is France's Flag?",
      options: [
        { src: "assets/france-flag.png", correct: true },
        { src: "assets/spain-flag.png", correct: false },
        { src: "assets/netherlands-flag.png", correct: false },
        { src: "assets/uk-flag.png", correct: false },
      ],
    },
  },
  {
    name: "Spain (Repeat)",
    question: {
      text: "Can you remember which is Spain's Flag?",
      options: [
        { src: "assets/spain-flag.png", correct: true },
        { src: "assets/ireland-flag.png", correct: false },
        { src: "assets/netherlands-flag.png", correct: false },
        { src: "assets/france-flag.png", correct: false },
      ],
      },
    },
  ],
  "Southeast Asia - Locate": [
    {
      name: "Thailand",
      info: {
        description:
          "Thailand, located in Southeast Asia, is known for its tropical beaches, opulent royal palaces, ancient ruins, and ornate temples.",
          map: "assets/thailand-map.png",
          flag: "assets/thailand-flag.png",
        details: {
          Capital: "Bangkok",
          Area: "198,117 sq miles",
          Population: "69.8 Million",
          Language: "Thai",
        },
      },
      question: {
        text: "Locate Thailand on this map",
        correctCoordinates: [15.8700, 100.9925], // Thailand's location
      },
    },
    {
      name: "Vietnam",
      info: {
        description:
          "Vietnam is a Southeast Asian country on the South China Sea known for its beaches, rivers, Buddhist pagodas, and bustling cities.",
        map: "assets/vietnam-map.png",
        flag: "assets/vietnam-flag.png",
        details: {
          Capital: "Hanoi",
          Area: "127,881 sq miles",
          Population: "98.2 Million",
          Language: "Vietnamese",
        },
      },
      question: {
        text: "Locate Vietnam on this map",
        correctCoordinates: [14.0583, 108.2772], // Vietnam's location
      },
    },
    {
      name: "Indonesia",
      info: {
        description:
          "Indonesia is a Southeast Asian nation made up of thousands of volcanic islands, known for its diverse culture, Komodo dragons, and beautiful beaches.",
        map: "assets/indonesia-map.png",
        flag: "assets/indonesia-flag.png",
        details: {
          Capital: "Jakarta",
          Area: "735,358 sq miles",
          Population: "276.4 Million",
          Language: "Indonesian",
        },
      },
      question: {
        text: "Locate Indonesia on this map",
        correctCoordinates: [-0.7893, 113.9213], // Indonesia's location
      },
    },
    {
      name: "Philippines",
      info: {
        description:
          "The Philippines is an archipelago in Southeast Asia, known for its beautiful beaches, rich biodiversity, and vibrant culture. It consists of over 7,000 islands.",
        map: "assets/philippines-map.png",
        flag: "assets/philippines-flag.png",
        details: {
          Capital: "Manila",
          Area: "115,831 sq miles",
          Population: "114 Million",
          Language: "Filipino, English",
        },
      },
      question: {
        text: "Locate the Philippines on this map",
        correctCoordinates: [12.8797, 121.7740], // Philippines' location
      },
    },    
    {
      name: "Thailand (Repeat)",
      question: {
        text: "Can you locate Thailand again on this map?",
        correctCoordinates: [15.8700, 100.9925], // Thailand's location
      },
    },    
  ],
  "Central Asia - Locate": [
    {
      name: "Kazakhstan",
      info: {
        description:
          "Kazakhstan is the world's largest landlocked country, located in Central Asia, known for its vast steppes and nomadic culture.",
        map: "assets/kazakhstan-map.png",
        flag: "assets/kazakhstan-flag.png",
        details: {
          Capital: "Astana",
          Area: "1.05 million sq miles",
          Population: "19.4 Million",
          Language: "Kazakh, Russian",
        },
      },
      question: {
        text: "Locate Kazakhstan on this map",
        correctCoordinates: [48.0196, 66.9237], // Kazakhstan's location
      },
    },
    {
      name: "Uzbekistan",
      info: {
        description:
          "Uzbekistan, located in Central Asia, is known for its mosques, mausoleums, and the Silk Road, the ancient trade route linking China and the Mediterranean.",
        map: "assets/uzbekistan-map.png",
        flag: "assets/kazakhstan-flag.png",
        details: {
          Capital: "Tashkent",
          Area: "172,700 sq miles",
          Population: "35.5 Million",
          Language: "Uzbek",
        },
      },
      question: {
        text: "Locate Uzbekistan on this map",
        correctCoordinates: [41.3775, 64.5853], // Uzbekistan's location
      },
    },
    {
      name: "Kyrgyzstan",
      info: {
        description:
          "Kyrgyzstan is a Central Asian country along the Silk Road, the ancient trade route between China and the Mediterranean, known for its beautiful mountains.",
        map: "assets/kyrgyzstan-map.png",
        flag: "assets/kyrgyzstan-flag.png",
        details: {
          Capital: "Bishkek",
          Area: "77,181 sq miles",
          Population: "6.6 Million",
          Language: "Kyrgyz, Russian",
        },
      },
      question: {
        text: "Locate Kyrgyzstan on this map",
        correctCoordinates: [41.2044, 74.7661], // Kyrgyzstan's location
      },
    },
    {
      name: "Tajikistan",
      info: {
        description:
          "Tajikistan, located in Central Asia, is known for its rugged mountains, which are popular for hiking and climbing. The Fann Mountains, near the national capital of Dushanbe, have snow-capped peaks that rise over 5,000 meters.",
        map: "assets/tajikistan-map.png",
        flag: "assets/tajikistan-flag.png",
        details: {
          Capital: "Dushanbe",
          Area: "55,251 sq miles",
          Population: "9.5 Million",
          Language: "Tajik",
        },
      },
      question: {
        text: "Locate Tajikistan on this map",
        correctCoordinates: [38.8610, 71.2761], // Tajikistan's location
      },
    },
    {
      name: "Uzbekistan (Repeat)",
      question: {
        text: "Can you locate Uzbekistan again on this map?",
        correctCoordinates: [41.3775, 64.5853], // Uzbekistan's location
      },
    },    
  ],
 };
 
 
 
 
 function nextStep() {
  const countryInfoScreen = document.getElementById("country-info-screen");
  const flagLessonScreen = document.getElementById("flag-lesson-screen");
  const feedbackScreen = document.getElementById("feedback-screen");
  const mapLessonScreen = document.getElementById("map-lesson-screen");

  if (!currentLessonKey) {
    console.error("No active lesson key. Cannot proceed.");
    return;
  }

  // Hide the current sub-step screen
  if (currentSubStep === "info") {
    countryInfoScreen.style.display = "none";
  } else if (currentSubStep === "question" && currentLessonKey.includes("Flags")) {
    flagLessonScreen.style.display = "none";
  } else if (currentSubStep === "question" && currentLessonKey.includes("Locate")) {
    mapLessonScreen.style.display = "none";
  } else if (currentSubStep === "feedback") {
    feedbackScreen.style.display = "none";
  }

  // Check if this was the last feedback step in the lesson
  if (currentStep >= lessons[currentLessonKey].length - 1 && currentSubStep === "feedback") {
    console.log("End of lesson reached. Showing Lesson Complete screen.");
    showLessonComplete();
    return;
  }

  // Advance to the next sub-step or step
  if (currentSubStep === "feedback") {
    currentStep++;
    currentSubStep = lessons[currentLessonKey][currentStep]?.info
      ? "info"
      : lessons[currentLessonKey][currentStep]?.question
      ? "question"
      : null;
  } else if (currentSubStep === "info") {
    currentSubStep = lessons[currentLessonKey][currentStep]?.question ? "question" : "feedback";
  } else if (currentSubStep === "question") {
    currentSubStep = "feedback";
  }

  const currentLesson = lessons[currentLessonKey][currentStep];
  console.log("Proceeding to the next lesson step:", currentLesson);

  // Display the appropriate screen
  if (currentSubStep === "info") {
    renderInfoBox(currentLesson);
    countryInfoScreen.style.display = "flex";
  } else if (currentSubStep === "question" && currentLessonKey.includes("Flags")) {
    renderFlagQuestion(currentLesson);
    flagLessonScreen.style.display = "flex";
  } else if (currentSubStep === "question" && currentLessonKey.includes("Locate")) {
    renderLocateQuestion(currentLesson);
    mapLessonScreen.style.display = "flex";
  } else if (currentSubStep === "feedback") {
    feedbackScreen.style.display = "flex";
  }

  updateProgressBar();
}

 
 
 
 // Show Lesson Start UI
 function showLessonUI(lessonName, categoryType) {
  const uiCard = document.getElementById("dynamic-ui");
  const lessonTitle = document.getElementById("lesson-title");
 
 
  // Update the lesson title dynamically
  lessonTitle.innerText =
    categoryType === "locate"
      ? `Locate ${lessonName}'s Countries`
      : `Flags of ${lessonName}`;
 
 
  // Ensure UI is visible
  uiCard.style.display = "flex";
  uiCard.style.opacity = "1"; // Fully visible
  }
 
  function hideLessonScreens() {
    const screens = [
      document.getElementById("map-lesson-screen"),
      document.getElementById("flag-lesson-screen"),
      document.getElementById("country-info-screen"),
      document.getElementById("feedback-screen"),
    ];
  
    screens.forEach((screen) => {
      if (screen) {
        screen.style.display = "none";
        screen.style.opacity = "0";
      }
    });
  }
  
 
 
 // Hide Lesson Start UI
 function hideLessonUI(event) {
  const uiCard = document.getElementById("dynamic-ui");
  if (event.target === uiCard) {
    uiCard.style.display = "none";
  }
 }
 
 
 // Prevent Propagation
 function stopPropagation(event) {
  event.stopPropagation();
 }
 
 
 function displayFeedbackMap(selectedCountryName, correctCountryName) {
  if (!locateMap) return;

  // Clear all layers except the base tile layer
  locateMap.eachLayer((layer) => {
    if (!(layer instanceof L.TileLayer)) locateMap.removeLayer(layer);
  });

  locateMap.invalidateSize();

  // Fetch GeoJSON data for countries
  fetch("world.geo.json-master/countries/countries.geo.json")
    .then((response) => response.json())
    .then((geojson) => {
      // Highlight the selected country in red
      L.geoJSON(geojson, {
        style: (feature) => {
          if (feature.properties.name === selectedCountryName) {
            return {
              color: "#FF5733", // Red border for selected country
              weight: 2,
              opacity: 1,
              fillOpacity: 0.6,
              fillColor: "#F2564B", // Red fill for selected country
            };
          }
          return { color: "#D3D3D3", weight: 1, fillOpacity: 0 }; // Default style for other countries
        },
      }).addTo(locateMap);

      // Highlight the correct country in green
      L.geoJSON(geojson, {
        style: (feature) => {
          if (feature.properties.name === correctCountryName) {
            return {
              color: "#4CAF50", // Green border for correct country
              weight: 2,
              opacity: 1,
              fillOpacity: 0.6,
              fillColor: "#65AD67", // Green fill for correct country
            };
          }
          return null; // Do not render unrelated countries
        },
      }).addTo(locateMap);

      // Keep the view static to show the whole map
      locateMap.setView([20, 0], 2); // Center the map and set a zoom level to show the entire world
    })
    .catch((error) => console.error("Error loading GeoJSON:", error));
}

 
 // Start Lesson
 function startLesson() {
  resetFeedbackScreen('flags');
  const uiCard = document.getElementById("dynamic-ui");
  const homeScreen = document.getElementById("home-screen");
  const countryInfoScreen = document.getElementById("country-info-screen");
  const lessonHeader = document.getElementById("lesson-header");
  const progressBar = document.getElementById("progress-bar");
  const currentLessonText = document.getElementById("current-lesson");
  const selectedLessonName = document.getElementById("lesson-title").innerText;
 
 
  // Determine the active lesson key
  if (selectedLessonName.includes("Central America") && selectedLessonName.includes("Flags")) {
    currentLessonKey = "Central America - Flags";
  } else if (selectedLessonName.includes("Western Europe")) {
    currentLessonKey = "Western Europe - Flags";
  } else if (selectedLessonName.includes("Southeast Asia") && selectedLessonName.includes("Locate")) {
    currentLessonKey = "Southeast Asia - Locate";
  } else if (selectedLessonName.includes("Central Asia") && selectedLessonName.includes("Locate")) {
    currentLessonKey = "Central Asia - Locate";
  } else {
    alert("This lesson is not available yet.");
    return;
  }
 
 
  // Check if lesson key exists in lessons object
  if (!lessons[currentLessonKey]) {
    alert("This lesson is not available yet.");
    return;
  }
 
 
  // Reset variables and UI state
  startTime = new Date();
  correctAnswers = 0;
  totalQuestions = 0;
  currentStep = 0;
  currentSubStep = "info"; // Start with the Info Screen
  resetSelection();
 
 
  // Reset progress bar
  progressBar.style.width = "0%";
 
 
  // Update header and progress bar
  lessonHeader.style.display = "flex";
  currentLessonText.innerText = selectedLessonName;
  lessonHeader.style.opacity = "0";
  setTimeout(() => {
    lessonHeader.style.animation = "fadeIn 1s ease-in-out forwards";
  }, 100);
 
 
  // Render the first info box
  renderInfoBox(lessons[currentLessonKey][currentStep]);
 
 
  // Transition screens
  uiCard.style.display = "none";
  homeScreen.style.animation = "fadeOut 1s ease-in-out forwards";
  setTimeout(() => {
    homeScreen.style.display = "none";
    countryInfoScreen.classList.remove("hidden");
    countryInfoScreen.style.display = "flex";
    countryInfoScreen.style.justifyContent = "center";
    countryInfoScreen.style.alignItems = "center";
  }, 1000);
 }
 
 
 
 
 
 
 
 
 
 
 // Render Info Box
 function renderInfoBox(country) {
  const countryInfoScreen = document.getElementById("country-info-screen");
  const { name, info } = country;
 
 
  countryInfoScreen.querySelector("h2").innerText = name;
  countryInfoScreen.querySelector(".map-image").src = info.map;
  countryInfoScreen.querySelector(".flag-image").src = info.flag;
 
 
  const detailsHTML = Object.entries(info.details)
    .map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`)
    .join("");
  countryInfoScreen.querySelector(".country-details").innerHTML = detailsHTML;
 
 
  countryInfoScreen.querySelector(".country-description").innerText =
    info.description;
 }
 
 
 // Render Flag Question
 function renderFlagQuestion(country) {
  const flagLessonScreen = document.getElementById("flag-lesson-screen");
  const questionText = flagLessonScreen.querySelector("h2");
  const flagOptionsContainer = flagLessonScreen.querySelector(".flag-options");
 
 
  // Set the question text
  questionText.innerText = country.question.text;
 
 
  // Generate the options dynamically
  const optionsHTML = country.question.options
    .map(
      (option, index) =>
        `<div class="flag-option" onclick="selectFlag(this)" data-correct="${option.correct}">
          <img src="${option.src}" alt="Option ${index + 1}" />
        </div>`
    )
    .join("");
 
 
  // Add the options to the container
  flagOptionsContainer.innerHTML = optionsHTML;
 
 
  // Display the flag lesson screen
  flagLessonScreen.style.display = "flex";
  flagLessonScreen.style.opacity = "1";
 
 
  // Ensure the previous feedback or screens are hidden
  const feedbackScreen = document.getElementById("feedback-screen");
  feedbackScreen.style.display = "none";
  feedbackScreen.style.opacity = "0";
 
 
  // Reset selected flag state
  resetSelection();
 }
 
 
 
 
 function isCorrectFlagSelection(selectedFlag, options) {
  const selectedImage = selectedFlag.querySelector("img").src;
  return options.some((option) => option.correct && option.src === selectedImage);
 }
 
 
 
 
 // Select Flag
 let selectedFlag = null;
 let isCorrect = false;
 
 
 function selectFlag(element, correctness) {
  const flags = document.querySelectorAll(".flag-option");
  flags.forEach((flag) => flag.classList.remove("selected"));
  element.classList.add("selected");
 
 
  selectedFlag = element;
  isCorrect = correctness;
 }
 
 
 //submit flags answer
 function submitAnswer() {
  const feedbackScreen = document.getElementById("feedback-screen");
  const feedbackTitle = document.getElementById("feedback-title");
  const feedbackMessage = document.getElementById("feedback-message");
  const correctFlagImageContainer = document.getElementById("correct-flag-image-container");
  const flagLessonScreen = document.getElementById("flag-lesson-screen");
  const currentLesson = lessons[currentLessonKey][currentStep];

  if (!currentLesson?.question) {
    console.error("Invalid question. Moving to the next step.");
    nextStep();
    return;
  }

  if (!selectedFlag) {
    const userChoice = confirm(
      "You have not selected a flag. Click 'OK' to proceed as 'I don't know' or 'Cancel' to select an answer."
    );
    if (!userChoice) return; // Allow the user to select again
  }

  // Immediately hide the flag lesson screen
  flagLessonScreen.style.display = "none";

  resetFeedbackScreen("flags");

  const correctOption = currentLesson.question.options.find((option) => option.correct);
  const selectedFlagSrc = selectedFlag ? selectedFlag.querySelector("img").src : null;

  // Normalize URLs for comparison
  const isCorrect = selectedFlagSrc && selectedFlagSrc.endsWith(correctOption.src);

  // Clean up the country name by removing "(Repeat)"
  const countryName = currentLesson.name.replace(/\s*\(Repeat\)$/, "");

  feedbackScreen.style.display = "flex";
  feedbackScreen.style.opacity = "1";
  feedbackScreen.style.backgroundColor = isCorrect ? "#65AD67" : "#F2564B";
  feedbackTitle.innerText = isCorrect ? "Correct!" : "Incorrect!";
  feedbackMessage.innerText = isCorrect
    ? `You selected the correct flag for ${countryName}.`
    : `This is the correct flag for ${countryName}.`;

  // Add the correct flag image
  const correctFlagImage = document.createElement("img");
  correctFlagImage.src = correctOption.src;
  correctFlagImage.alt = `Correct flag of ${countryName}`;
  correctFlagImage.style.width = "150px";
  correctFlagImage.style.borderRadius = "8px";
  correctFlagImage.style.margin = "20px 0";
  correctFlagImage.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.3)";
  correctFlagImageContainer.appendChild(correctFlagImage);

  if (isCorrect) correctAnswers++;
  totalQuestions++;

  selectedFlag = null; // Reset selection
}


 
 // Show Lesson Complete Screen
 function showLessonComplete() {
  const lessonCompleteScreen = document.getElementById("lesson-complete-screen");
  const accuracyElement = document.getElementById("lesson-accuracy");
  const timeElement = document.getElementById("lesson-time");
 
 
  // Display the lesson-complete screen
  lessonCompleteScreen.style.display = "flex";
 
 
  // Calculate and show accuracy and time
  const endTime = new Date();
  const timeTaken = Math.floor((endTime - startTime) / 1000);
  const accuracy = totalQuestions > 0 ? Math.floor((correctAnswers / totalQuestions) * 100) : 0;
 
 
  accuracyElement.innerText = `Accuracy: ${accuracy}%`;
  timeElement.innerText = `Time: ${timeTaken} seconds`;
 }
 
 
 
 
 
 
 // Cool progress bar animation when the lesson is complete
 function animateProgressBarComplete() {
  const progressBar = document.getElementById("progress-bar");
  progressBar.style.transition = "none"; // Remove transition for flashing
  let flashCount = 0;
 
 
  const flashInterval = setInterval(() => {
    progressBar.style.backgroundColor = flashCount % 2 === 0 ? "#ffcc00" : "#4a90e2"; // Alternate colors
    flashCount++;
    if (flashCount > 6) {
      clearInterval(flashInterval);
      progressBar.style.transition = "width 0.5s ease"; // Restore transition
      progressBar.style.backgroundColor = "#4a90e2";
    }
  }, 300);
 }
 
 
 
 
 // Update progress bar after each valid step
 function updateProgressBar() {
  const progressBar = document.getElementById("progress-bar");
  const totalSteps = lessons[currentLessonKey]?.length * 3 || 1; // Info, Question, Feedback
  const completedSteps =
    currentStep * 3 + (currentSubStep === "info" ? 1 : currentSubStep === "question" ? 2 : 3);
 
 
  const progressPercent = Math.min((completedSteps / totalSteps) * 100, 100);
  progressBar.style.width = `${progressPercent}%`;
 
 
  // Trigger confetti if progress bar is full
  if (progressPercent === 100) {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
 
 
    setTimeout(() => {
      confetti({ particleCount: 75, spread: 100, origin: { y: 0.5 } });
    }, 500);
 
 
    setTimeout(() => {
      confetti({ particleCount: 50, spread: 120, origin: { y: 0.4 } });
    }, 1000);
  }
 }
 
 
 
 
 
 
 //exit lesson button
 let isReturningHome = false; // Add a flag to track transitions
 
 
 function exitLesson() {
  console.log("Exit Lesson button clicked");
 
 
  // Confirmation dialog
  const confirmExit = confirm("Are you sure you want to exit the lesson?");
  if (!confirmExit) return; // Exit if canceled
 
 
  // Reset all lesson-related screens
  resetScreens();
 
 
  // Reset the Home Screen
  const homeScreen = document.getElementById("home-screen");
  homeScreen.style.display = "block";
  homeScreen.style.opacity = "1";
  homeScreen.style.animation = "fadeIn 1s ease-in-out"; // Smooth fade-in
 
 
  // Fade out progress bar
  const progressBar = document.getElementById("progress-bar");
  if (progressBar) {
    progressBar.style.transition = "opacity 0.5s ease, width 0.5s ease"; // Smooth fade-out and shrink
    progressBar.style.opacity = "0"; // Fade out
    progressBar.style.width = "0%"; // Reset width
    setTimeout(() => {
      progressBar.style.transition = "width 0.5s ease"; // Restore width transition after reset
      progressBar.style.opacity = "1"; // Reset opacity for next use
    }, 500); // Match fade duration
  }
 
 
  // Reset the lesson header
  const lessonHeader = document.getElementById("lesson-header");
  if (lessonHeader) {
    lessonHeader.style.transition = "opacity 0.5s ease"; // Smooth fade-out
    lessonHeader.style.opacity = "0";
    setTimeout(() => {
      lessonHeader.style.display = "none";
    }, 500); // Match fade duration
  }
 
 
  // Reset Start UI
  const uiCard = document.getElementById("dynamic-ui");
  uiCard.style.display = "none";
  uiCard.style.opacity = "0";
 
 
  // Reset global state
  currentLessonKey = null;
  currentStep = 0;
  currentSubStep = "info";
  correctAnswers = 0;
  totalQuestions = 0;
 
 
  console.log("Lesson exited and returned to Home Screen.");
 }
 
 
 
 
 
 
 
 
 // Simplified showLessonComplete Function
 function showLessonComplete() {
  const lessonCompleteScreen = document.getElementById("lesson-complete-screen");
  const accuracyElement = document.getElementById("lesson-accuracy");
  const timeElement = document.getElementById("lesson-time");

  // Hide all other screens
  const screens = [
    document.getElementById("map-lesson-screen"),
    document.getElementById("flag-lesson-screen"),
    document.getElementById("country-info-screen"),
    document.getElementById("feedback-screen"),
  ];
  screens.forEach((screen) => {
    if (screen) {
      screen.style.display = "none";
    }
  });

  // Calculate and display accuracy and time
  const endTime = new Date();
  const timeTaken = Math.floor((endTime - startTime) / 1000);

  // Prevent NaN or divide-by-zero errors
  const accuracy = totalQuestions > 0
    ? Math.round((correctAnswers / totalQuestions) * 100)
    : 0;

  accuracyElement.innerText = `Accuracy: ${accuracy}%`;
  timeElement.innerText = `Time: ${timeTaken} seconds`;

  // Display the lesson-complete screen
  lessonCompleteScreen.style.display = "flex";
  lessonCompleteScreen.style.opacity = "0";

  setTimeout(() => {
    lessonCompleteScreen.style.transition = "opacity 0.5s ease";
    lessonCompleteScreen.style.opacity = "1";
  }, 100);

  // Add confetti effect
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });
}

 
 // Debug Skip to Lesson Complete (Ctrl+L)
 document.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.key === "l") {
    // Directly trigger the lesson complete flow
    showLessonComplete();
  }
 });
 
 
 
 
 // Debug feature for skipping to the lesson complete screen
 document.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.key === "l") {
    const lessonCompleteScreen = document.getElementById("lesson-complete-screen");
    lessonCompleteScreen.style.display = "flex";
    lessonCompleteScreen.style.opacity = "1";
    showLessonComplete();
  }
 });
 
 
 
 
 // Add debug feature for skipping to lesson complete screen
 document.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.key === "l") {
    showLessonComplete();
  }
 });
 
 
 
 
 document.querySelectorAll("#exit-lesson-btn").forEach((btn) => {
  btn.onclick = exitLesson;
 });
 
 
 
 
 function showLessonCompleteDirect() {
  const feedbackScreen = document.getElementById("feedback-screen");
  const lessonCompleteScreen = document.getElementById("lesson-complete-screen");
  const progressBar = document.getElementById("progress-bar");
 
 
  // Hide other lesson-related screens
  const lessonScreens = [
    document.getElementById("country-info-screen"),
    document.getElementById("flag-lesson-screen"),
    feedbackScreen,
  ];
  lessonScreens.forEach((screen) => {
    screen.style.display = "none";
    screen.style.opacity = "0";
  });
 
 
  // Update progress bar to full
  progressBar.style.width = "100%";
 
 
  // Display lesson complete screen
  feedbackScreen.style.display = "none";
  lessonCompleteScreen.style.display = "flex";
  lessonCompleteScreen.style.opacity = "0";
  setTimeout(() => {
    lessonCompleteScreen.style.transition = "opacity 0.5s ease";
    lessonCompleteScreen.style.opacity = "1";
  }, 100);
 
 
  // Display NaN for accuracy and time
  document.getElementById("lesson-accuracy").innerText = "Accuracy: NaN";
  document.getElementById("lesson-time").innerText = "Time: NaN";
 
 
  // Simulate confetti effect
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });
 }
 
 
 // Secret keypress to skip directly to lesson complete
 document.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.key === "l") {
    showLessonCompleteDirect();
  }
 });
 
 
 
 
 
 
 
 
 // Reset Selected Flag
 function resetSelection() {
  const flags = document.querySelectorAll(".flag-option");
  flags.forEach((flag) => flag.classList.remove("selected"));
  selectedFlag = null;
  selectedCountryCoordinates = null;
}

 
 function resetScreens() {
  const screens = [
    document.getElementById("map-lesson-screen"),
    document.getElementById("flag-lesson-screen"),
    document.getElementById("country-info-screen"),
    document.getElementById("feedback-screen"),
    document.getElementById("lesson-complete-screen"),
    document.getElementById("dynamic-ui"),
  ];
 
 
  screens.forEach((screen) => {
    if (screen) {
      screen.style.display = "none";
      screen.style.opacity = "0";
    }
  });
 
 
  // Smoothly fade out the progress bar
  const progressBar = document.getElementById("progress-bar");
  if (progressBar) {
    progressBar.style.transition = "opacity 0.5s ease, width 0.5s ease"; // Smooth fade-out and shrink
    progressBar.style.opacity = "0"; // Fade out
    progressBar.style.width = "0%"; // Reset width
    setTimeout(() => {
      progressBar.style.transition = "none"; // Disable animation during reset
      progressBar.style.opacity = "1"; // Reset opacity for next use
    }, 500); // Match fade duration
  }
 
 
  console.log("All screens reset.");
 }
 
 
 
 
 // Call `resetScreens` in `exitLesson`
 resetScreens();
 
 
 
 
 // Smooth exit to home screen
 function returnToHome() {
  const lessonCompleteScreen = document.getElementById("lesson-complete-screen");
  const lessonHeader = document.getElementById("lesson-header");
  const progressBar = document.getElementById("progress-bar");
  const homeScreen = document.getElementById("home-screen");
 
 
  // Hide lesson-complete-screen immediately
  lessonCompleteScreen.style.display = "none";
 
 
  // Reset lesson header and progress bar
  lessonHeader.style.display = "none";
  progressBar.style.width = "0%";
 
 
  // Show the home screen with fade-in animation
  homeScreen.style.display = "block";
  homeScreen.style.animation = "fadeIn 1s ease-in-out forwards";
 }
 
 
 // Simplified showLessonComplete Function
 function showLessonComplete() {
  const lessonCompleteScreen = document.getElementById("lesson-complete-screen");
  const accuracyElement = document.getElementById("lesson-accuracy");
  const timeElement = document.getElementById("lesson-time");

  // Hide all other screens
  const screens = [
    document.getElementById("map-lesson-screen"),
    document.getElementById("flag-lesson-screen"),
    document.getElementById("country-info-screen"),
    document.getElementById("feedback-screen"),
  ];
  screens.forEach((screen) => {
    if (screen) {
      screen.style.display = "none";
    }
  });

  // Calculate and display accuracy and time
  const endTime = new Date();
  const timeTaken = Math.floor((endTime - startTime) / 1000);
  const accuracy = Math.floor((correctAnswers / totalQuestions) * 100) || 0;

  accuracyElement.innerText = `Accuracy: ${accuracy}%`;
  timeElement.innerText = `Time: ${timeTaken} seconds`;

  // Display the lesson-complete screen
  lessonCompleteScreen.style.display = "flex";
  lessonCompleteScreen.style.opacity = "0";

  setTimeout(() => {
    lessonCompleteScreen.style.transition = "opacity 0.5s ease";
    lessonCompleteScreen.style.opacity = "1";
  }, 100);

  // Add confetti effect
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });
}

 
 
 // Debug Skip to Lesson Complete (Ctrl+L)
 document.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.key === "l") {
    // Directly trigger the lesson complete flow
    showLessonComplete();
  }
 });
 