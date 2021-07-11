
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
    }
}

const extraGenerations = {
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

const extraPokemonArr = [808, 809, 862, 863, 865, 867]
const notReleased = [352, 479, 489, 490, 492, 493, 570, 571, 619, 620, 621, 636, 637, 647, 648, 664, 665, 666, 669, 670, 671, 672, 673, 674, 675, 676, 679, 680, 681, 682, 683, 684, 685, 686, 687, 688, 689, 690, 691, 692, 693, 694, 695, 696, 697, 698, 699, 700, 701, 702, 703, 704, 705, 706, 708, 709, 710, 711, 712, 713, 716, 717, 718, 719, 720, 721]

let pokeData = {}


// Init
function runScript() {
    addGenTabs()
    getPokemon()
}

// Add Generation Tabs
function addGenTabs() {

    const newContainer = document.createElement("div");
    newContainer.setAttribute("id", "generation-tabs");

    for (let i = -1; i < (Object.keys(generations).length + Object.keys(extraGenerations).length); i++) {

        const newDiv = document.createElement("div");

        if (i < 0) {
            newDiv.setAttribute("onClick", "filterGens(this)");
            newDiv.setAttribute("data-gen-number", "all");
            newDiv.classList.add("selected");
            newDiv.innerHTML = "All pokemon";

        } else if (i < Object.keys(generations).length) {
            newDiv.setAttribute("data-gen-roman", generations[i + 1].roman);
            newDiv.setAttribute("data-gen-number", (i + 1));
            newDiv.setAttribute("data-gen-name", generations[i + 1].name);
            newDiv.setAttribute("onClick", "filterGens(this)");
            newDiv.innerHTML = `Gen ${generations[i + 1].roman} <br> ${generations[i + 1].name}`;

        } else {
            newDiv.setAttribute("data-gen-roman", extraGenerations[i + 1].roman);
            newDiv.setAttribute("data-gen-number", (i + 1));
            newDiv.setAttribute("data-gen-name", extraGenerations[i + 1].name);
            newDiv.setAttribute("onClick", "filterGens(this)");
            newDiv.innerHTML = `Gen ${extraGenerations[i + 1].roman} <br> ${extraGenerations[i + 1].name}`;
        }

        newContainer.appendChild(newDiv);
    }

    document.querySelector("#main").appendChild(newContainer);
}

// Get Pokemon
async function getPokemon() {

    if (localStorage.getItem("myLocalPokedex") === null) {

        let pokemonLimit = 721;
        pokemonLimit = generations[Object.keys(generations).length].to;
        // pokemonLimit = 10;

        await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${pokemonLimit}`)
            .then(function (resp) {
                return resp.json();
            })
            .then(async function (data) {
                console.log(data)
                // Gen 1-6 pokemon
                for (const [i, element] of data.results.entries()) {
                    await fetch(element.url)
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
                // Gen 7 & 8 unique
                console.log(extraPokemonArr);
                for (let i = 0; i < extraPokemonArr.length; i++) {
                    // console.log(i)

                    await fetch(`https://pokeapi.co/api/v2/pokemon/${extraPokemonArr[i]}/`)
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
                // Add extra unique pokemon
            })
            .then(function () {
                console.log("new data", pokeData)
                localStorage.setItem("myLocalPokedex", JSON.stringify(pokeData));
            })
    } else {
        let localDex = JSON.parse(localStorage.getItem("myLocalPokedex"));

        pokeData = localDex;

        for (let i = 0; i < Object.keys(pokeData).length; i++) {
            // addPokemon(localDex[i + 1].number, localDex[i + 1].name, localDex[i + 1].img_default, localDex[i + 1].type, localDex[i + 1].state);
            addPokemon(pokeData[Object.keys(pokeData)[i]].number, pokeData[Object.keys(pokeData)[i]].name, pokeData[Object.keys(pokeData)[i]].img_default, pokeData[Object.keys(pokeData)[i]].type, pokeData[Object.keys(pokeData)[i]].state);
        }

    }

}

