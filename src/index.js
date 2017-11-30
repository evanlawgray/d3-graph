import './sass/styles.scss';
import * as d3 from 'd3';

window.addEventListener('load', () => {
  // Avoid flicker of unstyled content on page load (occurrs in webpack dev configuration)
  document.body.classList.remove( 'loading' );

  // Mock data
  const data = [15, 33, 12, 49, 188, 99];
  const lineData = [[14, 46, 67, 50, 25, 48, 64],
                    [54, 46, 17, 22, 35, 32, 40],
                    [33, 22, 27, 28, 25, 30, 32]];
  const scatterPlotData = [{x: 88, y: 80},
                           {x: 42, y: 78},
                           {x: 97, y: 52},
                           {x: 49, y: 83},
                           {x: 82, y: 92},
                           {x: 129, y: 47},
                           {x: 145, y: 15},
                           {x: 87, y: 14},
                           {x: 167, y: 120},
                           {x: 190, y: 100},
                           {x: 174, y: 99},
                           {x: 158, y: 120},
                           {x: 199, y: 52}];
  const testData = [{x: 1, y: 2},
                    {x: 2, y: 3},
                    {x: 3, y: 6},
                    {x: 4, y: 8},
                    {x: 5, y: 10},
                    {x: 6, y: 12}];

  const colors = ['crimson', 'turquoise', 'purple'];

  const scale = 3.5;

  const canvasWidth = document.querySelector('.graph-box').offsetWidth;
  const canvasHeight = document.querySelector( '.graph-box' ).offsetHeight;

  const getXYAverages = ( dataArr ) => {
    let X, Y;
    X = Y = 0;

    dataArr.forEach( dataPoint => {
      X += dataPoint.x;
      Y += dataPoint.y;
    });

    return {X: Number( ( X / dataArr.length ).toFixed(3) ), Y: Number( ( Y / dataArr.length ).toFixed(3) )}
  }

  const getLineSlope = ( {X, Y}, dataArr ) => {
    const xDiffs = [];
    const yDiffs = [];

    dataArr.forEach( dataPoint => {
      const diffX = dataPoint.x - X;
      const diffY = dataPoint.y - Y;
      xDiffs.push( Number( diffX.toFixed(3) ) );
      yDiffs.push( Number( diffY.toFixed(3) ) );
    });

    const numerator = xDiffs.map(( diff, i ) => {
                        return Number( (diff * yDiffs[i]).toFixed(3) );
                      }).reduce(( acc, product ) => {
                        acc+= product;
                        return acc;
                      }, 0);

    const denominator = xDiffs.map( ( diff, i ) => {
                        return Number( ( diff * diff ).toFixed(3) );
                      }).reduce( ( acc, product ) => {
                        acc+= product;
                        return acc;
                      });

    return ( numerator / denominator ) || 0;
  }

  function getYIntercept({X, Y}, m) {
    return Y - ( m * X );
  }

  function getMinMaxValues( dataArr ) {
    let minX, minY, maxX, maxY;

    dataArr.forEach( dataPoint => {
      if( !minX || minX > dataPoint.x ) minX = dataPoint.x;
      if( !minY || minY > dataPoint.y ) minY = dataPoint.y;
      if( !maxX || maxX < dataPoint.x ) maxX = dataPoint.x;
      if( !maxY || maxY < dataPoint.y ) maxY = dataPoint.y;
    });
    return {x: {min: minX, max: maxX},
            y: {min: minY, max: maxY}}
  }

  function getLineStart( yIntercept, slope, {x, y} ) {
    let lineStart;

    for( let i = 0; !lineStart; i += 0.25 ) {
      const coordinate = {x: i, y: yIntercept + ( i * slope )};

      if( coordinate.x > x.min && coordinate.y > y.min ) lineStart = coordinate;
    }

    return lineStart;
  }

  function getLineEnd( yIntercept, slope, {x, y} ) {
    let lineEnd;

    for( let i = x.max + 1; !lineEnd; i -= 0.25 ) {
      const coordinate = {x: i, y: yIntercept + ( i * slope )};

      if( coordinate.x < x.max && coordinate.y < y.max ) lineEnd = coordinate;
    }

    return lineEnd;
  }

  function drawBarGraph( data ) {
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
  }

  function drawLineGraph( lineData ) {
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
  }

  function drawLineGraphPoints( lineData ) {
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
        .attr( 'r', 3 )
        .attr( 'fill', 'black' )
  }

  function drawScatterPlot( scatterPlotData ) {
    d3.select( '#scatter-plot-container' )
    .append( 'svg' )
      .attr( 'viewBox', `0 0 ${canvasWidth} ${canvasHeight}` )
      .attr( 'id', 'scatter-plot-canvas' )
    .selectAll( 'circle' )
    .data( scatterPlotData )
    .enter()
    .append( 'circle' )
      .attr( 'r', 4 )
      .attr( 'fill', 'black' )
      .attr( 'cx', d => d.x * scale )
      .attr( 'cy', d => canvasHeight - ( d.y * scale ) )
  }

  function drawTrendLine( scatterPlotData ) {
    const averages = getXYAverages( scatterPlotData );
    const lineSlope = getLineSlope( averages, scatterPlotData );
    const yIntercept = getYIntercept( averages, lineSlope );
    const minMaxValues = getMinMaxValues( scatterPlotData );
    const lineStart = getLineStart( yIntercept, lineSlope, minMaxValues );
    const lineEnd = getLineEnd( yIntercept, lineSlope, minMaxValues );

    d3.select( '#scatter-plot-canvas' )
      .append( 'path' )
        .attr( 'd', `M ${lineStart.x * scale} ${canvasHeight - ( lineStart.y * scale)} L ${lineEnd.x * scale} ${canvasHeight - ( lineEnd.y * scale)}` )
        .attr( 'stroke', 'red' )
        .attr( 'stroke-width', 4 )
  }

  drawBarGraph( data );
  drawLineGraph( lineData );
  drawLineGraphPoints( lineData );
  drawScatterPlot( scatterPlotData );
  drawTrendLine( scatterPlotData );
});
