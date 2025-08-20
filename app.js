/* SETUP */
var express = require('express');   // Using express library
var app     = express();            // Instantiating express object to interact with server
app.use(express.json())             // Enabling express to handle JSON data
app.use(express.urlencoded({extended: true}))
app.use(express.static('public'))
PORT        = 9120;

/** Database **/
var db = require('./database/db-connector')

/** Handlebars **/
const { engine } = require('express-handlebars');
var exphbs = require('express-handlebars');     // Importing express-handlebars
app.engine('.hbs', engine({extname: ".hbs"}));  // Instantiating handlebars engine to process templates
app.set('view engine', '.hbs');                 // Using handlebars engine when a *.hbs file is encountered


/* ROUTES */

app.get('/', function(req, res)
    {
        res.render('index', {title: 'Home'});
    });

/* MOVIES */
app.get('/movies', function(req, res)
{
    // Declaring Query 1
    let query1;

    // If there is no query string, perform basic SELECT
    if (req.query.title === undefined)
    {
        query1 = "SELECT * FROM Movies;";
    }

    // If there is a query string, we assume this is a search, and return desired results
    else
    {
        query1 = `SELECT * FROM Movies WHERE title LIKE "${req.query.title}%"`
    }

    // Run Query 1
    db.pool.query(query1, function(error, rows, fields){

        // Save the title
        let title = rows;

        return res.render('movies', {title: 'Movies', data: title});
    })
});

/* ACTORS */
app.get('/actors', function(req, res) {
    // Declaring Query 1
    let query1;

    // If there is no query string, perform basic SELECT
    if (req.query.actorName === undefined) {
        query1 = "SELECT * FROM Actors;";
    } else {
        // Use the SQL LIKE clause to perform a case-insensitive search
        query1 = `SELECT * FROM Actors WHERE actorName LIKE "${req.query.actorName}%"`;
    }

    // Query 2 is the same for each case
    let query2 = "SELECT * FROM Languages;";

    // Running Query 1
    db.pool.query(query1, function(error, rows, fields) {
        // Checking for errors
        if (error) {
            console.log(error);
            res.sendStatus(500); // Internal Server Error
            return;
        }

        // Saving the actor
        let actors = rows;

        // Running Query 2
        db.pool.query(query2, function(error, rows, fields) {
            // Checking for errors
            if (error) {
                console.log(error);
                res.sendStatus(500); // Internal Server Error
                return;
            }

            // Saving the languages
            let languages = rows;

            // Constructing object for reference in the table
            let languageMap = {};
            languages.forEach(language => {
                languageMap[language.languageID] = language.languageName;
            });

            // Overwriting the language ID with the name of the language in the actor object
            actors = actors.map(actor => {
                return Object.assign(actor, { languageName: languageMap[actor.Languages_languageID] });
            });

            // Checking if there is exactly one result, then returning it
            if (actors.length === 1) {
                return res.render('actors', { title: 'Actors', data: actors, Languages: languages });
            } else if (actors.length === 0) {
                return res.render('actors', { title: 'Actors', data: [], Languages: languages });
            } else {
                // If there are multiple results:
                return res.render('actors', { title: 'Actors', data: actors, Languages: languages });
            }
        });
    });
});

/* GENRES */
app.get('/genres', function(req, res) {
    // Declaring Query 1
    let query1;

    // If there is no query string, perform basic SELECT
    if (req.query.genreName === undefined)
    {
        query1 = "SELECT * FROM Genres;";
    }

    // If there is a query string, we assume this is a search, and return desired results
    else
    {
        query1 = `SELECT * FROM Genres WHERE genreName LIKE "${req.query.genreName}%"`
    }

    // Run Query 1
    db.pool.query(query1, function(error, rows, fields){

        // Save the genre
        let genreName = rows;

        return res.render('genres', {title: 'Genres', data: genreName});
    })
});

/* LANGUAGES */
app.get('/languages', function(req, res)
{
    // Declaring Query 1
    let query1;

    // If there is no query string, perform basic SELECT
    if (req.query.languageName === undefined)
    {
        query1 = "SELECT * FROM Languages;";
    }

    // If there is a query string, we assume this is a search, and return desired results
    else
    {
        query1 = `SELECT * FROM Languages WHERE languageName LIKE "${req.query.languageName}%"`
    }

    // Run Query 1
    db.pool.query(query1, function(error, rows, fields){

        // Save the language
        let languageName = rows;

        return res.render('languages', {title: 'Languages', data: languageName});
    })
});

/* RELEASES */
app.get('/releases', function(req, res) {
// Declaring Query 1
let query1;

// If there is no query string, perform basic SELECT
if (req.query.releaseYear === undefined)
{
    query1 = "SELECT * FROM Releases;";
}

// If there is a query string, we assume this is a search, and return desired results
else
{
    query1 = `SELECT * FROM Releases WHERE releaseYear LIKE "${req.query.releaseYear}%"`
}

// Run Query 1
db.pool.query(query1, function(error, rows, fields){

    // Save the year
    let releaseYear = rows;

    return res.render('releases', {title: 'Releases', data: releaseYear});
})
});

