document.addEventListener("DOMContentLoaded", () => {
    loadPokemon();
    loadMyPokemon();
    
    document.getElementById("pokemon-section-btn").addEventListener("click", () => switchSection('pokemon-section'));
    document.getElementById("my-pokemon-section-btn").addEventListener("click", () => switchSection('my-pokemon-section'));
});

const pokemonContainer = document.getElementById("pokemon-cards-container");
const myPokemonContainer = document.getElementById("my-pokemon-cards-container");
const pokemonModal = document.getElementById("pokemon-modal");
const closeModalButton = document.getElementById("close-modal");

function switchSection(sectionId) {

    document.querySelectorAll(".section").forEach(section => {
        section.classList.add("hidden");
    });
    document.getElementById(sectionId).classList.remove("hidden");

}

async function loadPokemon() {
    try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=200');
        if (!response.ok) throw new Error("Errore di rete");
        
        const data = await response.json();
        const caughtPokemonNames = new Set(getCaughtPokemonNames());
        pokemonContainer.innerHTML = ''; // Svuota il contenitore per prevenire duplicati
        const displayedPokemon = new Set(); // Per evitare duplicati visivi

        for (const pokemon of data.results) {
            if (caughtPokemonNames.has(pokemon.name) || displayedPokemon.has(pokemon.name)) {
                continue;
            }
            displayedPokemon.add(pokemon.name);

            const pokemonData = await fetchPokemonData(pokemon.url);
            displayPokemon(pokemonData);
        }

    } catch (error) {
        alert("Errore nel caricamento dei Pokémon.");
        console.error("Errore:", error);
    }
}



function getCaughtPokemonNames() {
    const myPokemon = JSON.parse(localStorage.getItem("myPokemon")) || [];
    return myPokemon.map(pokemon => pokemon.name);
}

async function fetchPokemonData(url) {
    const response = await fetch(url);
    return await response.json();
}

function displayPokemon(pokemon) {
    const card = document.createElement("div");
    card.classList.add("card");
    card.setAttribute("data-name", pokemon.name);
    const formattedName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1); // Prima lettera maiuscola

    // Assumiamo che ci sia una versione migliore delle immagini (es. 'sprites.front_shiny' o 'sprites.other')
    const pokemonImage = pokemon.sprites.other['official-artwork'] ? pokemon.sprites.other['official-artwork'].front_default : pokemon.sprites.front_default;

    card.innerHTML = `
        <h3>${formattedName}</h3>
        <img src="${pokemonImage}" alt="${pokemon.name}">
        <button onclick="catchPokemon('${pokemon.name}', '${pokemonImage}')">Catch</button>
        `;

    card.querySelector("img").addEventListener("click", () => showDetails(pokemon));
    pokemonContainer.appendChild(card);
}


function catchPokemon(name, sprite) {

    let myPokemon = JSON.parse(localStorage.getItem("myPokemon")) || [];
    myPokemon.push({ name, sprite });
    localStorage.setItem("myPokemon", JSON.stringify(myPokemon));

    displayMyPokemon(name, sprite);
    removePokemonFromList(name);

}

function removePokemonFromList(name) {

    const pokemonCard = pokemonContainer.querySelector(`.card[data-name="${name}"]`);
    if (pokemonCard) {
        pokemonContainer.removeChild(pokemonCard);
    }

}

function loadMyPokemon() {

    const myPokemon = JSON.parse(localStorage.getItem("myPokemon")) || [];
    myPokemon.forEach(({ name, sprite }) => displayMyPokemon(name, sprite));

}

function displayMyPokemon(name, sprite) {

    const card = document.createElement("div");
    card.classList.add("card");
    card.setAttribute("data-name", name);
    const formattedName = name.charAt(0).toUpperCase() + name.slice(1);

   
    card.innerHTML = `
        <h3>${formattedName}</h3>
        <img src="${sprite}" alt="${name}">
        <button class="release-btn">Release</button> <!-- Pulsante specifico -->
        `
    ;
    card.querySelector("img").addEventListener("click", async () => {
        const pokemonData = await fetchPokemonDetails(name);
        showDetails(pokemonData);
    });

    card.querySelector(".release-btn").addEventListener("click", () => releasePokemon(name));
    myPokemonContainer.appendChild(card);

}

async function fetchPokemonDetails(name) {

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
        return await response.json();
    } catch (error) {
        console.error("Errore nel caricamento dei dettagli:", error);
    }

}

function releasePokemon(name) {

    let myPokemon = JSON.parse(localStorage.getItem("myPokemon")) || [];
    myPokemon = myPokemon.filter(pokemon => pokemon.name !== name);
    localStorage.setItem("myPokemon", JSON.stringify(myPokemon));

    const pokemonCard = myPokemonContainer.querySelector(`.card[data-name="${name}"]`);
    if (pokemonCard) {
        myPokemonContainer.removeChild(pokemonCard);
    }

    loadPokemon();

}

