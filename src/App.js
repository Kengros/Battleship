import React, { Component } from 'react';
import banner from './img/banner.jpg';
import carrier from './img/carrier.png';
import battleship from './img/battleship.png';
import cruiser from './img/cruiser.png';
import destroyer from './img/destroyer.png';
import frigate from './img/frigate.png';
import SinglePlayerButton from './components/SinglePlayerButton.js';
import MultiplayerButton from './components/MultiplayerButton.js';
import P2ShipsButton from './components/P2ShipsButton.js';
import ReadyButtonP1 from './components/ReadyButtonP1.js';
import ReadyButtonP2 from './components/ReadyButtonP2.js';
import './App.css';


class App extends Component {
  render() {
    return (
        <div className="Battleship-App">
        <div id="main">
    <div id="banner">
            <img className="banner" alt="" src={banner}></img>
    <div className="sidebar">
    <div className="board">
        <div className="displays">
        <div className="top">
            <ul className="grid">
            <ReadyButtonP1 />
            <ReadyButtonP2 />
            </ul>
        </div>
        <div className="bottom">
            <ul className="grid"></ul>
        </div>
        </div>
    </div>
    <div className="board2">
        <div className="displays2">
        <div className="top2">
            <ul className="grid2"></ul>
        </div>
        <div className="bottom2">
            <ul className="grid2"></ul>
        </div>
        </div>
    </div>
    <div className="board3">
        <div className="displays3">
        <div className="top3">
            <ul className="grid3"></ul>
        </div>
        <div className="bottom3">
            <ul className="grid3"></ul>
        </div>
        </div>
    </div>
<div className="panel">
        <div className="topPanel">
        <div className="layout">
            <div className='menuTitle'>MENU</div>
            <div className='menutext'></div>
            <SinglePlayerButton />
            <MultiplayerButton />
            <P2ShipsButton />
        </div>
        </div>
        <div className="shipPanel">
                <div className='shipTitleTop'>Carrier - 5 Hits
                <img className="carrierIcon" alt="" src={carrier}></img>
                </div>
                <div className='shipTitle'>Battleship - 4 Hits                  
                <img className="battleshipIcon" alt="" src={battleship}></img>
                </div>
                <div className='shipTitle'>Cruiser - 3 Hits
                <img className="cruiserIcon" alt="" src={cruiser}></img>
                </div>
                <div className='shipTitle'>Destroyer - 3 Hits
                <img className="destroyerIcon" alt="" src={destroyer}></img>
                </div>
                <div className='shipTitleBottom'>Frigate - 2 Hits
                <img className="frigateIcon" alt="" src={frigate}></img>
                </div>
        </div>    
        <div className='console'>
        <span className='text'></span></div>
    </div>
    </div>
    </div>
</div>


          
        </div>
    );
  }
}

export default App;
