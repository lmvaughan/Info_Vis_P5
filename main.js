window.onload = start;


function start() {
    var margin = { top: 50, right: 100, bottom: 100, left: 60 },
        width = 600 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;
    let allDrinks = [];
    let drinkTypes = [];
    let stats =
        ["Calories", "Total Fat (g)", "Trans Fat (g)", "Saturated Fat (g)", "Sodium (mg)", "Total Carbohydrates (g)",
            "Cholesterol (mg)", "Dietary Fibre (g)", "Sugars (g)", "Protein (g)", "Vitamin A (% DV)", "Vitamin C (% DV)", "Calcium (%DV)", "Iron (% DV)", "Caffeine (mg)"];
    let otherStats = ["Calories", "TotalFat", "TransFat", "SaturatedFat", "Sodium", "Carbs",
        "Cholesterol", "DietaryFibre", "Sugars", "Protein", "VitA", "VitC", "Calcium", "Iron", "Caffeine"];
    let curSelectedDrink = 0;
    let curSelectedType = 0;
    let curStat = 0;
    let domains = [];

    var svg = d3.select("#graph")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    d3.csv("starbucksdrinks.csv", function (csv) {
        let newData = [];
        for (let i = 0; i < csv.length; i++) {
            if (allDrinks.indexOf(csv[i].Beverage) == -1) {
                allDrinks.push(csv[i].Beverage);
                let subArray = [csv[i].Beverage_prep];
                drinkTypes.push(subArray);
            } else {
                let holder = drinkTypes[allDrinks.indexOf(csv[i].Beverage)];
                holder.push(csv[i].Beverage_prep);
                drinkTypes[allDrinks.indexOf(csv[i].Beverage)] = holder;
            }
            var dataToPush = {
                Beverage : csv[i].Beverage,
                Beverage_prep : csv[i].Beverage_prep,
                Calories : Number(csv[i].Calories),
                TotalFat : Number(csv[i][" Total Fat (g)"]),
                TransFat : Number(csv[i]["Trans Fat (g) "]),
                SaturatedFat : Number(csv[i]["Saturated Fat (g)"]),
                Sodium : Number(csv[i][" Sodium (mg)"]),
                Carbs : Number(csv[i][" Total Carbohydrates (g) "]),
                Cholesterol : Number(csv[i]["Cholesterol (mg)"]),
                Fibre : Number(csv[i][" Dietary Fibre (g)"]),
                Sugars : Number(csv[i][" Sugars (g)"]),
                Protein : Number(csv[i][" Protein (g) "]),
                VitA : parseFloat(csv[i]["Vitamin A (% DV) "]),
                VitC : parseFloat(csv[i]["Vitamin C (% DV)"]),
                Calcium : parseFloat(csv[i][" Calcium (% DV) "]),
                Iron : parseFloat(csv[i]["Iron (% DV) "]),
                Caffeine: Number(csv[i]["Caffeine (mg)"])
            }
            newData.push(dataToPush);
        }
        let xScale = d3.scaleBand().domain(drinkTypes[curSelectedDrink]).range([0, width]);

        let yScale = d3.scaleLinear().domain(getDomain()).range([height, 0]);

        var xAxis = d3.axisBottom(xScale);
        var yAxis = d3.axisLeft(yScale);

        svg.append("g")
            .attr("class", "yaxis")
            .call(yAxis);

        // now add titles to the y axis
              


        // draw x axis with labels and move to the bottom of the chart area
        svg.append("g")
            .attr("class", "xaxis")   // give it a class so it can be used to select only xaxis labels  below
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.select(".xaxis")  // select all the text elements for the xaxis
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");

        svg.append("text")
            .attr("class", "yaxis_label")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text(stats[curStat]);
       

        let line = svg
            .append('g')
            .append("path")
            .datum(newData)
            .attr("d", d3.line()
                .x(function (d) { if (d.Beverage == allDrinks[curSelectedDrink]) { return xScale(d.Beverage_prep) } })
                .y(function (d) { if (d.Beverage == allDrinks[curSelectedDrink]) { return yScale(d[otherStats[curStat]]) } })
            )
            .attr("stroke", function (d) { return getRandomColor() })
            .style("stroke-width", 4)
            .style("paddingleft", 10)
            .style("fill", "none");


        function getDomain() {
            var answer = d3.extent(newData, function (row) {
                var returnValue = 0;
                for (let i = 0; i < newData.length; i++) {
                    if (row.Beverage == allDrinks[curSelectedDrink]) {
                        returnValue = Math.max(returnValue, row[otherStats[curStat]]);
                    }
                }
                return returnValue;
            });
            return answer;

        }

        function update() {
            xScale = d3.scaleBand().domain(drinkTypes[curSelectedDrink]).range([0, width]);
            yScale = d3.scaleLinear().domain(getDomain()).range([height, 0]);
            xAxis = d3.axisBottom(xScale);
            yAxis = d3.axisLeft(yScale);
            svg.select(".yaxis")
                .transition().duration(1500)
                .call(yAxis);

            svg.select(".yaxis_label")
                .text(stats[curStat]);

            svg.select(".xaxis")
                .transition().duration(1500)
                .call(xAxis)
                .selectAll("text")
                    .style("text-anchor", "end")
                    .attr("dx", "-.8em")
                    .attr("dy", ".15em")
                    .attr("transform", "rotate(-65)");

            line 
                .datum(newData)
                .transition()
                .duration(1500)
                .attr("d", d3.line()
                    .x(function (d) { if (d.Beverage == allDrinks[curSelectedDrink]) { console.log(d.Beverage); console.log(d.Beverage_prep); return xScale(d.Beverage_prep) } })
                    .y(function (d) { if (d.Beverage == allDrinks[curSelectedDrink]) { console.log(d[otherStats[curStat]]); return yScale(d[otherStats[curStat]]) } })
            )
        }

        d3.select("#selectButton")
            .on("change", changeDrink)
            .selectAll('myOptions')
            .data(allDrinks)
            .enter()
            .append('option')
            .text(function (d) { return d; })
            .attr("value", function (d) {
                if (allDrinks.indexOf(d) == 32) {
                    changeDrink();
                }
                return d;
            });

        function changeDrink() {
            const value = document.getElementById("selectButton").value;
            curSelectedDrink = allDrinks.indexOf(value);
            update();
            d3.select("#selectButton2")
                .on("change", changeType)
                .selectAll('myOptions')
                .data(drinkTypes[curSelectedDrink])
                .enter()
                .append('option')
                .text(function (d) { return d; })
                .attr("value", function (d) { return d; })
        }

        function changeType() {
            const value = document.getElementById("selectButton2").value;
            curSelectedType = drinkTypes[curSelectedDrink].indexOf(value);
        }
        d3.select("#selectButton3")
            .on("change", changeStat)
            .selectAll('myOptions')
            .data(stats)
            .enter()
            .append('option')
            .text(function (d) { return d; })
            .attr("value", function (d) { return d; })

        function changeStat() {
            curStat = stats.indexOf(document.getElementById("selectButton3").value);
        }

        function getRandomColor() {
            var letters = '0123456789ABCDEF';
            var color = '#';
            for (var i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        }
    })
}
