import React, { Component } from "react";

import axios from "axios";

export default class App extends Component {
  constructor(props) {
    super();
    this.state = {
      // list: true,
      // card: false,
      // players: [],
      // player: {},
      loggedIn: false,
      username: "",
      password: "",
      screen: {},
      msg: "",
      credentials: "",
    };
  }

  componentDidMount() {
    // this.setState({ msg: "App.js was mounted" });
    axios
      // .get("/register", {
      //   data: {
      //     ID: 12345,
      //   },
      // })
      .get("/register")
      .then(function (response) {
        console.log("Oh yeah I got it\n");
        console.log("This: ", this);
        // this.setState({ screen: "response.data" });
      })
      .catch(function (error) {
        console.log("Hello I'm here\n", error);
      })
      .then(function () {
        // always executed
      });
  }

  // componentDidMount() {
  //   fetch("http://localhost:3001/players/list")
  //     .then((response) => response.json())
  //     .then((responseJson) => {
  //       this.setState({ players: responseJson.data });
  //     });
  // }

  // showCard = (id) => {
  //   fetch(`http://localhost:3001/players/list/${id}`)
  //     .then((response) => response.json())
  //     .then((responseJson) => {
  //       this.setState({ player: responseJson.data });
  //     });
  //   this.setState({
  //     list: false,
  //     card: true,
  //   });
  // };

  // showList = () => {
  //   this.setState({
  //     card: false,
  //     list: true,
  //   });
  // };

  deleteCookie = async () => {
    try {
      await axios.get("/clear-cookie");
      // setScreen("auth");
      this.setState({
        loggedIn: false,
        msg: "You are logged out",
        username: "",
        password: "",
      });
    } catch (e) {
      console.log(e);
    }
  };

  logout = () => {
    this.deleteCookie();
  };

  auth = async () => {
    try {
      const credentials = {
        username: this.state.username,
        password: this.state.password,
      };
      const res = await axios.post("/testLogin", credentials);
      // this.setState({ credentials: res.data });

      if (res.data.loggedIn !== undefined) {
        this.setState({ loggedIn: res.data.loggedIn });
        this.setState({ msg: res.data.msg });
      }
    } catch (e) {
      console.log(e);
    }
  };

  login = () => {
    this.auth();
  };

  render() {
    return (
      <div className="container">
        <div className="container">
          {this.state.loggedIn ? (
            <div>
              <p>{this.state.screen}</p>
              <button onClick={() => this.logout()}>Logout</button>
            </div>
          ) : (
            // <div>{this.state.screen}</div>
            <div>
              <label>Username: </label>
              <br />
              <input
                type="text"
                onChange={(e) => this.setState({ username: e.target.value })}
              />
              <br />
              <label>Password: </label>
              <br />
              <input
                type="password"
                onChange={(e) => this.setState({ password: e.target.value })}
              />
              <br />
              <button onClick={() => this.login()}>Login</button>

              <p>msg: {this.state.msg}</p>
            </div>
          )}
        </div>
        {/* {this.state.list ? (
          <div className="list-group">
            {this.state.players.map((player) => (
              <li
                onClick={() => this.showCard(player._id)}
                className="list-group-item list-group-item-action"
              >
                {player.name}
              </li>
            ))}
          </div>
        ) : null}
        {this.state.card ? (
          <div class="card" style={{ width: "18rem" }}>
            <div class="card-body">
              <h5 class="card-title">{this.state.player.name}</h5>
              <p class="card-text">{this.state.player.runs}</p>
              <div onClick={() => this.showList()} class="btn btn-primary">
                Back
              </div>
            </div>
          </div>
        ) : null} */}
      </div>
    );
  }
}

/* DEFAULT APP.JS FILE
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
*/
