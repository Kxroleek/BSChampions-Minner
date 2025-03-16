// ==UserScript==
// @name         ChampBot
// @namespace    https://github.com/Kxroleek
// @homepageURL  https://github.com/Kxroleek/ChampBot
// @supportURL   https://e-z.bio/kxroleek
// @license      MIT
// @version      0.2.2
// @description  Automation tool that helps earn points in the Brawl Stars Championship on the Supercell website by completing live event tasks
// @author       Kxroleek
// @match        https://event.supercell.com/brawlstars/*
// @icon         https://event.supercell.com/brawlstars/page-icon.ico
// @grant        none
// ==/UserScript==

function load(key, def) {
    let res = localStorage.getItem("ChampBot-" + key)

    if (res === null) {
        store(key, def)
        return def
    } else {
        return JSON.parse(res)
    }
}

function store(key, val) {
    localStorage.setItem("ChampBot-"+key, JSON.stringify(val))
}

// ==================== Begin ChampBot Configuration ====================
// This is the default configuration
// load(config_key, default_value)
// Do not change the config key unless you know what you are doing

// Auto send cheer, +5 points
let cheerEnabled = load("cheer", true);

// Auto send poll (choosing MVP), always choose the first option, +100 points
let pollEnabled = load("poll", true);

// Auto send quiz, always choose correct option
let quizEnabled = load("quiz", true);

// Auto send match prediction
let matchPredictionEnabled = load("matchPrediction", false);

// Team selection strategy
// Can be 1 (select first team), 2 (select second team), rand (select random), maj (follow majority)
// This setting will only be used if match prediction is enabled
let matchPredictionStrategy = load("predictionStrategy", "maj")

// Auto collect lootdrops (randomly appearing 10 point drops)
let dropEnabled = load("drop", true);

// Auto collect sliders
let sliderEnabled = load("slider", true);

// Log events (such as sending cheer) to the feed
let feedLoggingEnabled = load("feedLogging", true);

// Remove cheer graphics (improves performance? haven't tested but pretty sure it does)
let lowDetail = load("lowDetail", false);

// Debug logging of websocket messages to console
let debug = false;

// ===================== End ChampBot Configuration =====================

let feed;

function log(msg) {
  if (!feedLoggingEnabled) {
    return
  }
  if (!feed) {
    feed = document.getElementsByClassName("Feed__content")[0];
    if (!feed) {return}
  }
  
  feed.children[feed.children.length - 2].insertAdjacentHTML("afterend", `<div data-v-3dcc93da="" data-v-8a7cf7d7="" class="Container" style="translate: none; rotate: none; scale: none; transform: translate(0px);">
    <div data-v-de4b4abb="" data-v-3dcc93da="" class="BaseCard BaseCard--rmedium">
        <div data-v-3dcc93da="" class="ContentCard ContentCard--disabled ContentCard--inactive ContentCard--isFullWidth ContentCard--isCelebration">
            <div data-v-3dcc93da="" class="ContentCard__celebration">
                <div data-v-3dcc93da="" class="ContentCard__celebration__background"></div>
                <div data-v-3dcc93da="" class="ContentCard__celebration__bottomContainer"></div>
                <div data-v-8a7cf7d7="" class="RewardCard">
                    <div data-v-8a7cf7d7="" class="RewardCard__rewardContainer">
                        <div data-v-8a7cf7d7="" class="RewardCard__infoContainer">
                            <div data-v-8a7cf7d7="" class="RewardCard__textContainer">
                                <div data-v-8a7cf7d7="" class="RewardCard__textContainer__title">${msg}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>`)
};

function purge(elements) {
    for (let elem of elements) {
        try {
            elem.remove()
        } catch (e) {
            console.warn("[ChampBot] Failed to remove element", elem, e)
        }
    }
}

