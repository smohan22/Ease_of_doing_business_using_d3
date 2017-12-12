
ScatterLine();

function ScatterLine(){
  //Defining the SVG  space
  var margin = {top: 20, right: 20, bottom: 30, left: 20};
  var fullWidth = 1200;
  var fullHeight = 500;
  var width = fullWidth - margin.right - margin.left;
  var height = fullHeight - margin.top - margin.bottom;
  //defining the scales range
  colors = ['#1b85b8', '#c3cb71', "#34495e",'#ae5a41', '#5a5255'];
  
  var x = d3.scaleLinear().range([50, width-100]).nice();
  var y = d3.scaleLinear().range([height, 0]).nice();
  var z = d3.scaleOrdinal().range(colors);
  // draw the x axis
  var xAxis = d3.axisBottom(x);
  // draw the y axis
  var yAxis = d3.axisLeft(y);
  //defining svg space
  var svg = d3.select('#scatterchart')
                     .append('svg')
                     .attr('width', fullWidth)
                     .attr('height', fullHeight);

  // Adding intro text to the graph
  svg.append("text")
     .attr("x", 150)
     .attr("y", 15)
     .attr("class", "scatterLineLabel")
     .text("Each Line below shows a country and how the country fairs in terms of doing business. The measure of score is distance to the frontier, ie how does the ");

  svg.append("text")
     .attr("x", 150)
     .attr("y", 30)
     .attr("class", "scatterLineLabel")
     .text('country perform in terms of the best country. The measure is from 2004 to 2017. The colors of the countries depict the type of income group, with blue - ');

  svg.append("text")
     .attr("x", 150)
     .attr("y", 45)
     .attr("class", "scatterLineLabel")
     .text('high income country, green - upper middle income,  black - lower middle income and red and low income country. Moving across the page towards right ');

svg.append("text")
     .attr("x", 150)
     .attr("y", 60)
     .attr("class", "scatterLineLabel")
     .text('depicts countries with high Atkinson Inequality Index as of 2015. High income are least unequal.');


  //defining a g subspace where the graph is actually drawn 
  var g = svg.append("g")
       .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
       .attr('width', width)
       .attr('height', height);

  g.append("text")
        .attr("x", 100)
        .attr("y", height - (margin.bottom / 2))
        .attr("class", "introText")
            //.style("text-decoration", "underline")
        .text(" <-----------------------Decreasing Inequality-------------------------------------------------------------------------------------------------------------------------------------------");

  g.append("text")
        .attr("x", width-300)
        .attr("y", height - (margin.bottom / 2))
        .attr("text-anchor", "left")
        .attr("class", "introText")
        .style("font", "Montserrati")
        .text("Increasing Inequality----------------------->");


  ScatterPlot();
  LineChart();

  function ScatterPlot() {
    //getting the ineqality dataset
    d3.json("data/Income_ineqality_UN.json", function(error, data){
    if (error) {throw error;}
    else {
      data.forEach(function(d){d.Country = d.Country.replace(" ", "_")});
    }
    
    //defining the scales domain
    x.domain(d3.extent(data, function(d){return d.Atkinson_inequality_index_2015;}));
    y.domain([0, 100]);
    stats = {"Economy": "Economy: ", "incomegroup": "Income Group: ", "Year": "Year: ", "region": "Region: ", "Overall_DTF": "Overall Score: "};


    var scatterchart = g.append('g')
                      .attr("id", "gLines")
                      .selectAll('g')
                      .data(data)
                      .enter()
                      .append('g')
                      .attr('id', function(d, i) {return d.Country ;})
                      .attr("transform", function(d){
                        return "translate(" + x(d.Atkinson_inequality_index_2015) + ", 50)"
                      });
    });
  };

  function LineChart() {
    //getting the dataset
    d3.json("data/doingbusiness.json", function(error, data){
      if (error) {throw error;}

      var line = d3.line()
                 .x(function(d) { return x(d.Year); })
                 .y(function(d) { return y(d.Overall_DTF); });

      var x = d3.scaleLinear().range([0, 100]).nice();
      x.domain([2010, 2017]);
      y.domain([0, 100]);
      z.domain(["High income", "Upper middle income", "Lower middle income", "Low income"]);
    
      //Looping Over each country to append line chart to its g
      for (i = 0; i<data.length; i++){
      
        hash = "#";
        g_id =  hash.concat(data[i].country.replace(" ", "_"));
        current_data = data[i].values;

        //Creating linechar at g_id location
        var score = g.select('#gLines').select(g_id)
                     .append("path")
                     .datum(current_data)
                     .attr("class", "line")
                     .attr("d", line)
                     .style("stroke", function(d) { return z(d[0].incomegroup); });

        //Creating mouseover for each line
        var tooltip = g.select('#gLines').select(g_id)
                        .append("path")
                        .datum(current_data)
                        .attr("class", "tooltipLine")
                        .attr("d", line)
                        .style("stroke", "transparent")
                        .on("mousemove", mousemove);

        //tooltip off
        tooltip.on('mouseout', function() {
          d3.selectAll('.tooltipText')
            .transition()
            .duration(500)
            .attr('opacity', 0)
            .remove();
         });
         tooltip.on('mouseover', function() {
          d3.selectAll('.tooltipText')
            .transition()
            .duration(500)
            .attr('opacity', 0)
            .remove();
         });
        //tooltip for having details of countries
        function mousemove(){
          coordinates = d3.mouse(this);
          var xCoord = coordinates[0];
          var yCoord = coordinates[0];
          plot = d3.select(this);
          var current_data = plot._groups[0][0].__data__[0];
            var tooltip_str = "Economy: " + current_data.Economy +
                   "; Income Group: " + current_data.incomegroup +
                   "; Overall_Score_2017: " + current_data.Overall_DTF;
 
           g.select('#gLines').select(g_id)
            .append("text")
            .attr("class", "tooltipText")
            .attr('x', 0)
            .attr('y', 50)
            .text(tooltip_str)

          };// @end mousemove function

      }; //@ end countries loop
    }); // @end opencsv for linechart
  };  // @end linechart function
}; // @end scatterline