/* MOVIES - ACTORS */
app.get('/movies-actors', function(req, res) {
    // Declaring Query 1
    let query1;

    // If there is no query string, perform basic SELECT
    if (!req.query.title) {
        query1 = "SELECT Movies_has_Actors.Movies_movieID, Movies.title AS movieTitle, Movies_has_Actors.Actors_actorID, Actors.actorName FROM Movies_has_Actors JOIN Movies ON Movies_has_Actors.Movies_movieID = Movies.movieID JOIN Actors ON Movies_has_Actors.Actors_actorID = Actors.actorID;";
    } else {
        // If there is a query string, we assume this is a search, and return desired results
        query1 = `SELECT Movies_has_Actors.Movies_movieID, Movies.title AS movieTitle, Movies_has_Actors.Actors_actorID, Actors.actorName FROM Movies_has_Actors JOIN Movies ON Movies_has_Actors.Movies_movieID = Movies.movieID JOIN Actors ON Movies_has_Actors.Actors_actorID = Actors.actorID WHERE Movies.title LIKE ?`;
    }

    // Run Query 1 with parameterized query
    let searchTerm = req.query.title ? `${req.query.title}%` : '';
    db.pool.query(query1, [searchTerm], function(error, rows, fields) {
        if (error) {
            console.log(error);
            res.sendStatus(500);
            return;
        }

        // Save the results
        let data = rows;

        return res.render('movies-actors', { title: 'Movies - Actors', data: data });
    });
});


/* MOVIES - GENRES */
app.get('/movies-genres', function(req, res) {
    // Declaring Query 1
    let query1;

    // If there is no query string, perform basic SELECT
    if (!req.query.title) {
        query1 = "SELECT Movies_has_Genres.Movies_movieID, Movies.title AS movieTitle, Movies_has_Genres.Genres_genreID, Genres.genreName FROM Movies_has_Genres JOIN Movies ON Movies_has_Genres.Movies_movieID = Movies.movieID JOIN Genres ON Movies_has_Genres.Genres_genreID = Genres.genreID;";
    } else {
        // If there is a query string, we assume this is a search, and return desired results
        query1 = `SELECT Movies_has_Genres.Movies_movieID, Movies.title AS movieTitle, Movies_has_Genres.Genres_genreID, Genres.genreName FROM Movies_has_Genres JOIN Movies ON Movies_has_Genres.Movies_movieID = Movies.movieID JOIN Genres ON Movies_has_Genres.Genres_genreID = Genres.genreID WHERE Movies.title LIKE ?`;
    }

    // Run Query 1 with parameterized query
    let searchTerm = req.query.title ? `${req.query.title}%` : '';
    db.pool.query(query1, [searchTerm], function(error, rows, fields) {
        if (error) {
            console.log(error);
            res.sendStatus(500);
            return;
        }

        // Save the results
        let data = rows;

        return res.render('movies-genres', { title: 'Movies - Genres', data: data });
    });
});

/* MOVIES - LANGUAGES */
app.get('/movies-languages', function(req, res) {
    // Declaring Query 1
    let query1;

    // If there is no query string, perform basic SELECT
    if (!req.query.title) {
        query1 = "SELECT Movies_has_Languages.Movies_movieID, Movies.title AS movieTitle, Movies_has_Languages.Languages_languageID, Languages.languageName FROM Movies_has_Languages JOIN Movies ON Movies_has_Languages.Movies_movieID = Movies.movieID JOIN Languages ON Movies_has_Languages.Languages_languageID = Languages.languageID;";
    } else {
        // If there is a query string, we assume this is a search, and return desired results
        query1 = `SELECT Movies_has_Languages.Movies_movieID, Movies.title AS movieTitle, Movies_has_Languages.Languages_languageID, Languages.languageName FROM Movies_has_Languages JOIN Movies ON Movies_has_Languages.Movies_movieID = Movies.movieID JOIN Languages ON Movies_has_Languages.Languages_languageID = Languages.languageID WHERE Movies.title LIKE ?`;
    }

    // Run Query 1 with parameterized query
    let searchTerm = req.query.title ? `${req.query.title}%` : '';
    db.pool.query(query1, [searchTerm], function(error, rows, fields) {
        if (error) {
            console.log(error);
            res.sendStatus(500);
            return;
        }

        // Save the results
        let data = rows;

        return res.render('movies-languages', { title: 'Movies - Languages', data: data });
    });
});


/* MOVIES - RELEASES */
app.get('/movies-releases', function(req, res) {
    // Declaring Query 1
    let query1;

    // If there is no query string, perform basic SELECT
    if (!req.query.title) {
        query1 = "SELECT Releases_has_Movies.Movies_movieID, Movies.title AS movieTitle, Releases_has_Movies.Releases_releaseID, Releases.releaseYear, Releases.releaseMonth FROM Releases_has_Movies JOIN Movies ON Releases_has_Movies.Movies_movieID = Movies.movieID JOIN Releases ON Releases_has_Movies.Releases_releaseID = Releases.releaseID;";
    } else {
        // If there is a query string, we assume this is a search, and return desired results
        query1 = `SELECT Releases_has_Movies.Movies_movieID, Movies.title AS movieTitle, Releases_has_Movies.Releases_releaseID, Releases.releaseYear, Releases.releaseMonth FROM Releases_has_Movies JOIN Movies ON Releases_has_Movies.Movies_movieID = Movies.movieID JOIN Releases ON Releases_has_Movies.Releases_releaseID = Releases.releaseID WHERE Movies.title LIKE ?`;
    }

    // Run Query 1 with parameterized query
    let searchTerm = req.query.title ? `${req.query.title}%` : '';
    db.pool.query(query1, [searchTerm], function(error, rows, fields) {
        if (error) {
            console.log(error);
            res.sendStatus(500);
            return;
        }

        // Save the results
        let data = rows;

        return res.render('movies-releases', { title: 'Movies - Releases', data: data });
    });
});


/* ERROR PAGE */
app.get('/error', (req, res) => {
    // Render error page
    res.render('error');
});


/* ADD MOVIES */
app.get('/add-movie-form', (req, res) => {
    // Render the ADD form
    res.render('add-movie-form');
});

