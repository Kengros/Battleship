import React from 'react';
var createReactClass = require('create-react-class');

var SinglePlayerButton = createReactClass({
  button:
    function() {
    var d = document.getElementById("play");
    d.classList.add("player");
    },
  render: function() {
    return (
      <div>
        <button className='buttons one' id='play' onClick={this.button}>Single Player</button>
        </div>
    );
  }
});
    
export default  SinglePlayerButton
