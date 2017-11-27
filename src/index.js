import './sass/styles.scss';
import * as d3 from 'd3';

window.addEventListener('load', () => {
  // Avoid flicker of unstyled content on page load
  document.body.classList.remove( 'loading' );

  // Mock data
  const data = [15, 33, 12, 49, 188, 99];
  const lineData = [[14, 46, 67, 50, 25, 48, 64],
                    [54, 46, 17, 22, 35, 32, 40],
                    [33, 22, 27, 28, 25, 30, 32]];
  const colors = ['crimson', 'turquoise', 'purple']

  const canvasWidth = document.querySelector('.graph-box').offsetWidth;
  const canvasHeight = document.querySelector( '.graph-box' ).offsetHeight;

  const lineGraphContainer = document.getElementById( 'line-graph-container' );
  lineGraphContainer.setAttributeNS('svg', 'viewBox', `0 0 ${canvasWidth} ${canvasHeight}`);

  // Dynamically generate and style bars for bar graph based on mock data array
  let barWidth;

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
      });

  const scale = 3.5;

  d3.select( '#line-graph-container' )
    .append( 'svg' )
      .attr( 'viewBox', `0 0 ${canvasWidth} ${canvasHeight}` )
      .attr( 'id', 'line-graph-canvas' )
    .selectAll( 'path' )
    .data( lineData )
    .enter()
    .append( 'path' )
      .attr( 'd', (d) => {
        let SVGPath = `M 0 ${canvasHeight - (d[0] * scale)} `;

        d.forEach( ( datum, i ) => {
          if( i ) {
            SVGPath += `L ${(( canvasWidth / ( d.length - 1 ) ) * i )} ${canvasHeight - (datum * scale)} `;
          }
        });
        return SVGPath;
      })
      .attr( 'fill-opacity', '0' )
      .attr( 'stroke-width', '3' )
      .attr( 'stroke', d => {
        return colors.pop();
      });

  let pointsArrayLength;

  d3.select( '#line-graph-canvas' )
    .selectAll( 'g' )
    .data( lineData )
    .enter()
    .selectAll( 'circle' )
    .data( d => {
      pointsArrayLength = d.length;
      const processedData = [];

      for( let dataPoint of d.entries() ) {
        processedData.push( dataPoint );
      }
      return processedData;
    })
    .enter()
    .append( 'circle' )
      .attr( 'cx', d => ( canvasWidth / ( pointsArrayLength - 1 ) ) * ( d[0] ) )
      .attr( 'cy', d => canvasHeight - ( d[1] * scale ) )
      .attr( 'r', 5 )
      .attr( 'fill', 'black' )
    .append( 'p' )
      .attr( 'class', 'tooltip' )
      .text( (d) => `${d[1]}` )
      .style( 'left', () => {
        return ( barWidth - 50 ) / 2 + "px";
      })
});
