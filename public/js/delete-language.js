function deleteLanguage(languageID) {
    let data = {
      id: languageID
    };

// Setting up AJAX request
var xhttp = new XMLHttpRequest();
xhttp.open("DELETE", "/delete-language-ajax", true);
xhttp.setRequestHeader("Content-type", "application/json");

// Tell our AJAX request how to resolve
xhttp.onreadystatechange = () => {
    if (xhttp.readyState == 4 && xhttp.status == 204) {

        // Add the new data to the table
        deleteRow(languageID);

    }
    else if (xhttp.readyState == 4 && xhttp.status != 204) {
        console.log("There was an error with the input.")
    }
}
// Send the request and wait for the response
xhttp.send(JSON.stringify(data));
}


  function deleteRow(languageID){
      let table = document.getElementById("language-table");
      for (let i = 0, row; row = table.rows[i]; i++) {
         if (table.rows[i].getAttribute("data-value") == languageID) {
              table.deleteRow(i);
              break;
         }
      }
  }