// Add pokemon to DOM
function addPokemon(number, name, img, type, state) {

    // console.log(number, name, img, type)

    const newDiv = document.createElement("div");
    newDiv.setAttribute("data-type", type);
    newDiv.setAttribute("data-name", name);
    newDiv.setAttribute("data-number", number);
    if (notReleased.includes(number)) {
        newDiv.setAttribute("data-not-released", "")
    } else {
        newDiv.setAttribute("onClick", "toggleState(this)");
    }
    const newImg = document.createElement("img");
    const newP = document.createElement("p");
    newImg.src = img;
    newImg.className = "pokemon_img";
    newP.innerHTML = `#${number < 9 ? `00${number}` : (number < 99 ? `0${number}` : number)}`

    newDiv.appendChild(newImg);
    newDiv.appendChild(newP);

    if (number <= generations[Object.keys(generations).length].to) {
        // Gen 1-6 pokemon
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
    } else {
        // Gen 7 & 8 unique
        for (let i = 0; i < Object.keys(extraGenerations).length; i++) {
            if ((number >= extraGenerations[Object.keys(extraGenerations)[i]].from && number <= extraGenerations[Object.keys(extraGenerations)[i]].to)) {
                if (document.querySelector(`.gen_wrapper[data-gen-num="${i + 1 + Object.keys(generations).length}"]`) === null) {
                    const newDiv2 = document.createElement("div");
                    newDiv2.className = "gen_wrapper"
                    newDiv2.setAttribute("data-gen-num", (i + 1 + Object.keys(generations).length))
                    newDiv2.setAttribute("data-gen-name", extraGenerations[Object.keys(extraGenerations)[i]].name)
                    newDiv2.innerHTML = `<div class="gen_title"><p>${extraGenerations[Object.keys(extraGenerations)[i]].name} (Gen ${i + 1 + Object.keys(generations).length})</p></div><div class="pokedex"></div>`

                    document.querySelector("#main").appendChild(newDiv2);
                }
                break;
            }
        }

    }


    setState(newDiv, state);
    document.querySelector(".gen_wrapper:last-child .pokedex").appendChild(newDiv);
}

// Set pokemon state 
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

// Toggle pokemon state
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


function test() {
    let numUndiscovered = 0;
    let numDiscovered = 0;
    let numShiny = 0;
    let numElse = 0;

    let numKanto = 0;
    let numJohto = 0;
    let numHoenn = 0;
    let numSinnoh = 0;
    let numUnova = 0;
    let numKalos = 0;
    let numAlola = 0;
    let numGalar = 0;

    for (let i = 0; i < Object.keys(pokeData).length; i++) {
        // console.log(pokeData[Object.keys(pokeData)[i]])
        if (pokeData[Object.keys(pokeData)[i]].state === "undiscovered") {
            numUndiscovered++;
        } else if (pokeData[Object.keys(pokeData)[i]].state === "discovered" || pokeData[Object.keys(pokeData)[i]].state === "shiny") {
            numDiscovered++;

            let id = pokeData[Object.keys(pokeData)[i]].number;

            if (0 < id && id <= 151) {
                numKanto++;
            } else if (id <= 251) {
                numJohto++;
            } else if (id <= 386) {
                numHoenn++;
            } else if (id <= 493) {
                numSinnoh++;
            } else if (id <= 649) {
                numUnova++;
            } else if (id <= 721) {
                numKalos++;
                console.log("TEST", pokeData[Object.keys(pokeData)[i]].number, pokeData[Object.keys(pokeData)[i]].name)
            } else if (id <= 809) {
                numAlola++;
            } else if (id <= 898) {
                numGalar++;
            }


        } else if (pokeData[Object.keys(pokeData)[i]].state === "shiny") {
            numShiny++;
        } else {
            numElse++;
        }
    }
    // return [numUndiscovered, numDiscovered, numShiny, numElse];
    return [numDiscovered, numKanto, numJohto, numHoenn, numSinnoh, numUnova, numKalos, numAlola, numGalar];
}