app.post('/add-movie-form', function(req, res) {
    // Capturing the incoming data
    let data = req.body;

    let minutes = parseInt(data['input-minutes']);

    // Creating and running query on the database
    let query1 = `INSERT INTO Movies (title, synopsis, minutes) VALUES ('${data['input-title']}', '${data['input-synopsis']}', ${minutes})`;

    db.pool.query(query1, function(error, rows, fields){
    // Checking for error
    if (error) {

        // Logging error and sending HTTP response 400 to visitor indicating it was a bad request.
        console.log(error)
        res.status(400).render('error');
    }
    else
    {
        // If there was no error, perform a SELECT * on Movies
        let query2 = `SELECT * FROM Movies;`;
        db.pool.query(query2, function(error, rows, fields){

            // If there was an error on the second query, send a 400
            if (error) {

                // Logging error and sending HTTP response 400 to visitor indicating it was a bad request.
                console.log(error);
                res.sendStatus(400);
            }
            // If all went well, redirect to Movies
            else
            {
                return res.redirect('movies');
            }
        })
    }
    })
});

/* UPDATE MOVIES */
app.get('/update-movie-form/:movieID?', function(req, res) {
    let movieID = req.params.movieID;

    // Creating and running query on the database
    let query = `SELECT * FROM Movies WHERE movieID = ${movieID};`;

    // Running the query
    db.pool.query(query, function(error, rows, fields) {
        // Checking for error
        if (error) {
            // Logging error and sending HTTP response 400 to visitor indicating it was a bad request.
            console.log(error);
            res.sendStatus(400);
        }

        // Rendering the update form with the captured data
        return res.render('update-movie-form', { data: rows[0] });
    });
});

app.post('/update-movie-form/:movieID', function(req, res) {
    let movieID = req.params.movieID;
    let data = req.body;

    // Capturing the incoming data
    let title = data.title;
    let synopsis = data.synopsis;
    let minutes = parseInt(data.minutes);

    // Creating and running query on the database
    let query = `UPDATE Movies SET title = '${title}', synopsis = '${synopsis}', minutes = ${minutes} WHERE movieID = ${movieID};`;

    // Running the query
    db.pool.query(query, function(error, rows, fields) {
        // Checking for error
        if (error) {
            // Logging error and sending HTTP response 400 to visitor indicating it was a bad request.
            console.log(error);
            res.status(400).render('error');
            return;
        }

            // If all went well, redirect to Movies
            res.redirect('/movies');
    });
});

/* DELETE MOVIES */
app.delete('/delete-movie-ajax/', function(req,res,next){
    let data = req.body;
    let movieID = parseInt(data.id);
    let deleteMovie= `DELETE FROM Movies WHERE movieID = ?`;

    // Running query
    db.pool.query(deleteMovie, [movieID], function(error, rows, fields) {
    if (error) {
        console.log(error);
        res.sendStatus(400);
    } else
    {
        res.sendStatus(204);

    }
})
});


/* ADD LANGUAGES */
app.get('/add-language-form', (req, res) => {
    // Render the ADD form
    res.render('add-language-form');
});

app.post('/add-language-form', function(req, res) {
    // Capturing the incoming data
    let data = req.body;

    // Converting string values to boolean
    let originalLanguage = data['input-originalLanguage'] === 'Yes' ? 1 : 0;
    let subOrDub = data['input-subOrDub'] === 'Dub' ? 1 : 0;

    // Creating and running query on the database
    let query1 = `INSERT INTO Languages (languageName, originalLanguage, subOrDub) VALUES ('${data['input-languageName']}',  ${originalLanguage}, ${subOrDub})`;

    db.pool.query(query1, function(error, rows, fields){
    // Checking for error
    if (error) {

        // Logging error and sending HTTP response 400 to visitor indicating it was a bad request.
        console.log(error)
        res.status(400).render('error');
    }
    else
    {
        // If there was no error, perform a SELECT * on Languages
        let query2 = `SELECT * FROM Languages;`;
        db.pool.query(query2, function(error, rows, fields){

            // If there was an error on the second query, send a 400
            if (error) {

                // Logging error and sending HTTP response 400 to visitor indicating it was a bad request.
                console.log(error);
                res.sendStatus(400);
            }
            // If all went well, redirect to Languages
            else
            {
                return res.redirect('languages');
            }
        })
    }
    })
});

/* UPDATE LANGUAGES */
app.get('/update-language-form/:languageID?', function(req, res) {
    let languageID = req.params.languageID;

    // Creating and running query on the database
    let query = `SELECT * FROM Languages WHERE languageID = ${languageID};`;

    // Running the query
    db.pool.query(query, function(error, rows, fields) {
        // Checking for error
        if (error) {
            // Logging error and sending HTTP response 400 to visitor indicating it was a bad request.
            console.log(error);
            res.sendStatus(400);
        }

        // Converting boolean values to strings
        rows[0].originalLanguageString = rows[0].originalLanguage ? 'Yes' : 'No';
        rows[0].subOrDubString = rows[0].subOrDub ? 'Dub' : 'Sub';

        // Rendering the update form with the captured data
        return res.render('update-language-form', { data: rows[0] });
    });
});

app.post('/update-language-form/:languageID', function(req, res) {
    let languageID = req.params.languageID;
    let data = req.body;

    // Logging form data
    console.log(data);

    // Capturing the incoming data
    let languageName = data.languageName;
    let originalLanguage = data.originalLanguage === 'Yes' ? 1 : 0;
    let subOrDub = data.subOrDub === 'Dub' ? 1 : 0;

    // Creating and running query on the database
    let query = `UPDATE Languages SET languageName = '${languageName}', originalLanguage = ${originalLanguage}, subOrDub = ${subOrDub} WHERE languageID = ${languageID};`;

    // Running the query
    db.pool.query(query, function(error, rows, fields) {
        if (error) {
            console.log(error);
            res.status(400).render('error');
            return;
        }

        // If all went well, redirect to Languages
        res.redirect('/languages');
    });
});

