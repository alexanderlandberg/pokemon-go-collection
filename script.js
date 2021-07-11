
"use strict";
document.addEventListener("DOMContentLoaded", runScript);
document.querySelector("#filter_remove_discovered").addEventListener("click", filterRemoveDiscovered);
document.querySelector("#filter_fade_discovered").addEventListener("click", filterFadeDiscovered);
document.querySelector("#filter_show_silhouettes").addEventListener("click", filterShowSilhouettes);

const generations = {
    1: {
        name: "Kanto",
        roman: "I",
        from: 1,
        to: 151
    },
    2: {
        name: "Johto",
        roman: "II",
        from: 152,
        to: 251
    },
    3: {
        name: "Hoenn",
        roman: "III",
        from: 252,
        to: 386
    },
    4: {
        name: "Sinnoh",
        roman: "IV",
        from: 387,
        to: 493
    },
    5: {
        name: "Unova",
        roman: "V",
        from: 494,
        to: 649
    },
    6: {
        name: "Kalos",
        roman: "VI",
        from: 650,
        to: 721
    },
    7: {
        name: "Alola",
        roman: "VII",
        from: 722,
        to: 809
    },
    8: {
        name: "Galar",
        roman: "VIII",
        from: 810,
        to: 898
    }
}

let pokeData = {}

// --- Init ---
function runScript() {
    addGenTabs()
    getPokemon()
}

// --- Add Generation Tabs ---
function addGenTabs() {

    const newContainer = document.createElement("div");
    newContainer.setAttribute("id", "generation-tabs");

    for (let i = -1; i < Object.keys(generations).length; i++) {

        const newDiv = document.createElement("div");

        if (i < 0) {
            newDiv.setAttribute("onClick", "filterGens(this)");
            newDiv.setAttribute("data-gen-number", "all");
            newDiv.classList.add("selected");
            newDiv.innerHTML = "All pokemon";

        } else {
            newDiv.setAttribute("data-gen-roman", generations[i + 1].roman);
            newDiv.setAttribute("data-gen-number", (i + 1));
            newDiv.setAttribute("data-gen-name", generations[i + 1].name);
            newDiv.setAttribute("onClick", "filterGens(this)");
            newDiv.innerHTML = `Gen ${generations[i + 1].roman} <br> ${generations[i + 1].name}`;

        }

        newContainer.appendChild(newDiv);
    }

    document.querySelector("#main").appendChild(newContainer);
}

// --- Get Pokemon ---
async function getPokemon() {

    if (localStorage.getItem("myLocalPokedex") === null) {

        await fetch("https://pokemon-go1.p.rapidapi.com/released_pokemon.json", {
            "method": "GET",
            "headers": {
                "x-rapidapi-key": "c38fe4d1c1msh480d6d3140fbf20p153674jsn8e19d5423dec",
                "x-rapidapi-host": "pokemon-go1.p.rapidapi.com"
            }
        })
            .then(function (resp) {
                return resp.json();
            })
            .then(async function (data) {
                console.log("data", data)
                for (const [i, element] of Object.keys(data).entries()) {
                    console.log(element)
                    await fetch(`https://pokeapi.co/api/v2/pokemon/${element}/`)
                        .then(function (resp) {
                            return resp.json();
                        })
                        .then(function (data) {

                            addPokemon(data.id, data.name, data.sprites.front_default, data.types[0].type.name)

                            // Set poke data
                            let newPokeData = {
                                number: data.id,
                                name: data.name,
                                img_default: data.sprites.front_default,
                                img_shiny: data.sprites.front_shiny,
                                type: data.types[0].type.name,
                                state: "undiscovered"
                            }
                            pokeData[data.id] = newPokeData;
                        })
                }

            })
            .then(function () {
                console.log("new data", pokeData)
                localStorage.setItem("myLocalPokedex", JSON.stringify(pokeData));
            })
    } else {
        let localDex = JSON.parse(localStorage.getItem("myLocalPokedex"));

        pokeData = localDex;

        for (let i = 0; i < Object.keys(pokeData).length; i++) {
            addPokemon(pokeData[Object.keys(pokeData)[i]].number, pokeData[Object.keys(pokeData)[i]].name, pokeData[Object.keys(pokeData)[i]].img_default, pokeData[Object.keys(pokeData)[i]].type, pokeData[Object.keys(pokeData)[i]].state);
        }

    }

}