function showDetails(pokemon) {
    // Aggiungi informazioni di base del Pokémon
    document.getElementById("modal-pokemon-name").textContent = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
    document.getElementById("modal-pokemon-image").src = pokemon.sprites.other['official-artwork'] ? pokemon.sprites.other['official-artwork'].front_default : pokemon.sprites.front_default;
    document.getElementById("modal-pokemon-type").textContent = pokemon.types.map(type => type.type.name).join(", ");
    document.getElementById("modal-pokemon-abilities").textContent = pokemon.abilities.map(ability => ability.ability.name).join(", ");
    
    const statsList = document.getElementById("modal-pokemon-stats");
    statsList.innerHTML = '';  // Pulisce la lista precedente
    
    // Oggetti con le etichette delle statistiche
    const statLabels = {
        "hp": "Vita",
        "attack": "Attacco",
        "defense": "Difesa",
        "special-attack": "Attacco Speciale",
        "special-defense": "Difesa Speciale",
        "speed": "Velocità"
    };

    // Aggiungi le statistiche con un'etichetta più comprensibile
    pokemon.stats.forEach(stat => {
        const li = document.createElement("li");
        const statName = statLabels[stat.stat.name] || stat.stat.name.charAt(0).toUpperCase() + stat.stat.name.slice(1);  // Usa l'etichetta se disponibile

        const statLabel = document.createElement("span");
        statLabel.classList.add("stat-label");
        statLabel.textContent = `${statName}: `;  // Aggiungi l'etichetta

        const statValue = document.createElement("span");
        statValue.classList.add("stat-value");
        statValue.textContent = stat.base_stat;  // Mostra il valore della statistica

        li.appendChild(statLabel);
        li.appendChild(statValue);
        statsList.appendChild(li);
    });

    pokemonModal.classList.add("show");
}


closeModalButton.addEventListener("click", () => {
    pokemonModal.classList.remove("show");
});

// Funzione per il filtro dinamico
const searchInput = document.getElementById("search-pokemon");

searchInput.addEventListener("input", () => {
    const searchQuery = searchInput.value.toLowerCase(); // Prendi il valore e rendilo minuscolo per confronto
    const allPokemonCards = document.querySelectorAll("#pokemon-cards-container .card"); // Seleziona tutte le carte Pokémon

    allPokemonCards.forEach(card => {
        const pokemonName = card.getAttribute("data-name").toLowerCase();
        if (pokemonName.startsWith(searchQuery)) {
            card.style.display = "flex"; // Mostra la carta se il nome corrisponde
        } else {
            card.style.display = "none"; // Nascondi la carta se non corrisponde
        }
    });
});

function catchPokemon(name, sprite) {
    // Aggiorna i Pokémon catturati nel localStorage
    let myPokemon = JSON.parse(localStorage.getItem("myPokemon")) || [];
    myPokemon.push({ name, sprite });
    localStorage.setItem("myPokemon", JSON.stringify(myPokemon));

    // Mostra il messaggio di cattura
    showCatchMessage(name, sprite);

    // Aggiorna la sezione My Pokémon e rimuove il Pokémon dalla lista
    displayMyPokemon(name, sprite);
    removePokemonFromList(name);
}

function showCatchMessage(name, sprite) {
    // Crea un contenitore per il messaggio
    const messageContainer = document.createElement("div");
    messageContainer.classList.add("catch-message");

    // Aggiungi l'immagine del Pokémon
    const pokemonImage = document.createElement("img");
    pokemonImage.src = sprite;
    pokemonImage.alt = name;
    pokemonImage.classList.add("catch-message-image");

    // Aggiungi il testo del messaggio
    const messageText = document.createElement("p");
    messageText.textContent = `${name.charAt(0).toUpperCase() + name.slice(1)} catturato con successo!`;

    // Crea i pulsanti
    const goToMyPokemonButton = document.createElement("button");
    goToMyPokemonButton.textContent = "My Pokémon";
    goToMyPokemonButton.classList.add("message-button");
    goToMyPokemonButton.addEventListener("click", () => {
        switchSection('my-pokemon'); // Passa alla sezione My Pokémon
        document.body.removeChild(messageContainer); // Rimuove il messaggio
    });

    const okButton = document.createElement("button");
    okButton.textContent = "Ok";
    okButton.classList.add("message-button");
    okButton.addEventListener("click", () => {
        document.body.removeChild(messageContainer); // Rimuove il messaggio
    });

    // Aggiungi elementi al contenitore del messaggio
    messageContainer.appendChild(pokemonImage);
    messageContainer.appendChild(messageText);
    messageContainer.appendChild(goToMyPokemonButton);
    messageContainer.appendChild(okButton);

    // Aggiungi il messaggio al body
    document.body.appendChild(messageContainer);
}