/* DELETE LANGUAGES */
app.delete('/delete-language-ajax/', function(req,res,next){
    let data = req.body;
    let languageID = parseInt(data.id);
    let deleteLanguage= `DELETE FROM Languages WHERE languageID = ?`;

    // Running query
    db.pool.query(deleteLanguage, [languageID], function(error, rows, fields) {
    if (error) {
        console.log(error);
        res.sendStatus(400);
    } else
    {
        res.sendStatus(204);

    }
})
});


/* Retrieving languages */
app.get('/get-languages', function(req, res) {
    // Fetching languages from the Languages table
    let query = 'SELECT languageID, languageName FROM Languages';

    db.pool.query(query, function(error, rows, fields) {
        if (error) {
            console.log(error);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(rows);
        }
    });
});

/* ADD ACTORS */
app.get('/add-actors-form', (req, res) => {
    // Rendering the ADD form
    res.render('add-actors-form');
});

app.post('/add-actors-form', function(req, res) {
    // Capturing the incoming data
    let data = req.body;
    let actorName = data['input-actorName'];
    let languageID = data['input-languageName'];

    // Creating and running query on the database
    let query;

    if (languageID !== undefined && languageID !== '') {
        // If languageID is provided, insert it into the query
        query = `INSERT INTO Actors (actorName, Languages_languageID) VALUES (?, ?)`;
    } else {
        // If languageID is not provided or empty, insert a NULL value for Languages_languageID
        query = `INSERT INTO Actors (actorName) VALUES (?)`;
    }

    db.pool.query(query, [actorName, languageID], function(error, rows, fields) {
        // Checking for error
        if (error) {
            // Logging error and sending HTTP response 400 to visitor indicating it was a bad request.
            console.log(error);
            res.status(400).render('error');
        } else {
            // If there was no error, perform a SELECT * on Actors
            let selectQuery = `SELECT * FROM Actors;`;
            db.pool.query(selectQuery, function(error, rows, fields) {
                // If there was an error on the second query, send a 400
                if (error) {
                    // Logging error and sending HTTP response 400 to visitor indicating it was a bad request.
                    console.log(error);
                    res.sendStatus(400);
                } else {
                    // If all went well, redirect to Actors
                    return res.redirect('actors');
                }
            });
        }
    });
});

/* UPDATE ACTORS */
app.get('/update-actors-form/:actorID?', function(req, res) {
    let actorID = req.params.actorID;

    // Fetching languages for the dropdown
    let languagesQuery = 'SELECT languageID, languageName FROM Languages';
    db.pool.query(languagesQuery, function(langError, langRows, langFields) {
        if (langError) {
            console.error(langError);
            res.sendStatus(500);
            return;
        }

        // Fetching actor data
        let query = `SELECT * FROM Actors WHERE actorID = ${actorID};`;
        db.pool.query(query, function(actorError, actorRows, actorFields) {
            if (actorError) {
                console.error(actorError);
                res.sendStatus(400);
                return;
            }

            // Rendering the update form with the captured data and languages
            res.render('update-actors-form', { data: actorRows[0], languages: langRows });
        });
    });
});

app.post('/update-actors-form/:actorID', function(req, res) {
    let actorID = req.params.actorID;
    let data = req.body;

    // Extracting languageID from the form data
    let languageID = data['input-languageName'];

    // Creating and running the update query on the database
    let updateQuery = `UPDATE Actors SET actorName = ?, Languages_languageID = ? WHERE actorID = ?`;

    db.pool.query(updateQuery, [data['input-actorName'], languageID || null, actorID], function(error, rows, fields) {
        // Checking for error
        if (error) {
            console.log(error);
            res.status(400).render('error');
        } else {
            // If there was no error, redirect to Actors
            res.redirect('/actors');
        }
    });
});

/* DELETE ACTORS */
app.delete('/delete-actor-ajax', function(req,res,next){
    let data = req.body;
    let actorID = parseInt(data.id);
    let deleteActor= `DELETE FROM Actors WHERE actorID = ?`;

    // Running query
    db.pool.query(deleteActor, [actorID], function(error, rows, fields) {
    if (error) {
        console.log(error);
        res.sendStatus(400);
    } else
    {
        res.sendStatus(204);

    }
})
});


/* ADD GENRES */
app.get('/add-genre-form', (req, res) => {
    // Render the ADD form
    res.render('add-genre-form');
});

app.post('/add-genre-form', function(req, res) {
    // Capturing the incoming data
    let data = req.body;

    // Creating and running query on the database
    let query1 = `INSERT INTO Genres (genreName) VALUES ('${data['input-genreName']}')`;

    db.pool.query(query1, function(error, rows, fields){
    // Checking for error
    if (error) {

        // Logging error and sending HTTP response 400 to visitor indicating it was a bad request.
        console.log(error)
        res.status(400).render('error');
    }
    else
    {
        // If there was no error, perform a SELECT * on Genres
        let query2 = `SELECT * FROM Genres;`;
        db.pool.query(query2, function(error, rows, fields){

            // If there was an error on the second query, send a 400
            if (error) {

                // Logging error and sending HTTP response 400 to visitor indicating it was a bad request.
                console.log(error);
                res.sendStatus(400);
            }
            // If all went well, redirect to Genres
            else
            {
                return res.redirect('genres');
            }
        })
    }
    })
});

