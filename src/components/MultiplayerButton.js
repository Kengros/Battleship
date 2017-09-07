import React from 'react';
//import $ from 'jquery';
//import jQuery from 'jquery';

var createReactClass = require('create-react-class');

var MultiplayerButton = createReactClass({
  button:
    function() {
    var d = document.getElementById("multiplay");
    d.classList.add("error");
    //$(".board2").removeClass("hide");
    },
    render: function() {
    return (
        <div>
        <button className='buttons multi' id='multiplay' onClick={this.button}>Multiplayer</button>
        </div>
    );
    }
    });

export default  MultiplayerButton;
