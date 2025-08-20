function deleteMoviesGenres(Movies_movieID, Genres_genreID) {
    // Putting data to send in a javascript object
    let data = {
      id: Movies_movieID,
      id2: Genres_genreID
    };

    // Setting up AJAX request
    var xhttp = new XMLHttpRequest();
    xhttp.open("DELETE", "/delete-movies-genres-ajax", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 204) {

            // Deleting data from the table
            deleteRow(Movies_movieID, Genres_genreID);

        }
        else if (xhttp.readyState == 4 && xhttp.status != 204) {
            console.log("There was an error with the input.")
        }
    }
    // Sending request and waiting for response
    xhttp.send(JSON.stringify(data));
  }


  function deleteRow(Movies_movieID, Genres_genreID){

    let table = document.getElementById("movies-genres-table");
    for (let i = 0, row; row = table.rows[i]; i++) {
       //Iterating through rows
       //rows are accessed with  "row" variable assigned in for loop
       if (table.rows[i].getAttribute("data-movies-movie-id") == Movies_movieID && table.rows[i].getAttribute("data-genres-genre-id") == Genres_genreID)   {
          table.deleteRow(i);
          break;
       }
    // Refreshing the page to reflect the changes
    location.reload();
    }
  }