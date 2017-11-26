require('./sass/styles.scss');
const d3 = require('d3');

window.addEventListener('load', () => {
  // Avoid flicker of unstyled content on page load
  document.body.classList.remove( 'loading' );

  const canvasWidth = document.getElementById('bar-graph').offsetWidth;
  let barWidth;

  const data = [15, 33, 12, 49, 188, 99];

  const tooltips = d3.selectAll( '.tooltips' )

  d3.select( '#bar-graph' )
    .selectAll( 'div' )
    .data( data )
    .enter()
    .append( 'div' )
      .attr( 'class', 'bar' )
      .style( 'height', (d) => d * 2 + "px" )
      .style( 'width', () => {
        barWidth = Math.min( ( canvasWidth / data.length ) - 60, 100 );
        return barWidth + "px";
      })
    .append( 'p' )
      .attr( 'class', 'tooltip' )
      .text( (d) => `${d}` )
      .style( 'left', () => {
        return ( barWidth - 50 ) / 2 + "px";
      })
});
