import React from 'react';
import $ from 'jquery';

var createReactClass = require('create-react-class');

var ReadyButtonP1 = createReactClass({
  button:
    function() {
    var d = document.getElementById("rbp1");
    d.classList.add("hide");
    $(".board2").removeClass("hide"); 
    $(".board3").addClass("hide");     
    },
  render: function() {
    return (
      <div>
        <button className='buttons three hide' id='rbp1' onClick={this.button}>Player 1 Ready?</button>
        </div>
    );
  }
});
    
export default  ReadyButtonP1
