
function deleteMovie(movieID) {
  let link = '/delete-movie-ajax/';
  let data = {
    id: movieID
  };

  $.ajax({
    url: link,
    type: 'DELETE',
    data: JSON.stringify(data),
    contentType: "application/json; charset=utf-8",
    success: function(result) {
      deleteRow(movieID);
    }
  });
}

function deleteRow(movieID){
    let table = document.getElementById("movies-table");
    for (let i = 0, row; row = table.rows[i]; i++) {
       if (table.rows[i].getAttribute("data-value") == movieID) {
            table.deleteRow(i);
            break;
       }
    }
}