/* UPDATE GENRES */
app.get('/update-genre-form/:genreID?', function(req, res) {
    let genreID = req.params.genreID;

    // Creating and running query on the database
    let query = `SELECT * FROM Genres WHERE genreID = ${genreID};`;

    // Running the query
    db.pool.query(query, function(error, rows, fields) {
        // Checking for error
        if (error) {
            // Logging error and sending HTTP response 400 to visitor indicating it was a bad request.
            console.log(error);
            res.sendStatus(400);
        }

        // Rendering the update form with the captured data
        return res.render('update-genre-form', { data: rows[0] });
    });
});

app.post('/update-genre-form/:genreID', function(req, res) {
    let genreID = req.params.genreID;
    let data = req.body;

    // Capturing the incoming data
    let genreName = data.genreName;

    // Creating and running query on the database
    let query = `UPDATE Genres SET genreName = '${genreName}' WHERE genreID = ${genreID};`;

    // Running the query
    db.pool.query(query, function(error, rows, fields) {
        // Checking for error
        if (error) {
            // Logging error and sending HTTP response 400 to visitor indicating it was a bad request.
            console.log(error);
            res.status(400).render('error');
            return;
        }

            // If all went well, redirect to Genres
            res.redirect('/genres');
    });
});

/* DELETE GENRES */
app.delete('/delete-genre-ajax/', function(req,res,next){
    let data = req.body;
    let genreID = parseInt(data.id);
    let deleteGenre= `DELETE FROM Genres WHERE genreID = ?`;

    // Running query
    db.pool.query(deleteGenre, [genreID], function(error, rows, fields) {
    if (error) {
        console.log(error);
        res.sendStatus(400);
    } else
    {
        res.sendStatus(204);

    }
})
});

/* ADD RELEASES */
app.get('/add-release-form', (req, res) => {
    // Render the ADD form
    res.render('add-release-form');
});

app.post('/add-release-form', function(req, res) {
    // Capturing the incoming data
    let data = req.body;

    let releaseYear = parseInt(data['input-releaseYear']);

    // Creating and running query on the database
    let query1 = `INSERT INTO Releases (releaseYear, releaseMonth) VALUES (${releaseYear}, '${data['input-releaseMonth']}')`;

    db.pool.query(query1, function(error, rows, fields){
    // Checking for error
    if (error) {

        // Logging error and sending HTTP response 400 to visitor indicating it was a bad request.
        console.log(error)
        res.status(400).render('error');
    }
    else
    {
        // If there was no error, perform a SELECT * on Releases
        let query2 = `SELECT * FROM Releases;`;
        db.pool.query(query2, function(error, rows, fields){

            // If there was an error on the second query, send a 400
            if (error) {

                // Logging error and sending HTTP response 400 to visitor indicating it was a bad request.
                console.log(error);
                res.sendStatus(400);
            }
            // If all went well, redirect to Releases
            else
            {
                return res.redirect('releases');
            }
        })
    }
    })
});

/* UPDATE RELEASES */
app.get('/update-release-form/:releaseID?', function(req, res) {
    let releaseID = req.params.releaseID;

    // Creating and running query on the database
    let query = `SELECT * FROM Releases WHERE releaseID = ${releaseID};`;

    // Running the query
    db.pool.query(query, function(error, rows, fields) {
        // Checking for error
        if (error) {
            // Logging error and sending HTTP response 400 to visitor indicating it was a bad request.
            console.log(error);
            res.sendStatus(400);
        }

        // Rendering the update form with the captured data
        return res.render('update-release-form', { data: rows[0] });
    });
});

app.post('/update-release-form/:releaseID', function(req, res) {
    let releaseID = req.params.releaseID;
    let data = req.body;

    // Capturing the incoming data
    let releaseYear = parseInt(data.releaseYear);
    let releaseMonth = data.releaseMonth;


    // Creating and running query on the database
    let query = `UPDATE Releases SET releaseYear = ${releaseYear}, releaseMonth = '${releaseMonth}' WHERE releaseID = ${releaseID};`;

    // Running the query
    db.pool.query(query, function(error, rows, fields) {
        // Checking for error
        if (error) {
            // Logging error and sending HTTP response 400 to visitor indicating it was a bad request.
            console.log(error);
            res.status(400).render('error');
            return;
        }

            // If all went well, redirect to Releases
            res.redirect('/releases');
    });
});

/* DELETE RELEASES */
app.delete('/delete-release-ajax/', function(req,res,next){
    let data = req.body;
    let releaseID = parseInt(data.id);
    let deleteRelease= `DELETE FROM Releases WHERE releaseID = ?`;

    // Running query
    db.pool.query(deleteRelease, [releaseID], function(error, rows, fields) {
    if (error) {
        console.log(error);
        res.sendStatus(400);
    } else
    {
        res.sendStatus(204);

    }
})
});

/* Retrieving movie titles */
app.get('/get-movies', function(req, res) {
    // Fetching movie titles from the Movies table
    let query = 'SELECT movieID, title FROM Movies';

    db.pool.query(query, function(error, rows, fields) {
        if (error) {
            console.log(error);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(rows);
        }
    });
});

/* ADD MOVIES - LANGUAGES */
app.get('/add-movies-languages-form', (req, res) => {
    // Rendering the ADD form
    res.render('add-movies-languages-form');
});

app.post('/add-movies-languages-form', function(req, res) {
    // Capturing the incoming data
    let data = req.body;
    let movieID = data['input-title'];
    let languageID = data['input-languageName'];

    // Creating and running query on the database
    let query = `INSERT INTO Movies_has_Languages (Movies_movieID, Languages_languageID) VALUES (?, ?)`;

    db.pool.query(query, [movieID, languageID], function(error, rows, fields) {
        // Checking for error
        if (error) {
            // Logging error and sending HTTP response 400 to visitor indicating it was a bad request.
            console.log(error);
            res.status(400).render('error');
        } else {
            // If there was no error, perform a SELECT * on Movies - Languages
            let selectQuery = `SELECT * FROM Movies_has_Languages;`;
            db.pool.query(selectQuery, function(error, rows, fields) {
                // If there was an error on the second query, send a 400
                if (error) {
                    // Logging error and sending HTTP response 400 to visitor indicating it was a bad request.
                    console.log(error);
                    res.sendStatus(400);
                } else {
                    // If all went well, redirect to Movies - Languages
                    return res.redirect('movies-languages');
                }
            });
        }
    });
});

