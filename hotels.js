// fetch(
//     "https://hotels4.p.rapidapi.com/locations/v2/search?query=new%20york&locale=en_US&currency=USD",
//     {
//         method: "GET",
//         headers: {
//             "x-rapidapi-host": "hotels4.p.rapidapi.com",
//             "x-rapidapi-key":
//                 "977455ddbemsh49fc9c8b8204dd0p11e9c9jsn8b89bc45c2be",
//         },
//     }
// )
//     .then((res) => res.json())
//     .then((searchResults) => {
//         const hotelSuggestion = searchResults.suggestions.find(
//             (suggestion) => suggestion.group === "HOTEL_GROUP"
//         );
//         const hotels = hotelSuggestion.entities;

//         hotels.forEach((hotel) => {
//             const id = hotel.destinationId;
//             fetch(
//                 `https://hotels4.p.rapidapi.com/properties/get-details?id=${id}`,
//                 {
//                     method: "GET",
//                     headers: {
//                         "x-rapidapi-host": "hotels4.p.rapidapi.com",
//                         "x-rapidapi-key":
//                             "977455ddbemsh49fc9c8b8204dd0p11e9c9jsn8b89bc45c2be",
//                     },
//                 }
//             )
//                 .then((res) => res.json())
//                 .then((details) => console.log(details));
//         });
//     });

const domain = "https://hotels4.p.rapidapi.com";

const credentials = {
    "x-rapidapi-host": "hotels4.p.rapidapi.com",
    "x-rapidapi-key": "977455ddbemsh49fc9c8b8204dd0p11e9c9jsn8b89bc45c2be",
    potato: "potatoes",
};

const getHotels = async () => {
    const endpoint = "/locations/v2/";
    const query = "search?query=new%20york&locale=en_US&currency=USD";

    const url = domain + endpoint + query;
    const headers = { ...credentials };
    const searchResult = await fetch(url, { method: "GET", headers }).then(
        (res) => res.json()
    );

    const hotelSuggestion = searchResult.suggestions.find(
        (suggestion) => suggestion.group === "HOTEL_GROUP"
    );

    const hotels = hotelSuggestion.entities;

    const detailsPromises = [];

    hotels.forEach((hotel) => {
        const id = hotel.destinationId;
        const endpoint = "/properties/get-details";
        const query = `?id=${id}`;
        const detailPromise = fetch(domain + endpoint + query, {
            method: "GET",
            headers,
        }).then((res) => res.json());

        detailsPromises.push(detailPromise);
    });

    const details = await Promise.all(detailsPromises);

    const hotelCards = details.map((detail) => {
        const { propertyDescription } = detail.data.body;
        const { name, starRating, tagline } = propertyDescription;
        const { plain: price } = propertyDescription.featuredPrice.currentPrice;
        const gMapsLink = propertyDescription.mapWidget.staticMapUrl.split("maps-api-ssl.").join("");

        return {
            name,
            starRating,
            price,
            gMapsLink,
            tagline,
        };
    });

    return hotelCards;
};

const createHotelCards = async () => {
    const contentContainer = document.querySelector("#content");

    const hotelCards = await getHotels()

    const hotelCardsInnerHtml = hotelCards.map(
        ({ name, starRating, price, gMapsLink, tagline }) => `
        <h3>${name}</h3>
        ${tagline.join(" ")}
        <p>Rating: ${starRating}</p>
        <p>price: $${price}</p>
        <a href="${gMapsLink}" target="_blank">view in gmaps</a>
    `
    );

    hotelCardsInnerHtml.forEach((innerHtml) => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = innerHtml;
        contentContainer.appendChild(card);
    });
};

createHotelCards();
