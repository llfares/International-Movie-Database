function deleteMoviesActors(Movies_movieID, Actors_actorID) {
    // Putting data to send in a javascript object
    let data = {
      id: Movies_movieID,
      id2: Actors_actorID
    };

    // Setting up AJAX request
    var xhttp = new XMLHttpRequest();
    xhttp.open("DELETE", "/delete-movies-actors-ajax", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 204) {

            // Deleting data from the table
            deleteRow(Movies_movieID, Actors_actorID);

        }
        else if (xhttp.readyState == 4 && xhttp.status != 204) {
            console.log("There was an error with the input.")
        }
    }
    // Sending request and waiting for response
    xhttp.send(JSON.stringify(data));
  }


  function deleteRow(Movies_movieID, Actors_actorID){

    let table = document.getElementById("movies-actors-table");
    for (let i = 0, row; row = table.rows[i]; i++) {
       //Iterating through rows
       //rows are accessed with  "row" variable assigned in for loop
       if (table.rows[i].getAttribute("data-movies-movie-id") == Movies_movieID && table.rows[i].getAttribute("data-actors-actor-id") == Actors_actorID)   {
          table.deleteRow(i);
          break;
       }
    // Refreshing the page to reflect the changes
    location.reload();
    }
  }