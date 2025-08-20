SET FOREIGN_KEY_CHECKS=0;
SET AUTOCOMMIT = 0;

-- -----------------------------------------------------
-- Table `Movies`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Movies`;
CREATE TABLE `Movies` (
  `movieID` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(200) NOT NULL UNIQUE,
  `synopsis` VARCHAR(1000) NOT NULL,
  `minutes` INT NOT NULL,
  PRIMARY KEY (`movieID`)
)ENGINE = InnoDB;


INSERT INTO Movies (title, synopsis, minutes)
VALUES
(
    "Forrest Gump",
    "Forrest Gump has never thought of himself as disadvantaged, and thanks to his supportive mother, he leads anything but a restricted life. Whether dominating on the gridiron as a college football star, fighting in Vietnam or captaining a shrimp boat, Forrest inspires people with his childlike optimism. But one person Forrest cares about most may be the most difficult to save -- his childhood love, the sweet but troubled Jenny.",
    142
),
(
    "The Sound of Music",
    "A tuneful, heartwarming story, it is based on the real life story of the Von Trapp Family singers, one of the world's best-known concert groups in the era immediately preceding World War II. Julie Andrews plays the role of Maria, the tomboyish postulant at an Austrian abbey who becomes a governess in the home of a widowed naval captain with seven children, and brings a new love of life and music into the home.",
    174
),
(
    "Pan's Labyrinth",
    "The narrative intertwines this real world with a mythical world centered on an overgrown, abandoned labyrinth and a mysterious faun with whom the protagonist, Ofelia, interacts. Ofelia's stepfather, Captain Vidal, hunts down the Spanish Maquis who resist the Francoist regime, while Ofelia's pregnant mother grows increasingly ill. Ofelia meets several strange and magical creatures who become central to her story, leading her through the trials of the old labyrinth garden.",
    120
);


-- -----------------------------------------------------
-- Table `Languages`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Languages`;
CREATE TABLE `Languages` (
  `languageID` INT NOT NULL AUTO_INCREMENT,
  `languageName` VARCHAR(45) NOT NULL UNIQUE,
  `originalLanguage` TINYINT NOT NULL DEFAULT 1,
  `subOrDub` TINYINT NOT NULL DEFAULT 0,
  PRIMARY KEY (`languageID`)
)ENGINE = InnoDB;

INSERT INTO Languages (languageName, originalLanguage, subOrDub)
VALUES
("English", 1, 0),
("Spanish", 0, 1),
("French", 0, 1);


-- -----------------------------------------------------
-- Table `Actors`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Actors`;
CREATE TABLE `Actors` (
  `actorID` INT NOT NULL AUTO_INCREMENT,
  `actorName` VARCHAR(200) NOT NULL UNIQUE,
  `Languages_languageID` INT,
  PRIMARY KEY (`actorID`),
  INDEX `fk_Actors_Languages1_idx` (`Languages_languageID` ASC) VISIBLE,
  CONSTRAINT `fk_Actors_Languages1`
    FOREIGN KEY (`Languages_languageID`) REFERENCES `Languages` (`languageID`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
)ENGINE = InnoDB;

INSERT INTO Actors (actorName, Languages_languageID)
VALUES
("Tom Hanks", (SELECT languageID FROM Languages WHERE languageName = "English")),
("Julie Andrews", (SELECT languageID FROM Languages WHERE languageName = "English")),
("Sergi López", (SELECT languageID FROM Languages WHERE languageName = "Spanish")),
("Sergi López", (SELECT languageID FROM Languages WHERE languageName = "French"));


-- -----------------------------------------------------
-- Table `Genres`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Genres`;
CREATE TABLE `Genres` (
  `genreID` INT NOT NULL AUTO_INCREMENT,
  `genreName` VARCHAR(45) NOT NULL UNIQUE,
  PRIMARY KEY (`genreID`)
)ENGINE = InnoDB;

INSERT INTO Genres (genreName)
VALUES
("Drama"), ("Comedy"), ("Fantasy");


