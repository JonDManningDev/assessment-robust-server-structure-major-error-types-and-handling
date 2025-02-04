const express = require("express");
const app = express();

const path = require("path");
const notes = require(path.resolve("src/data/notes-data"));

app.use(express.json());

//Validator Middleware:

function matchId(req, res, next) {
  const noteId = Number(req.params.noteId);
  const foundNote = notes.find((note) => note.id === noteId);

  if (foundNote) {
    req.foundNote = foundNote;
    next();
  } else {
    return next({
      status: 404,
      message: `Note id not found: ${req.params.noteId}`});
  }
}

function bodyHasText(req, res, next) {
  const { data: { text } = {} } = req.body;

  if (text) {
    next();
  } else {
    next({
      status: 400,
      message: "A 'text' property is required."
    });
  }
}

//Routes:

app.get("/notes/:noteId", matchId, (req, res) => {
  
  res.json({ data: req.foundNote });
});

app.get("/notes", (req, res) => {
  res.json({ data: notes });
});

let lastNoteId = notes.reduce((maxId, note) => Math.max(maxId, note.id), 0);

app.post("/notes", bodyHasText, (req, res) => {
  const text = req.body.data.text

  const newNote = {
    id: ++lastNoteId, // Increment last id then assign as the current ID
    text,
  };
  notes.push(newNote);
  res.status(201).json({ data: newNote });
});

// Not found handler
app.use((req, res, next) => {
  next({
    status: 404,
    message: `Not found: ${req.originalUrl}`});
});

// Error handler
app.use((error, req, res, next) => {
  console.error(error);
  const { status = 500, message = "Something went wrong!" } = error;
  res.status(status).json({ error: message });
});

module.exports = app;
