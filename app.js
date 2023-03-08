const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());
let dataBase = null;

const dbPath = path.join(__dirname, "cricketTeam.db");

const cricketTeamPlayers = async () => {
  try {
    dataBase = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("server is running at http://localhost:3000");
    });
  } catch (error) {
    console.log(`Data Base Error is ${error}`);
    process.exit(1);
  }
};
cricketTeamPlayers();

// return a list of all the players from the team
// API 1

const convertObject = (obj) => {
  return {
    playerId: obj.player_id,
    playerName: obj.player_name,
    jerseyNumber: obj.jersey_number,
    role: obj.role,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayerQuery = `SELECT * FROM cricket_team`;
  const getPlayerList = await dataBase.all(getPlayerQuery);
  response.send(getPlayerList.map((each) => convertObject(each)));
});

//post a player into database
//API 2

app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const cricketPlayerQuery = `insert into  cricket_team (player_name, jersey_number,role)
  values('${playerName}',${jerseyNumber},'${role}');`;
  const creatList = await dataBase.run(cricketPlayerQuery);
  response.send("Player Added to Team");
});

//get the player details on the player id
// API 3
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerDetailQuery = `select * from cricket_team where player_id = ${playerId};`;
  const getPlayerResponse = await dataBase.get(getPlayerDetailQuery);

  response.send(convertObject(getPlayerResponse));
});

// update the details of the players using player Id
// API 4
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;
  const updateList = `update cricket_team set 
  player_name = '${playerName}' , jersey_number = ${jerseyNumber} , role = '${role}' 
  where player_id = ${playerId};`;
  await dataBase.run(updateList);
  response.send("Player Details Updated");
});

// delete the player details
//API 5
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `delete from cricket_team where player_id =${playerId};`;
  await dataBase.run(deleteQuery);
  response.send("Player Removed");
});
module.exports = app;