/* UPDATE MOVIES - LANGUAGES */
app.get('/update-movies-languages-form/:Movies_movieID/:Languages_languageID?', function(req, res) {
    let Movies_movieID = parseInt(req.params.Movies_movieID);
    let Languages_languageID = parseInt(req.params.Languages_languageID);

    // Fetching movie titles for the dropdown
    let moviesQuery = 'SELECT movieID, title FROM Movies';
    db.pool.query(moviesQuery, function(movieError, movieRows, movieFields) {
        if (movieError) {
            console.log(movieError);
            res.sendStatus(500);
            return;
        }

    // Fetching languages for the dropdown
    let languagesQuery = 'SELECT languageID, languageName FROM Languages';
    db.pool.query(languagesQuery, function(langError, langRows, langFields) {
        if (langError) {
            console.error(langError);
            res.sendStatus(500);
            return;
        }

    // Fetching actor data
    let query = `SELECT * FROM Movies_has_Languages WHERE Movies_movieID = ${Movies_movieID} AND Languages_languageID = ${Languages_languageID};`;
    db.pool.query(query, function(error, rows, fields) {
        if (error) {
            console.error(error);
            res.sendStatus(400);
            return;
        }

        // Rendering the update form with the captured data and languages
        res.render('update-movies-languages-form', { data: rows[0], movieTitles: movieRows, languages: langRows });
    })
    });
})
});


app.post('/update-movies-languages-form/:Movies_movieID/:Languages_languageID', function(req, res) {
    let Movies_movieID = parseInt(req.params.Movies_movieID);
    let Languages_languageID = parseInt(req.params.Languages_languageID);
    let data = req.body;

    // Extracting movieID from the form data
    let movieID = data['input-title'];

    // Extracting languageID from the form data
    let languageID = data['input-languageName'];

    // Creating and running the update query on the database
    let updateQuery = `UPDATE Movies_has_Languages SET Movies_movieID = ?, Languages_languageID = ? WHERE Movies_movieID = ? AND Languages_languageID = ?`;

    db.pool.query(updateQuery, [movieID, languageID, Movies_movieID, Languages_languageID], function(error, rows, fields) {
        // Checking for error
        if (error) {
            console.log(error);
            res.status(400).render('error');
        } else {
            // If there was no error, redirect to Movies - Languages
            res.redirect('/movies-languages');
        }
    });
});

/* DELETE MOVIES - LANGUAGES */
app.delete('/delete-movies-languages-ajax/', function(req,res,next){
    let data = req.body;
    let Movies_movieID = parseInt(data.id);
    let Languages_languageID = parseInt(data.id2);
    let deleteMoviesLanguages= `DELETE FROM Movies_has_Languages WHERE Movies_movieID = ? AND Languages_languageID = ?`;

    // Running query
    db.pool.query(deleteMoviesLanguages, [Movies_movieID, Languages_languageID], function(error, rows, fields) {
    if (error) {
        console.log(error);
        res.sendStatus(400);
    } else
    {
        res.sendStatus(204);

    }
})
});


/* Retrieving genres */
app.get('/get-genres', function(req, res) {
    // Fetching genres from the Genres table
    let query = 'SELECT genreID, genreName FROM Genres';

    db.pool.query(query, function(error, rows, fields) {
        if (error) {
            console.log(error);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(rows);
        }
    });
});


/* ADD MOVIES - GENRES */
app.get('/add-movies-genres-form', (req, res) => {
    // Rendering the ADD form
    res.render('add-movies-genres-form');
});

app.post('/add-movies-genres-form', function(req, res) {
    // Capturing the incoming data
    let data = req.body;
    let movieID = data['input-title'];
    let genreID = data['input-genreName'];

    // Creating and running query on the database
    let query = `INSERT INTO Movies_has_Genres (Movies_movieID, Genres_genreID) VALUES (?, ?)`;

    db.pool.query(query, [movieID, genreID], function(error, rows, fields) {
        // Checking for error
        if (error) {
            // Logging error and sending HTTP response 400 to visitor indicating it was a bad request.
            console.log(error);
            res.status(400).render('error');
        } else {
            // If there was no error, perform a SELECT * on Movies - Genres
            let selectQuery = `SELECT * FROM Movies_has_Genres;`;
            db.pool.query(selectQuery, function(error, rows, fields) {
                // If there was an error on the second query, send a 400
                if (error) {
                    // Logging error and sending HTTP response 400 to visitor indicating it was a bad request.
                    console.log(error);
                    res.sendStatus(400);
                } else {
                    // If all went well, redirect to Movies - Genres
                    return res.redirect('movies-genres');
                }
            });
        }
    });
});

