    // original code http://bl.ocks.org/palewire/d2906de347a160f38bc0b7ca57721328    
    // https://www.d3-graph-gallery.com/graph/choropleth_hover_effect.html
    
     // Define body
    var body = d3.select("body");

    // The svg
    var svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

    // Define the div for the tooltip
    // var tooltip = d3.select("div.tooltip")
    var tooltip = d3.select("body").append("div")   
    // var tooltip = body.append("div") // var tooltip = svg.append("tooltip")?
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Map and projection
    //Converting from geographic coordinates (longitude,latitude) to pixel coordinates is accomplished via a map projection. 
    // var path = d3.geoPath();
    var projection = d3.geoNaturalEarth()
        .scale(width / 2 / Math.PI) // scale things down so see world map
        .translate([width / 2, height / 2]) // translate to center of screen
    var path = d3.geoPath() //path generator that will convert GeoJSON to SVG paths
        .projection(projection); // tell path generator to use NaturalEarth projection
        
    // Data and color scale
    var data = d3.map(); // CO emission Dataset
        //console.log(data)
    var colorScheme = d3.schemePuOr[11]; // modified from tutorial
    var colorScale = d3.scaleThreshold()// modified from tutorial
        .domain([-1000000, -100000, -10000, 10000, 100000, 1000000, 10000000, 100000000, 200000000, 500000000, 1000000000]) //  modify from original
        .range(colorScheme);
    
    // Legend
    var g = svg.append("g")
        .attr("class", "legendThreshold")
        // .attr("transform", "translate(20,20)");
        .attr("transform", "translate(50,80)"); //will move it to a different position relative to the other objects
    g.append("text")
        .attr("class", "caption")
        .attr("x", 0)
        .attr("y", -10)
        .text("CO-2 levels");
    // var labels = ['> 1000 000 000', '500 000 000', '200 000 000', '100 000 000', '10 000 000', '1000 000', '100 000', '10 000','-10 000', '-100 000','-1000 000']; // plus to minues
    var labels = ['-1000 000', '-100 000','-10 000', '10 000', '100 000', '1000 000', '10 000 000', '100 000 000', '200 000 000', '500 000 000', '> 1000 000 000']; // minus to plus
    var legend = d3.legendColor()
        .labels(function (d) { return labels[d.i]; })
        .shapePadding(4)
        .scale(colorScale);
    svg.select(".legendThreshold")
        .call(legend);

    // Load external data and boot, asynchronous tasks
    d3.queue()
        .defer(d3.json, "data/world_countries.json")
        // .defer(d3.csv, "data/global-carbon-dioxide-emissions-by-sector_CLEAN.csv", function(d) {data.set( d.Code, +d.total_CO);})
        .defer(d3.csv, "data/global-carbon-dioxide-emissions-by-sector_CLEAN.csv", function(d) {if(d.Year == 2010) 
        {return (data.set(d.Code, +d.total_CO));}}) // process
        .await(ready);

    function ready(error, topo, CO_data) {
        if (error) throw error;
        // console.log(topo);
        // console.log(CO_data);

        let mouseOver = function(d) {
            d3.selectAll(".Country")
                .transition()
                .duration(200)
                .style("opacity", .5)
            d3.select(this)
                .transition()
                .duration(200)
                .style("opacity", 1)
                .style("stroke", "black")
        }

        let mousemove = function(d) {
            d3.selectAll(".Country")
                tooltip.style("opacity", 1)
                    .html( d.properties.name + "<br>" + d.total_CO )       //numberFormat(d.total_CO)       
                    // .style("left", (d3.mouse(this)[0]+70) + "px")
                    // .style("top", (d3.mouse(this)[1]) + "px")
                    .style("left", (d3.event.pageX) + "px")     //tooltip location https://jkeohan.wordpress.com/2015/03/09/using-d3-tooltips/
                    .style("top", (d3.event.pageY - 10) + "px");    
        }

        // .on("mouseover", function(d) {      
        // tooltip.transition().duration(200).style("opacity", .9);      
        // tooltip.html(d)  
        // .style("left", (d3.event.pageX) + "px")     
        // .style("top", (d3.event.pageY - 10) + "px");    
        // })           

        let mouseLeave = function(d) {
            d3.selectAll(".Country")
                .transition()
                .duration(200)
                .style("opacity", .8)
            d3.select(this)
                .transition()
                .duration(200)
                .style("stroke", "transparent")
        }

        // Draw the map
        svg.append("g")
            .attr("class", "countries")
            .selectAll("path")
            .data(topo.features)
            .enter().append("path")
                // draw each country
                .attr("d", d3.geoPath()
                .projection(projection)
                )
                .attr("fill", function (d){
                    // Pull data for this country
                    d.total_CO = data.get(d.id) || 0;
                    // Set the color
                    return colorScale(d.total_CO);
                })
                .style("stroke", "transparent")
                .attr("class", function(d){ return "Country" } )
                .style("opacity", .8)
                .on("mouseover", mouseOver)
                .on("mousemove", mousemove)
                .on("mouseleave", mouseLeave)

    }    
