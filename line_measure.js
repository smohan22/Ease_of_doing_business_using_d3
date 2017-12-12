
function LineMeasure(){

  var chart = this;
  //Defining the SVG  space
  chart.margin = {top: 20, right: 20, bottom: 20, left: 20};
  chart.fullWidth = 160;
  chart.fullHeight = 95;
  chart.width = chart.fullWidth - chart.margin.right - chart.margin.left;
  chart.height = chart.fullHeight -chart. margin.top - chart.margin.bottom;
  //Defining the Scales
  chart.xAxis = d3.scaleLinear().range([15, chart.width]),
  chart.yAxis = d3.scaleLinear().range([chart.height, 20]);

  chart.xAxis.domain([2004,2017]);
  chart.yAxis.domain([0,1]);

  chart.line =  d3.line()
                  .defined(function(d) {return d.y != 0; }) //added to get rid of missing values appearing as 0
                  .x(function(d) {return chart.xAxis(d.x); })
                  .y(function(d) {return chart.yAxis(d.y); });

  chart.data,
  chart.currData = [],
  chart.currCountry = 'India',
  chart.countryData = [];

  //getting the dataset
  d3.text("data/line_doingbiz.csv", function(error, text){
    if (error) {throw error;}
    // Parse and store
    chart.data = d3.csv.parseRows(text);

    for (i = 1; i<chart.data.length; i++) 
    {
      if (chart.currCountry != chart.data[i][0]) {
        chart.countryData.push(chart.currData);
        chart.currData = [];}

      chart.currCountry = chart.data[i][0];

      chart.years = chart.data[i].slice(2,16);
      chart.adata = chart.years.map(function(y, k) {
        return { x: +chart.data[0][k+2], y: +y };
      });

      for (j=0; j < chart.adata.length; j++) {
        chart.adata[j].y = parseFloat(chart.adata[j].y) / 100; }

      chart.currData.push(chart.adata);

      if (chart.currCountry == 'India')
      {
        var vis = d3.select("#vis")
                    .append("div")
                    .attr("class", function() {
                      if (i == 1 || i == 5 || i == 9) return "chart noborder";
                        else if (i == 4 || i == 8 || i == 10) return "chart endrow";
                        else return "chart";
                    })
                    .append('svg')
                    .attr('width', chart.fullWidth)
                    .attr('height', chart.fullHeight)
                    .append("g")
                    .attr("transform", "translate(" + chart.margin.left + "," + chart.margin.top + ")");

        var rules = vis.selectAll("g.rule")
                       .data(chart.xAxis.ticks(2))
                       .enter().append("svg:g")
                       .attr("class", "rule");

        //x-axis labels
        rules.append("svg:text")
          .attr("class", "ticklabel")
          .attr("y", chart.height)
          .attr("x", chart.xAxis)
          .attr("dx", 8)
          .attr("dy", 11)
          .attr("text-anchor", "middle")
          .text(function(d) { return d; });

        rules.append("svg:line")
          .attr("x1", chart.xAxis)
          .attr("x2", chart.xAxis)
          .attr("y1", 20)
          .attr("y2", chart.height-1);

        rules.append("svg:line")
          .attr("class", "axis")
          .attr("y1", chart.height)
          .attr("y2", chart.height)
          .attr("x1", -20)
          .attr("x2", chart.width+1);

        // Header for measure
        vis.append("svg:text")
          .attr("x", -18)
          .text(chart.data[i][1])
          .attr("class", "aheader");

        // y-axis labels -bottom
        vis.append("svg:text")
          .attr("x", -12)
          .attr("y", chart.height-4)
          .text("0")
          .attr("text-anchor", "right")
          .attr("class", "ticklabel");

        // y-axis labels - top
        vis.append("svg:text")
          .attr("x", -18)
          .attr("y", 20)
          .text("100")
          .attr("text-anchor", "right")
          .attr("class", "ticklabel");

        vis.append("svg:path")
          .datum(chart.adata)
            .attr("class", 'line lineMeasurePath')
            .attr("d", chart.line);

      } // @end if India

    } // @end for loop

    chart.countryData.push(chart.currData);

  }); // @end text

}; // @end function LineMeasure

LineMeasure.prototype.transition = function (index) {
  var chart = this;
  dataselect = chart.countryData[index];
  d3.selectAll(".lineMeasurePath").each(function(d, i) {
    d3.select(this)
      .data([dataselect[i]])
      .transition()
      .duration(500)
      .attr("d", chart.line);
  });
} //  @end function transition


linemeasure = new LineMeasure();
linemeasure.transition();


var explain = {
  "India": "India's performance has been steadily increaing, especially when it comes to investors. However, she is still lagging behind in enforcing contracts and resolving insolvency. There has been a steady improvement in Starting a Business.",
  "South Africa": "South Africa has seen remarkable improvment in Getting Credit Score. However, there is a decline in protecting investors measure.",
  "Rwanda": "Amongst the Sub Saharn countries, Rwanda's performance is the best. Her score is similar to that of most of the developed economies across various parameters. However, her performance has plateued too.",
  "United States" : "Unsurprisingly, USA's scores are pretty high up and platueed. She represents perfectly how the high income countries have maintained their scores."
};

$("#filters a").click(function() {
  $("#filters a").removeClass("current");
  $(this).addClass("current");
  var country = $(this).text();
  var countryid = $(this).attr("id");

  $("#explain h3").text(country);
  $("#explain p").html(explain[countryid]);

});