/* UPDATE MOVIES - GENRES */
app.get('/update-movies-genres-form/:Movies_movieID/:Genres_genreID?', function(req, res) {
    let Movies_movieID = parseInt(req.params.Movies_movieID);
    let Genres_genreID = parseInt(req.params.Genres_genreID);

    // Fetching movie titles for the dropdown
    let moviesQuery = 'SELECT movieID, title FROM Movies';
    db.pool.query(moviesQuery, function(movieError, movieRows, movieFields) {
        if (movieError) {
            console.log(movieError);
            res.sendStatus(500);
            return;
        }

    // Fetching genres for the dropdown
    let genresQuery = 'SELECT genreID, genreName FROM Genres';
    db.pool.query(genresQuery, function(genError, genRows, genFields) {
        if (genError) {
            console.error(genError);
            res.sendStatus(500);
            return;
        }

    // Fetching actor data
    let query = `SELECT * FROM Movies_has_Genres WHERE Movies_movieID = ${Movies_movieID} AND Genres_genreID = ${Genres_genreID};`;
    db.pool.query(query, function(error, rows, fields) {
        if (error) {
            console.error(error);
            res.sendStatus(400);
            return;
        }

        // Rendering the update form with the captured data and genres
        res.render('update-movies-genres-form', { data: rows[0], movieTitles: movieRows, genres: genRows });
    })
    });
})
});

app.post('/update-movies-genres-form/:Movies_movieID/:Genres_genreID', function(req, res) {
    let Movies_movieID = parseInt(req.params.Movies_movieID);
    let Genres_genreID = parseInt(req.params.Genres_genreID);
    let data = req.body;

    // Extracting movieID from the form data
    let movieID = data['input-title'];

    // Extracting genreID from the form data
    let genreID = data['input-genreName'];

    // Creating and running the update query on the database
    let updateQuery = `UPDATE Movies_has_Genres SET Movies_movieID = ?, Genres_genreID = ? WHERE Movies_movieID = ? AND Genres_genreID = ?`;

    db.pool.query(updateQuery, [movieID, genreID, Movies_movieID, Genres_genreID], function(error, rows, fields) {
        // Checking for error
        if (error) {
            console.log(error);
            res.status(400).render('error');
        } else {
            // If there was no error, redirect to Movies - Genres
            res.redirect('/movies-genres');
        }
    });
});

/* DELETE MOVIES - GENRES */
app.delete('/delete-movies-genres-ajax/', function(req,res,next){
    let data = req.body;
    let Movies_movieID = parseInt(data.id);
    let Genres_genreID = parseInt(data.id2);
    let deleteMoviesGenres= `DELETE FROM Movies_has_Genres WHERE Movies_movieID = ? AND Genres_genreID = ?`;

    // Running query
    db.pool.query(deleteMoviesGenres, [Movies_movieID, Genres_genreID], function(error, rows, fields) {
    if (error) {
        console.log(error);
        res.sendStatus(400);
    } else
    {
        res.sendStatus(204);

    }
})
});


/* Retrieving actors */
app.get('/get-actors', function(req, res) {
    // Fetching actors from the Actors table
    let query = 'SELECT actorID, actorName FROM Actors';

    db.pool.query(query, function(error, rows, fields) {
        if (error) {
            console.log(error);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(rows);
        }
    });
});

/* ADD MOVIES - ACTORS */
app.get('/add-movies-actors-form', (req, res) => {
    // Rendering the ADD form
    res.render('add-movies-actors-form');
});

app.post('/add-movies-actors-form', function(req, res) {
    // Capturing the incoming data
    let data = req.body;
    let movieID = data['input-title'];
    let actorID = data['input-actorName'];

    // Creating and running query on the database
    let query = `INSERT INTO Movies_has_Actors (Movies_movieID, Actors_actorID) VALUES (?, ?)`;

    db.pool.query(query, [movieID, actorID], function(error, rows, fields) {
        // Checking for error
        if (error) {
            // Logging error and sending HTTP response 400 to visitor indicating it was a bad request.
            console.log(error);
            res.status(400).render('error');
        } else {
            // If there was no error, perform a SELECT * on Movies - Actors
            let selectQuery = `SELECT * FROM Movies_has_Actors;`;
            db.pool.query(selectQuery, function(error, rows, fields) {
                // If there was an error on the second query, send a 400
                if (error) {
                    // Logging error and sending HTTP response 400 to visitor indicating it was a bad request.
                    console.log(error);
                    res.sendStatus(400);
                } else {
                    // If all went well, redirect to Movies - Actors
                    return res.redirect('movies-actors');
                }
            });
        }
    });
});

/* UPDATE MOVIES - ACTORS */
app.get('/update-movies-actors-form/:Movies_movieID/:Actors_actorID?', function(req, res) {
    let Movies_movieID = parseInt(req.params.Movies_movieID);
    let Actors_actorID = parseInt(req.params.Actors_actorID);

    // Fetching movie titles for the dropdown
    let moviesQuery = 'SELECT movieID, title FROM Movies';
    db.pool.query(moviesQuery, function(movieError, movieRows, movieFields) {
        if (movieError) {
            console.log(movieError);
            res.sendStatus(500);
            return;
        }

    // Fetching actors for the dropdown
    let actorsQuery = 'SELECT actorID, actorName FROM Actors';
    db.pool.query(actorsQuery, function(genError, genRows, genFields) {
        if (genError) {
            console.error(genError);
            res.sendStatus(500);
            return;
        }

    // Fetching actor data
    let query = `SELECT * FROM Movies_has_Actors WHERE Movies_movieID = ${Movies_movieID} AND Actors_actorID = ${Actors_actorID};`;
    db.pool.query(query, function(error, rows, fields) {
        if (error) {
            console.error(error);
            res.sendStatus(400);
            return;
        }

        // Rendering the update form with the captured data and actors
        res.render('update-movies-actors-form', { data: rows[0], movieTitles: movieRows, actors: genRows });
    })
    });
})
});

