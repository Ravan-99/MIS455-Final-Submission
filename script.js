const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const resultsContainer = document.getElementById("results");
const showAllBtn = document.getElementById("show-all-btn");
const featuredRecipesContainer = document.getElementById("featured-recipes-container");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");

let allMeals = [];
let featuredMeals = [];
let currentSlide = 0;

// Function to fetch meals by search query
async function fetchMeals(query) {
  try {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
    const data = await response.json();
    return data.meals || [];
  } catch (error) {
    console.error("Error fetching meals:", error);
    return [];
  }
}

// Function to fetch random meals
async function fetchRandomMeals(count = 5) {
  try {
    const requests = Array.from({ length: count }, () =>
      fetch("https://www.themealdb.com/api/json/v1/1/random.php").then((res) => res.json())
    );
    const mealsData = await Promise.all(requests);
    return mealsData.map((mealData) => mealData.meals[0]);
  } catch (error) {
    console.error("Error fetching random meals:", error);
    return [];
  }
}

// Function to display meals in the search results section
function displayMeals(meals, showAll = false) {
  resultsContainer.innerHTML = ""; // Clear previous results
  const mealsToShow = showAll ? meals : meals.slice(0, 5);

  mealsToShow.forEach((meal) => {
    const mealCard = document.createElement("div");
    mealCard.classList.add("meal-card");

    // Truncate the instructions initially
    const truncatedInstructions = meal.strInstructions.slice(0, 100) + "...";

    mealCard.innerHTML = `
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
      <div class="card-body">
        <h5>${meal.strMeal}</h5>
        <p><strong>ID:</strong> ${meal.idMeal}</p>
        <p class="meal-instructions">${truncatedInstructions}</p>
        <button class="see-more-btn">See More</button>
      </div>
    `;

    // Add event listener for "See More" button
    const seeMoreBtn = mealCard.querySelector(".see-more-btn");
    const instructionsPara = mealCard.querySelector(".meal-instructions");
    let expanded = false;

    seeMoreBtn.addEventListener("click", () => {
      if (!expanded) {
        instructionsPara.textContent = meal.strInstructions;
        seeMoreBtn.textContent = "Show Less";
      } else {
        instructionsPara.textContent = truncatedInstructions;
        seeMoreBtn.textContent = "See More";
      }
      expanded = !expanded;
    });

    resultsContainer.appendChild(mealCard);
  });

  showAllBtn.classList.toggle("d-none", meals.length <= 5);
}

// Function to display meals in the slider
function displayFeaturedMeals(meals) {
  featuredRecipesContainer.innerHTML = ""; // Clear existing content

  meals.forEach((meal) => {
    const featuredCard = document.createElement("div");
    featuredCard.classList.add("featured-card");

    featuredCard.innerHTML = `
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
      <h4>${meal.strMeal}</h4>
      <p>${meal.strCategory || "Category"} - ${meal.strArea || "Area"}</p>
    `;

    featuredRecipesContainer.appendChild(featuredCard);
  });

  // Set container width to fit all cards
  featuredRecipesContainer.style.width = `${meals.length * 310}px`;
}

// Function to update the slider position
function updateSliderPosition() {
  const offset = -currentSlide * 310; // Each card is 310px wide (300px + 10px margin)
  featuredRecipesContainer.style.transform = `translateX(${offset}px)`;
}

// Event listener for slider buttons
prevBtn.addEventListener("click", () => {
  if (currentSlide > 0) {
    currentSlide--;
    updateSliderPosition();
  }
});

nextBtn.addEventListener("click", () => {
  if (currentSlide < featuredMeals.length - 1) {
    currentSlide++;
    updateSliderPosition();
  }
});

// Event listener for search button
searchBtn.addEventListener("click", async () => {
  const query = searchInput.value.trim();
  if (!query) return;

  allMeals = await fetchMeals(query);
  displayMeals(allMeals);
});

// Event listener for "Show All" button
showAllBtn.addEventListener("click", () => {
  displayMeals(allMeals, true);
});

// Initial load of random meals for the slider
(async function loadFeaturedMeals() {
  featuredMeals = await fetchRandomMeals(20); // Fetch 20 random meals
  displayFeaturedMeals(featuredMeals);
  updateSliderPosition(); // Initialize slider position
})();