// The rest of the code is not recommended to modify unless you know what you are doing
(function() {
  "use strict";

  let loaded = false;
  let conn
  let matchpredblue
  let matchpredred
  let predictions

  let lastCheerId = "";
  let lastPollId = "";
  let lastQuizId = "";
  let lastDropId = "";
  let lastMatchPredictionId = "";
  let lastSliderId = "";

  const OriginalWebSocket = window.WebSocket;

  class PatchedWebSocket extends OriginalWebSocket {
    constructor(...args) {
      super(...args);

      const originalGet = Object.getOwnPropertyDescriptor(OriginalWebSocket.prototype, "onmessage").get;

      const originalSet = Object.getOwnPropertyDescriptor(OriginalWebSocket.prototype, "onmessage").set;

      Object.defineProperty(this, "onmessage", {
        configurable: true,
        enumerable: true,
        get() {
          return originalGet.call(this);
        },
        set(newOnMessage) {
          const onMessage = (event) => {
            parse(event.data, this);
            newOnMessage(event);
          };
          originalSet.call(this, onMessage);
        },
      });

      const originalSend = this.send;

      this.send = function(data) {
        if (debug) {
          const parsed = JSON.parse(data);

          console.log("[ChampBot] Sending message:", data, parsed);
        }
        originalSend.call(this, data);
      };
    }
  }

  window.WebSocket = PatchedWebSocket;

  function parse(data, ws) {
    const msg = JSON.parse(data)
    if (debug) {
      console.log("[ChampBot] Received message:", msg, data);
    }

    msg.forEach(event => {
      const messageType = event.messageType;
      if (messageType === "global_state" && !loaded) {
        setupAutoBsc();
      }

      if (messageType === "cheer") {
        if (conn) {
          conn.textContent = event.payload.connectedClients
        }

        if (lowDetail) {
            purge(document.getElementsByClassName("Cheer__gradient"))
            purge(document.getElementsByClassName("Cheer__canvas"))
        }

        if (cheerEnabled && event.payload.typeId !== lastCheerId) {
          log("Sending cheer");

          setTimeout(() => {
            for (let btn of document.getElementsByClassName("cheer-btn-container__cheer-btn")) {
              btn.click()
            }
          }, 500)
          lastCheerId = event.payload.typeId
        }
      }

      if (messageType === "poll" && pollEnabled) {
        if (event.payload.typeId !== lastPollId) {
          log("Sending poll");

          setTimeout(() => {
            try {
              for (let que of document.getElementsByClassName("MultiChoiceQuestionCard")) {
                que.getElementsByTagName("button")[0].click()
              }
            } catch (e) {
              console.error("[ChampBot]", e)
            }
          }, 3500);
          lastPollId = event.payload.typeId;
        }
      }

      if (messageType === "quiz" && quizEnabled) {
        if (event.payload.typeId !== lastQuizId) {
          log("Sending Quiz");

          setTimeout(() => {
            for (let que of document.getElementsByClassName("BaseCard")) {
              try {
                if (que.getElementsByClassName("Points__correctAnswer").length === 0) {
                  continue
                }

                que.getElementsByClassName("MultiChoiceQuestionCard__button")[event.payload.correctAnswer.alternative].click()
              } catch (e) {
                console.error("[ChampBot]", e)
              }
            }
          }, 3500);
          lastQuizId = event.payload.typeId;
        }
      }

      if (messageType === "match_prediction") {
        predictions = event.payload.answers
        if (matchpredblue) {
          matchpredblue.textContent = predictions["0"]
        }
        if (matchpredred) {
          matchpredred.textContent = predictions["1"]
        }
        if (matchPredictionEnabled && event.payload.typeId !== lastMatchPredictionId) {
          log("Sending match prediction");
          let team = 0
          setTimeout(() => {
            switch (matchPredictionStrategy) {
              case "2":
                team = 1
                break
              case "rand":
                team = Math.floor(Math.random() * 2)
                break
              case "maj":
                if (predictions["0"] > predictions["1"]) {
                  team = 0
                } else {
                  team = 1
                }
                break
              default:
                break
            }
            log(`Placing prediction for ${team === 0 ? "blue" : "red"}`)
            for (let a of document.getElementsByClassName("MatchPredictionQuestionCard__buttonGroup")) {
              try {
                a.getElementsByTagName("button")[team].click()
              } catch (e) {
                console.error("[ChampBot]", e)
              }
            }
          }, 10000);

          lastMatchPredictionId = event.payload.typeId
        }
      }

      if (messageType === "loot_drop" && dropEnabled) {
        if (event.payload.typeId !== lastDropId) {
          log("Collecting Loot Drop")

          setTimeout(() => {
            for (let drop of document.getElementsByClassName("LootDropCard")) {
              try {
                drop.getElementsByClassName("RectangleButton")[0].click()
              } catch (e) {
                console.error("[ChampBot]", e)
              }
            }
            lastDropId = event.payload.typeId
          }, 2000)
        }
      }

      if (messageType === "slider" && sliderEnabled) {
        if (event.payload.typeId !== lastSliderId) {
          log("Collecting Slider")

          setTimeout(() => {
            for (let drop of document.getElementsByClassName("SliderQuestionCard")) {
              try {
                let elem = drop.getElementsByTagName("input")[0]
                elem.value = "100"
                elem.dispatchEvent(new InputEvent("input"))
                elem.dispatchEvent(new Event("change"))
              } catch (e) {
                console.error("[ChampBot]", e)
              }
            }
            lastSliderId = event.payload.typeId
          }, 2000)
        }
      }
    })
  }

  function setupAutoBsc() {
    loaded = true;

    console.log("[ChampBot] ChampBot Loaded");

    const interval = setInterval(() => {
      const div = document.getElementsByClassName("Feed__content")[0];
      if (div) {
        div.insertAdjacentHTML("afterbegin", loadedMessageHtml);
        clearInterval(interval);
      }
    }, 500);

    const reconnectButtonContainer = document.querySelector("#__layout > div > div:nth-child(5)");
    const reconnectButton = document.querySelector(
      "#__layout > div > div:nth-child(5) > div > div > div > div.baseModal__scroll > div > div > button > div.RectangleButton.RectangleButton--cta > div > div"
    );

    setInterval(() => {
      if (reconnectButtonContainer.style.display !== "none") {
        console.log("[ChampBot] Reconnecting");
        reconnectButton.click();
      }
    }, 1000);

    document.body.insertAdjacentHTML("afterbegin", `
<style>
#ChampBot-overlay {
    position: absolute;
    top: 20%;
    z-index: 99999999;
    background: #000000;
    color: #ffffff;
    border: 3px solid #ffd700;
    border-radius: 15px;
    font-family: 'Orbitron', sans-serif;
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
    padding: 1rem;
    transition: all 0.3s ease-in-out;
    display: none;
}

#ChampBot-overlay[open] {
    display: block;
}

#ChampBot-toggle {
    position: fixed;
    top: 10px;
    left: 10px;
    background: #ffd700;
    color: black;
    font-weight: bold;
    border: none;
    padding: 1rem 2rem;
    border-radius: 10px;
    cursor: pointer;
    transition: 0.2s;
    font-size: 1.5rem;
}

#ChampBot-toggle:hover {
    background: #caa000;
}

#ChampBot-close {
    position: absolute;
    top: 10px;
    right: 10px;
    background: red;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
}

#ChampBot-close:hover {
    background: darkred;
}

.ChampBot-config-container {
    width: 20rem;
    padding: 0.5rem;
    background: rgba(255, 215, 0, 0.1);
    border: 2px solid #ffd700;
    border-radius: 8px;
    margin-bottom: 0.5rem;
}

.ChampBot-config-container > input[type=checkbox] {
    float: right;
}

button {
    background: #ffd700;
    color: black;
    font-weight: bold;
    border: none;
    padding: 0.7rem 1.2rem;
    border-radius: 8px;
    cursor: pointer;
    transition: 0.2s;
}

button:hover {
    background: #caa000;
}
</style>

<button id="ChampBot-toggle" onclick="document.getElementById('ChampBot-overlay').style.display='block'">ChampBot</button>

<div id="ChampBot-overlay">
  <button id="ChampBot-close" onclick="document.getElementById('ChampBot-overlay').style.display='none'">X</button>
  <div style="display: flex; flex-direction: column; align-items: center;">
    <div style="text-align: center; margin-bottom: .5rem">
      <h2>🔗 Status</h2>
      Connected: <span id="ChampBot-connected" style="color: #ffd700;">unknown</span>
    </div>

    <div style="text-align: center; margin-bottom: .5rem;">
      <h3>🔮 Predictions</h3>
      Blue: <span id="ChampBot-pick-blue" style="color: blue;">unknown</span><br>
      Red: <span id="ChampBot-pick-red" style="color: red;">unknown</span>
    </div>

    <h2>⚙️ Config</h2>
    <div class="ChampBot-config-container">Autocheer <input type="checkbox" id="ChampBot-cheer"></div>
    <div class="ChampBot-config-container">Answer polls <input type="checkbox" id="ChampBot-poll"></div>
    <div class="ChampBot-config-container">Answer quiz <input type="checkbox" id="ChampBot-quiz"></div>
    <div class="ChampBot-config-container">Answer slider <input type="checkbox" id="ChampBot-slider"></div>
    <div class="ChampBot-config-container">Collect lootdrop <input type="checkbox" id="ChampBot-lootdrop"></div>
    <div class="ChampBot-config-container">Autopredict <input type="checkbox" id="ChampBot-predict"></div>
    <div class="ChampBot-config-container">Autopredict strategy 
      <select id="ChampBot-predict-strat">
        <option value="1">Blue</option>
        <option value="2">Red</option>
        <option value="rand">Random</option>
        <option value="maj">Follow majority</option>
      </select>
    </div>
    <div class="ChampBot-config-container">Feed logging <input type="checkbox" id="ChampBot-feedlogging"></div>
    <div class="ChampBot-config-container">Low Detail Mode <input type="checkbox" id="ChampBot-lowdetail"></div>

    <button onclick="if (confirm('Are you sure? Reload page to restore overlay.')) document.getElementById('ChampBot-overlay').remove()">Destroy overlay</button>
  </div>
</div>
    `)
    dragElement(document.getElementById("ChampBot-overlay"))

    const elems = {
      cheer: document.getElementById("ChampBot-cheer"),
      poll: document.getElementById("ChampBot-poll"),
      quiz: document.getElementById("ChampBot-quiz"),
      slider: document.getElementById("ChampBot-slider"),
      lootdrop: document.getElementById("ChampBot-lootdrop"),
      predict: document.getElementById("ChampBot-predict"),
      predictstrat: document.getElementById("ChampBot-predict-strat"),
      feedlogging: document.getElementById("ChampBot-feedlogging"),
      lowdetail: document.getElementById("ChampBot-lowdetail")
    }

    elems.cheer.checked = cheerEnabled
    elems.poll.checked = pollEnabled
    elems.quiz.checked = quizEnabled
    elems.slider.checked = sliderEnabled
    elems.predict.checked = matchPredictionEnabled
    elems.lootdrop.checked = dropEnabled
    elems.feedlogging.checked = feedLoggingEnabled

    elems.predictstrat.value = matchPredictionStrategy
    elems.lowdetail.checked = lowDetail

    elems.cheer.onchange = function(e) {
      cheerEnabled = e.target.checked
      store("cheer", cheerEnabled)
    }
    elems.poll.onchange = function(e) {
      pollEnabled = e.target.checked
      store("poll", pollEnabled)
    }
    elems.quiz.onchange = function(e) {
      quizEnabled = e.target.checked
      store("quiz", quizEnabled)
    }

    elems.slider.onchange = function(e) {
      sliderEnabled = e.target.checked
      store("slider", sliderEnabled)
    }
    elems.predict.onchange = function(e) {
      matchPredictionEnabled = e.target.checked
      store("matchPrediction", matchPredictionEnabled)
    }
    elems.lootdrop.onchange = function(e) {
      dropEnabled = e.target.checked
      store("drop", dropEnabled)
    }
    elems.feedlogging.onchange = function(e) {
      feedLoggingEnabled = e.target.checked
      store("feedLogging", feedLoggingEnabled)
    }

    elems.predictstrat.onchange = function(e) {
      matchPredictionStrategy = e.target.value
      store("predictionStrategy", matchPredictionStrategy)
    }

    elems.lowdetail.onchange = function(e) {
        lowDetail = e.target.checked
        store("lowDetail", lowDetail)
        if (!lowDetail) {
            return
        }
        purge(document.getElementsByClassName("Cheer__gradient"))
        purge(document.getElementsByClassName("Cheer__canvas"))
    }

    conn = document.getElementById("ChampBot-connected")
    matchpredblue = document.getElementById("ChampBot-pick-blue")
    matchpredred = document.getElementById("ChampBot-pick-red")
  }

  const loadedMessageHtml = `<div data-v-3dcc93da="" data-v-8a7cf7d7="" class="Container Container--extraTopMargin" style="translate: none; rotate: none; scale: none; transform: translate(0px);">
    <div data-v-de4b4abb="" data-v-3dcc93da="" class="BaseCard BaseCard--rmedium">
        <div data-v-3dcc93da="" class="ContentCard ContentCard--disabled ContentCard--inactive ContentCard--isFullWidth ContentCard--isCelebration">
            <div data-v-3dcc93da="" class="ContentCard__celebration">
                <div data-v-3dcc93da="" class="ContentCard__celebration__background"></div>
                <div data-v-3dcc93da="" class="ContentCard__celebration__bottomContainer"></div>
                <div data-v-8a7cf7d7="" class="RewardCard">
                    <div data-v-8a7cf7d7="" class="RewardCard__rewardContainer">
                        <div data-v-8a7cf7d7="" class="RewardCard__reward">
                            <picture data-v-afed0133="" data-v-8a7cf7d7="" class="cms-image cms-image--fullWidth cms-image--loaded cms-image--fullWidth"><img data-v-afed0133="" src="https://event.supercell.com/brawlstars/assets/rewards/images/emoji_starr.svg" class="cms-image cms-image--fullWidth cms-image--loaded cms-image--fullWidth"></picture>
                        </div>
                        <div data-v-8a7cf7d7="" class="RewardCard__infoContainer">
                            <div data-v-8a7cf7d7="" class="RewardCard__textContainer">
                                <div data-v-8a7cf7d7="" class="RewardCard__textContainer__title">ChampBot Loaded</div>
                                <div data-v-8a7cf7d7="" class="RewardCard__textContainer__subTitle">By Kxroleek</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>`;
})();

function dragElement(elmnt) {
  var pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;

  let dragger = document.getElementById(elmnt.id + "header") ?? elmnt
  dragger.onmousedown = dragMouseDown

  function dragMouseDown(e) {
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    dragger.setAttribute("drag", "")
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    setTimeout(() => dragger.removeAttribute("drag"), 100)
    document.onmouseup = null
    document.onmousemove = null
  }
}