// --- Add pokemon to DOM ---
function addPokemon(number, name, img, type, state) {

    const newDiv = document.createElement("div");
    newDiv.setAttribute("data-type", type);
    newDiv.setAttribute("data-name", name);
    newDiv.setAttribute("data-number", number);
    newDiv.setAttribute("onClick", "toggleState(this)");
    const newImg = document.createElement("img");
    const newP = document.createElement("p");
    newImg.src = img;
    newImg.className = "pokemon_img";
    newP.innerHTML = `#${number < 9 ? `00${number}` : (number < 99 ? `0${number}` : number)}`

    newDiv.appendChild(newImg);
    newDiv.appendChild(newP);

    for (let i = 0; i < Object.keys(generations).length; i++) {
        if ((number >= generations[i + 1].from && number <= generations[i + 1].to)) {
            if (document.querySelector(`.gen_wrapper[data-gen-num="${i + 1}"]`) === null) {
                const newDiv2 = document.createElement("div");
                newDiv2.className = "gen_wrapper"
                newDiv2.setAttribute("data-gen-num", (i + 1))
                newDiv2.setAttribute("data-gen-name", generations[(i + 1)].name)
                newDiv2.innerHTML = `<div class="gen_title"><p>${generations[i + 1].name} (Gen ${i + 1})</p></div><div class="pokedex"></div>`
                document.querySelector("#main").appendChild(newDiv2);
            }
            break;
        }
    }

    setState(newDiv, state);
    document.querySelector(".gen_wrapper:last-child .pokedex").appendChild(newDiv);
}

// --- Set pokemon state ---
function setState(pokemon, state) {

    if (state === "discovered") {
        pokemon.querySelector(".pokemon_img").classList.add("discovered");

    } else if (state === "shiny") {
        pokemon.querySelector(".pokemon_img").classList.add("discovered");
        pokemon.querySelector(".pokemon_img").src = pokeData[pokemon.getAttribute("data-number")].img_shiny;
        const shinyIcon = document.createElement("div");
        shinyIcon.className = "shiny_icon";
        pokemon.appendChild(shinyIcon);
    }

    localStorage.setItem("myLocalPokedex", JSON.stringify(pokeData));
}

// --- Toggle pokemon state ---
function toggleState(parm) {

    // console.log(parm)

    if (pokeData[parm.getAttribute("data-number")].state === "undiscovered") {
        pokeData[parm.getAttribute("data-number")].state = "discovered";
        parm.querySelector(".pokemon_img").classList.add("discovered");

    } else if (pokeData[parm.getAttribute("data-number")].state === "discovered") {
        pokeData[parm.getAttribute("data-number")].state = "shiny";
        parm.querySelector(".pokemon_img").src = pokeData[parm.getAttribute("data-number")].img_shiny;
        const shinyIcon = document.createElement("div");
        shinyIcon.className = "shiny_icon"
        parm.appendChild(shinyIcon)

    } else if (pokeData[parm.getAttribute("data-number")].state === "shiny") {
        pokeData[parm.getAttribute("data-number")].state = "undiscovered";
        parm.querySelector(".pokemon_img").classList.remove("discovered");
        parm.querySelector(".pokemon_img").src = pokeData[parm.getAttribute("data-number")].img_default;
        parm.querySelector(".shiny_icon").remove()
    }

    localStorage.setItem("myLocalPokedex", JSON.stringify(pokeData));

    // Call filters
    filterRemoveDiscovered("refresh")
    filterFadeDiscovered("refresh")
}

// ---------- Filter ----------