-- -----------------------------------------------------
-- Table `Releases`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Releases`;
CREATE TABLE `Releases` (
  `releaseID` INT NOT NULL AUTO_INCREMENT,
  `releaseYear` INT NOT NULL,
  `releaseMonth` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`releaseID`),
  UNIQUE KEY `unique_year_month` (`releaseYear`, `releaseMonth`)
)ENGINE = InnoDB;

INSERT INTO Releases (releaseYear, releaseMonth)
VALUES
(1994, "July"), (1965, "March"), (2006, "October");


-- -----------------------------------------------------
-- Table `Movies_has_Languages`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Movies_has_Languages`;
CREATE TABLE `Movies_has_Languages` (
  `Movies_movieID` INT NOT NULL,
  `Languages_languageID` INT NOT NULL,
  PRIMARY KEY (`Movies_movieID`, `Languages_languageID`),
  INDEX `fk_Movies_has_Languages_Languages1_idx` (`Languages_languageID` ASC) VISIBLE,
  INDEX `fk_Movies_has_Languages_Movies_idx` (`Movies_movieID` ASC) VISIBLE,
  CONSTRAINT `fk_Movies_has_Languages_Movies`
    FOREIGN KEY (`Movies_movieID`) REFERENCES `Movies` (`movieID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_Movies_has_Languages_Languages1`
    FOREIGN KEY (`Languages_languageID`) REFERENCES `Languages` (`languageID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
)ENGINE = InnoDB;

INSERT INTO Movies_has_Languages (Movies_movieID, Languages_languageID)
VALUES
(
    (SELECT movieID FROM Movies WHERE Movies.title = "Forrest Gump"),
    (SELECT languageID FROM Languages WHERE Languages.languageName = "English")
),
(
    (SELECT movieID FROM Movies WHERE Movies.title = "The Sound of Music"),
    (SELECT languageID FROM Languages WHERE Languages.languageName = "English")
),
(
    (SELECT movieID FROM Movies WHERE Movies.title = "Pan's Labyrinth"),
    (SELECT languageID FROM Languages WHERE Languages.languageName = "Spanish")
),
(
    (SELECT movieID FROM Movies WHERE Movies.title = "Pan's Labyrinth"),
    (SELECT languageID FROM Languages WHERE Languages.languageName = "French")
);


-- -----------------------------------------------------
-- Table `Movies_has_Genres`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Movies_has_Genres`;
CREATE TABLE `Movies_has_Genres` (
  `Movies_movieID` INT NOT NULL,
  `Genres_genreID` INT NOT NULL,
  PRIMARY KEY (`Movies_movieID`, `Genres_genreID`),
  INDEX `fk_Movies_has_Genres_Genres1_idx` (`Genres_genreID` ASC) VISIBLE,
  INDEX `fk_Movies_has_Genres_Movies1_idx` (`Movies_movieID` ASC) VISIBLE,
  CONSTRAINT `fk_Movies_has_Genres_Movies1`
    FOREIGN KEY (`Movies_movieID`)
    REFERENCES `Movies` (`movieID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_Movies_has_Genres_Genres1`
    FOREIGN KEY (`Genres_genreID`)
    REFERENCES `Genres` (`genreID`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
)ENGINE = InnoDB;

INSERT INTO Movies_has_Genres (Movies_movieID, Genres_genreID)
VALUES
(
    (SELECT movieID FROM Movies WHERE Movies.title = "Forrest Gump"),
    (SELECT genreID FROM Genres WHERE Genres.genreName = "Drama")
),
(
    (SELECT movieID FROM Movies WHERE Movies.title = "Forrest Gump"),
    (SELECT genreID FROM Genres WHERE Genres.genreName = "Comedy")
),
(
    (SELECT movieID FROM Movies WHERE Movies.title = "The Sound of Music"),
    (SELECT genreID FROM Genres WHERE Genres.genreName = "Musical")
),
(
    (SELECT movieID FROM Movies WHERE Movies.title = "Pan's Labyrinth"),
    (SELECT genreID FROM Genres WHERE Genres.genreName = "Fantasy")
);


-- -----------------------------------------------------
-- Table `Movies_has_Actors`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Movies_has_Actors`;
CREATE TABLE `Movies_has_Actors` (
  `Movies_movieID` INT NOT NULL,
  `Actors_actorID` INT NOT NULL,
  PRIMARY KEY (`Movies_movieID`, `Actors_actorID`),
  INDEX `fk_Movies_has_Actors_Actors1_idx` (`Actors_actorID` ASC) VISIBLE,
  INDEX `fk_Movies_has_Actors_Movies1_idx` (`Movies_movieID` ASC) VISIBLE,
  CONSTRAINT `fk_Movies_has_Actors_Movies1`
    FOREIGN KEY (`Movies_movieID`)
    REFERENCES `Movies` (`movieID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_Movies_has_Actors_Actors1`
    FOREIGN KEY (`Actors_actorID`)
    REFERENCES `Actors` (`actorID`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
)ENGINE = InnoDB;

INSERT INTO Movies_has_Actors (Movies_movieID, Actors_actorID)
VALUES
(
    (SELECT movieID FROM Movies WHERE Movies.title = "Forrest Gump"),
    (SELECT actorID FROM Actors WHERE Actors.actorName = "Tom Hanks")
),
(
    (SELECT movieID FROM Movies WHERE Movies.title = "The Sound of Music"),
    (SELECT actorID FROM Actors WHERE Actors.actorName = "Julie Andrews")
),
(
    (SELECT movieID FROM Movies WHERE Movies.title = "Pan's Labyrinth"),
    (SELECT actorID FROM Actors WHERE Actors.actorName = "Sergi López")
),

-- ----------------------------------------------
SET FOREIGN_KEY_CHECKS=1;
COMMIT;