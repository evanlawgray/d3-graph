require('./sass/styles.scss');
const d3 = require('d3');



const data = [15, 33, 12, 49, 188, 99];


d3.select( '#bar-graph' )
  .selectAll( 'div' )
  .data( data )
  .enter()
  .append( 'div' )
    .attr( 'class', 'bar' )
    .style('height', (d, i) => d * 2 + "px"  )
  .append( 'p' )
    .attr( 'class', 'tooltip' )
    .text( (d) => `${d}` );