function filterGens(parm) {

    const tabAll = document.querySelector(`[data-gen-number="all"]`);
    const tabList = document.querySelectorAll("#generation-tabs>div");
    const genWrapperList = document.querySelectorAll(".gen_wrapper");

    // Tab 
    if (parm.getAttribute("data-gen-number") === "all") {

        for (let i = 0; i < tabList.length; i++) {
            tabList[i].classList.remove("selected")
        }
        for (let i = 0; i < genWrapperList.length; i++) {
            genWrapperList[i].classList.remove("hide")
        }
        parm.classList.add("selected")

    } else {
        tabAll.classList.remove("selected")

        if (parm.classList.contains("selected")) {
            parm.classList.remove("selected")
            if (document.querySelectorAll("#generation-tabs>div.selected").length < 1) {
                tabAll.classList.add("selected")
            }
        } else {
            parm.classList.add("selected")
        }
    }

    // Pokedex
    if (tabAll.classList.contains("selected")) {
        console.log("ALL pokemon")
        for (let i = 0; i < genWrapperList.length; i++) {
            genWrapperList[i].classList.remove("hide");
        }
    } else {
        for (let i = 0; i < genWrapperList.length; i++) {
            if (tabList[i + 1].classList.contains("selected")) {
                // console.log("SELECTED", i, genWrapperList[i])
                genWrapperList[i].classList.remove("hide");
            } else {
                genWrapperList[i].classList.add("hide");
            }
        }
    }
}

function filterRemoveDiscovered(parm) {
    const pokemon = document.querySelectorAll(".pokedex > div");
    const pokedexList = document.querySelectorAll(".pokedex");

    if (parm !== "refresh") {

        document.querySelector("#filter_remove_discovered").classList.toggle("checked");

        if (document.querySelector("#filter_remove_discovered").classList.contains("checked")) {
            document.querySelector("#filter_fade_discovered").classList.add("disabled")
            document.querySelector("#filter_fade_discovered").removeEventListener("click", filterFadeDiscovered);
        } else {
            document.querySelector("#filter_fade_discovered").classList.remove("disabled")
            document.querySelector("#filter_fade_discovered").addEventListener("click", filterFadeDiscovered);

        }

    }



    for (let i = 0; i < pokemon.length; i++) {
        if (pokeData[pokemon[i].getAttribute("data-number")].state !== "undiscovered" && document.querySelector("#filter_remove_discovered").classList.contains("checked")) {
            pokemon[i].classList.add("hide");
        } else {
            pokemon[i].classList.remove("hide");
        }
    }

    for (let i = 0; i < pokedexList.length; i++) {
        let discCounter = 0;
        let test = pokedexList[i].querySelectorAll(".pokedex>div>img");
        for (let j = 0; j < test.length; j++) {
            if (test[j].classList.contains("discovered")) {
                discCounter++;
                if (discCounter === pokedexList[i].children.length) {
                    console.log("done")
                    pokedexList[i].classList.add("hide")
                }
            } else {
                pokedexList[i].classList.remove("hide")
                break
            }
        }

        if (!document.querySelector("#filter_remove_discovered").classList.contains("checked")) {
            pokedexList[i].classList.remove("hide")
        }
    }


}

function filterFadeDiscovered(parm) {
    const pokemon = document.querySelectorAll(".pokedex > div");

    if (parm !== "refresh") {
        document.querySelector("#filter_fade_discovered").classList.toggle("checked");
    }

    for (let i = 0; i < pokemon.length; i++) {
        if (pokeData[pokemon[i].getAttribute("data-number")].state !== "undiscovered" && document.querySelector("#filter_fade_discovered").classList.contains("checked")) {
            pokemon[i].classList.add("fade_discovered");
        } else {
            pokemon[i].classList.remove("fade_discovered");
        }
    }
}

function filterShowSilhouettes() {

    document.querySelector("#filter_show_silhouettes").classList.toggle("checked");

    if (document.querySelector("#filter_show_silhouettes").classList.contains("checked")) {
        document.querySelector("#main").classList.add("show_silhouettes")
    } else {
        document.querySelector("#main").classList.remove("show_silhouettes")
    }
}