app.post('/update-movies-actors-form/:Movies_movieID/:Actors_actorID', function(req, res) {
    let Movies_movieID = parseInt(req.params.Movies_movieID);
    let Actors_actorID = parseInt(req.params.Actors_actorID);
    let data = req.body;

    // Extracting movieID from the form data
    let movieID = data['input-title'];

    // Extracting actorID from the form data
    let actorID = data['input-actorName'];

    // Creating and running the update query on the database
    let updateQuery = `UPDATE Movies_has_Actors SET Movies_movieID = ?, Actors_actorID = ? WHERE Movies_movieID = ? AND Actors_actorID = ?`;

    db.pool.query(updateQuery, [movieID, actorID, Movies_movieID, Actors_actorID], function(error, rows, fields) {
        // Checking for error
        if (error) {
            console.log(error);
            res.status(400).render('error');
        } else {
            // If there was no error, redirect to Movies - Actors
            res.redirect('/movies-actors');
        }
    });
});

/* DELETE MOVIES - ACTORS */
app.delete('/delete-movies-actors-ajax/', function(req,res,next){
    let data = req.body;
    let Movies_movieID = parseInt(data.id);
    let Actors_actorID = parseInt(data.id2);
    let deleteMoviesActors= `DELETE FROM Movies_has_Actors WHERE Movies_movieID = ? AND Actors_actorID = ?`;

    // Running query
    db.pool.query(deleteMoviesActors, [Movies_movieID, Actors_actorID], function(error, rows, fields) {
    if (error) {
        console.log(error);
        res.sendStatus(400);
    } else
    {
        res.sendStatus(204);

    }
})
});



/* Retrieving releases */
app.get('/get-releases', function(req, res) {
    // Fetching year and month from the Releases table
    let query = 'SELECT releaseID, releaseYear, releaseMonth FROM Releases';

    db.pool.query(query, function(error, rows, fields) {
        if (error) {
            console.log(error);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(rows);
        }
    });
});


/* ADD MOVIES - RELEASES */
app.get('/add-movies-releases-form', (req, res) => {
    // Rendering the ADD form
    res.render('add-movies-releases-form');
});

app.post('/add-movies-releases-form', function(req, res) {
    // Capturing the incoming data
    let data = req.body;
    let movieID = data['input-title'];
    let releaseID = data['input-release'];

    // Creating and running query on the database
    let query = `INSERT INTO Releases_has_Movies (Movies_movieID, Releases_releaseID) VALUES (?, ?, ?)`;

    db.pool.query(query, [movieID, releaseID], function(error, rows, fields) {
        // Checking for error
        if (error) {
            // Logging error and sending HTTP response 400 to the visitor indicating it was a bad request.
            console.log(error);
            res.status(400).render('error');
        } else {
            // If there was no error, redirect to Movies - Releases
            return res.redirect('/movies-releases');
        }
    });
});


/* UPDATE MOVIES - RELEASES */
app.get('/update-movies-releases-form/:Movies_movieID/:Releases_releaseID?', function(req, res) {
    let Movies_movieID = parseInt(req.params.Movies_movieID);
    let Releases_releaseID = parseInt(req.params.Releases_releaseID);

    // Fetching movie titles for the dropdown
    let moviesQuery = 'SELECT movieID, title FROM Movies';
    db.pool.query(moviesQuery, function(movieError, movieRows, movieFields) {
        if (movieError) {
            console.log(movieError);
            res.sendStatus(500);
            return;
        }

    // Fetching releases for the dropdown
    let releasesQuery = 'SELECT releaseID, releaseYear, releaseMonth FROM Releases';
    db.pool.query(releasesQuery, function(relError, relRows, relFields) {
        if (relError) {
            console.error(relError);
            res.sendStatus(500);
            return;
        }

    // Fetching actor data
    let query = `SELECT * FROM Releases_has_Movies WHERE Movies_movieID = ${Movies_movieID} AND Releases_releaseID = ${Releases_releaseID};`;
    db.pool.query(query, function(error, rows, fields) {
        if (error) {
            console.error(error);
            res.sendStatus(400);
            return;
        }

        // Rendering the update form with the captured data and releases
        res.render('update-movies-releases-form', { data: rows[0], movieTitles: movieRows, releases: relRows });
    })
    });
})
});

app.post('/update-movies-releases-form/:Movies_movieID/:Releases_releaseID', function(req, res) {
    let Movies_movieID = parseInt(req.params.Movies_movieID);
    let Releases_releaseID = parseInt(req.params.Releases_releaseID);
    let data = req.body;

    // Extracting movieID from the form data
    let movieID = data['input-title'];

    // Extracting releaseID from the form data
    let releaseID = data['input-release'];

    // Creating and running the update query on the database
    let updateQuery = `UPDATE Releases_has_Movies SET Movies_movieID = ?, Releases_releaseID = ?,  WHERE Movies_movieID = ? AND Releases_releaseID = ?`;

    db.pool.query(updateQuery, [movieID, releaseID, Movies_movieID, Releases_releaseID], function(error, rows, fields) {
        // Checking for error
        if (error) {
            console.log(error);
            res.status(400).render('error');
        } else {
            // If there was no error, redirect to Movies - Releases
            res.redirect('/movies-releases');
        }
    });
});

/* DELETE MOVIES - RELEASES */
app.delete('/delete-movies-releases-ajax/', function(req,res,next){
    let data = req.body;
    let Movies_movieID = parseInt(data.id);
    let Releases_releaseID = parseInt(data.id2);
    let deleteMoviesReleases= `DELETE FROM Releases_has_Movies WHERE Movies_movieID = ? AND Releases_releaseID = ?`;

    // Running query
    db.pool.query(deleteMoviesReleases, [Movies_movieID, Releases_releaseID], function(error, rows, fields) {
    if (error) {
        console.log(error);
        res.sendStatus(400);
    } else
    {
        res.sendStatus(204);

    }
})
});



/* LISTENER */
app.listen(PORT, function(){            // Receiving requests on the specified PORT
    console.log('Express started on http://localhost:' + PORT + '; press Ctrl-C to terminate.')
});