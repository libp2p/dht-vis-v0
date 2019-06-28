import React from "react";
import ReactDOM from "react-dom";
import ReactList from "react-list";
import "./index.css";
import cytoscape from "cytoscape";

import API from "./api.js";

let circle = (window.cy = cytoscape({
  container: document.getElementById("circle"),

  boxSelectionEnabled: false,
  autounselectify: true,

  layout: {
    name: "circle"
  },

  style: [
    {
      selector: "node",
      style: {
        height: 20,
        width: 20,
        "background-color": "#e8e406"
      }
    },

    {
      selector: "edge",
      style: {
        "curve-style": "haystack",
        "haystack-radius": 0,
        width: 5,
        opacity: 0.5,
        "line-color": "#f2f08c"
      }
    }
  ]
}));

const EventTypes = [
  "SendingQuery",
  "PeerResponse",
  "FinalPeer",
  "QueryError",
  "Provider",
  "Value",
  "AddingPeer",
  "DialingPeer"
];

function parseEvent(rawEvent) {
  return {
    id: rawEvent.ID,
    type: EventTypes[rawEvent.Type],
    responses: rawEvent.Responses,
    extra: parseInt(rawEvent.Extra, 10)
  };
}

class Log extends React.Component {
  state = {
    events: [],
    peers: [],
    queries: [],
    errors: 0,
    dials: 0
  };

  componentWillMount() {
    API(this.handleEvent);
  }

  handleEvent = rawEvent => {
    this.setState(state => {
      const event = parseEvent(rawEvent);
      state.events.push(event);
      switch (event.type) {
        case "PeerResponse":
          state.peers.push(event);
          window.cy.add({
            data: {
              id: state.peers.length
            },
            locked: true,
            position: {
              x: event.extra,
              y: 0
            },
            group: "nodes"
          });
          window.cy.fit();
          break;
        case "QueryError":
          state.errors += 1;
          break;
        case "SendingQuery":
          state.queries.push(event);

          break;
        case "DialingPeer":
          state.dials += 1;
      }

      return state;
    });
  };

  render_event = (key, index) => {
    const e = this.state.events[index];
    return (
      <div className="Event" key={key}>
        <div>
          <em>ID</em>: {e.id}
        </div>
        <div>
          <em>Event</em>: {e.type}
        </div>
        <div>
          <em>Responses</em>:{" "}
          {e.responses &&
            e.responses.map((res, i) => {
              return (
                <span>
                  ID: {res.ID} Addresses: {res.Addrs.length},{" "}
                </span>
              );
            })}
        </div>
        <div>
          <em>Extra</em>: {e.extra}
        </div>
      </div>
    );
  };

  render() {
    const peers = this.state.peers || [];
    const length = this.state.peers.length;
    return (
      <div>
        <div className="List">
          <ReactList
            itemRenderer={this.render_event}
            length={this.state.events.length}
            type="uniform"
          />
        </div>
        <div>
          <h3>Peers {length}</h3>
          <div className="Peers">
            <ul>
              {peers.map((peer, i) => {
                let c = "distance";
                if (i > 0) {
                  const prev = peers[i - 1];
                  if (prev && prev.extra > peer.extra) {
                    c += " green";
                  } else {
                    c += " red";
                  }
                }

                return (
                  <li key={peer.id}>
                    {peer.id}: <div className={c}> {peer.extra}</div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        <div>
          Queries: {this.state.queries.length}
          <br />
          Dials: {this.state.dials}
          <br />
          Errors: {this.state.errors}
        </div>
      </div>
    );
  }
}

const App = () => (
  <div className="App">
    <h1 className="App-Title">DHT VIS</h1>
    <Log />
  </div>
);

ReactDOM.render(<App />, document.getElementById("root"));

// Hot Module Replacement
if (module.hot) {
  module.hot.accept();
}
