import React from 'react';
import $ from 'jquery';

var createReactClass = require('create-react-class');

var ReadyButtonP2 = createReactClass({
  button:
    function() {
    var d = document.getElementById("rbp2");
    d.classList.add("hide");
    $(".board3").removeClass("hide"); 
    $(".board2").addClass("hide");     
    },
  render: function() {
    return (
      <div>
        <button className='buttons four hide' id='rbp2' onClick={this.button}>Player 2 Ready?</button>
        </div>
    );
  }
});
    
export default  ReadyButtonP2
