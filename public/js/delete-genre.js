function deleteGenre(genreID) {
    let data = {
      id: genreID
    };

// Setting up AJAX request
var xhttp = new XMLHttpRequest();
xhttp.open("DELETE", "/delete-genre-ajax", true);
xhttp.setRequestHeader("Content-type", "application/json");

// Tell our AJAX request how to resolve
xhttp.onreadystatechange = () => {
    if (xhttp.readyState == 4 && xhttp.status == 204) {

        // Add the new data to the table
        deleteRow(genreID);

    }
    else if (xhttp.readyState == 4 && xhttp.status != 204) {
        console.log("There was an error with the input.")
    }
}
// Send the request and wait for the response
xhttp.send(JSON.stringify(data));
}


  function deleteRow(genreID){
      let table = document.getElementById("genres-table");
      for (let i = 0, row; row = table.rows[i]; i++) {
         if (table.rows[i].getAttribute("data-value") == genreID) {
              table.deleteRow(i);
              break;
         }
      }
  }

