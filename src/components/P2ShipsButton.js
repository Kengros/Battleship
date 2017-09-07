import React from 'react';
import $ from 'jquery';

var createReactClass = require('create-react-class');

var P2ShipsButton = createReactClass({
  button:
    function() {
    var d = document.getElementById("placeShipsP2");
    d.classList.add("hide");
    $(".board3").removeClass("hide"); 
    $(".board2").addClass("hide");  
    },
  render: function() {
    return (
      <div>
        <button className='buttons five hide' id='placeShipsP2' onClick={this.button}>Player 2 Place Ships</button>
        </div>
    );
  }
});
    
export default  P2ShipsButton
