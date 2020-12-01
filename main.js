window.onload = start;

function start() {
    const margin = { top: 50, right: 200, bottom: 200, left: 60 },
        width = 800 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;
    // Define Preset Colors/Drink Statistics used later for formatting text purposes
    let starBucksColors = ["#DFBF86", "#413026", "#231F20", "#006442", "#BD895D", "#6A4E36", "#516E49","#2F1F1F"];
    let stats =
        ["Calories", "Total Fat (g)", "Trans Fat (g)", "Saturated Fat (g)", "Sodium (mg)", "Total Carbohydrates (g)",
            "Cholesterol (mg)", "Dietary Fiber (g)", "Sugars (g)", "Protein (g)", "Vitamin A (% DV)", "Vitamin C (% DV)", "Calcium (%DV)", "Iron (% DV)", "Caffeine (mg)"];
    let otherStats = ["Calories", "TotalFat", "TransFat", "SaturatedFat", "Sodium", "Carbs",
        "Cholesterol", "DietaryFiber", "Sugars", "Protein", "VitA", "VitC", "Calcium", "Iron", "Caffeine"];
    let drinkSizes = ["Short ", "Tall ", "Grande ", "Venti "];
    //Declare empty arrays to be filled while parsing csv
    let curData = [];
    let allCategories = [];
    // A double array, to access specific subCategory do subCategory[category][0,1,2..ext]
    let subCategories = [];
    // Drink Types is a triple array where the sizes are held associated with the categories and sub categories
    // To access the types do drinkTypes[category][subCategory][0,1,2,ext..]
    let drinkTypes = [];
    let newData = [];
    // Declare state values for current items selected by Drop Down Menus (Set default to first index)
    let curColor = '#0B421A';
    let curStat = 0;
    let curCategory = 0;
    let curSub = 0;
    let curDrink;
    // Create SVG for Line Graph
    let svg = d3.select("#graph")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");
    //Create SVG for Bar graph
    let svg2 = d3.select("#graph1")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");
    //Parse CSV data
    d3.csv("starbucksdrinks.csv", function (csv) {
        let curSize = -1;
        //First for loop iterates through all rows of CSV
        for (let i = 0; i < csv.length; i++) {
            let duplicate = false;
            let hasSize = false;
            // Checks if drink has a size associated with it, if it doesn't it will later add the current Size to the Beverage_prep
            for (let j = 0; j < drinkSizes.length; j++) {
                if (csv[i].Beverage_prep.includes("Short")) {
                    curSize = 0;
                    hasSize = true;
                } else if (csv[i].Beverage_prep.includes("Tall")) {
                    curSize = 1;
                    hasSize = true;
                } else if (csv[i].Beverage_prep.includes("Grande")) {
                    curSize = 2;
                    hasSize = true;
                } else if (csv[i].Beverage_prep.includes("Venti")) {
                    curSize = 3;
                    hasSize = true;
                }
            }
            //Runs if category is not in the new Data Array  yet
            if (allCategories.indexOf(csv[i].Beverage_category) == -1) {
                //Adds new Category
                allCategories.push(csv[i].Beverage_category);
                let subArray = [csv[i].Beverage];
                //Adds sub category as well since it is a new Category
                subCategories.push(subArray);
                drinkTypes.push([]);
                // Runs if the drink did have a size associated with it already
                if (hasSize) {
                    let subSubArray = csv[i].Beverage_prep;
                    //adds new empty array to the drink Types tripple array 
                    drinkTypes[allCategories.indexOf(csv[i].Beverage_category)].push([]);
                    //adds the drink Breverage_prep to the drink types array at the third level of the arra.
                    //adds it to the [current Category][current subcategory]
                    drinkTypes[allCategories.indexOf(csv[i].Beverage_category)]
                    [subCategories[allCategories.indexOf(csv[i].Beverage_category)]
                        .indexOf(csv[i].Beverage)].push(subSubArray);
                } else {
                    //does the same thing as above but instead adds the drink size to the Beverage_prep beforehand
                    let subSubArray = `${drinkSizes[curSize]}${csv[i].Beverage_prep}`;
                    drinkTypes[allCategories.indexOf(csv[i].Beverage_category)].push([]);
                    drinkTypes[allCategories.indexOf(csv[i].Beverage_category)]
                    [subCategories[allCategories.indexOf(csv[i].Beverage_category)]
                        .indexOf(csv[i].Beverage)].push(subSubArray);
                }
                //Runs if the Category is already in the newArray
            } else {
                let holder = subCategories[allCategories.indexOf(csv[i].Beverage_category)];
                //Runs if the SubCategory is already in the newArray
                if (holder.indexOf(csv[i].Beverage) == -1) {

                    let tempArray = subCategories[allCategories.indexOf(csv[i].Beverage_category)];
                    tempArray.push(csv[i].Beverage);
                    //adds the new beverage to the already existing subCategory array at subCategory[category]
                    subCategories[allCategories.indexOf(csv[i].Beverage_category)] = tempArray;
                   //adds empty array to drinkTypes where new types will be held for current subcategory
                    drinkTypes[allCategories.indexOf(csv[i].Beverage_category)].push([]);
                    // runs if it hasSize already
                    if (hasSize) {
                        //adds new Drink Type to drinkTypes[category][subCategory]
                        drinkTypes[allCategories.indexOf(csv[i].Beverage_category)]
                        [subCategories[allCategories.indexOf(csv[i].Beverage_category)].indexOf(csv[i].Beverage)]
                            .push(csv[i].Beverage_prep);
                    } else {
                        // same as above but adds size to string
                        drinkTypes[allCategories.indexOf(csv[i].Beverage_category)]
                        [subCategories[allCategories.indexOf(csv[i].Beverage_category)].indexOf(csv[i].Beverage)]
                            .push(`${drinkSizes[curSize]}${csv[i].Beverage_prep}`);
                    }
                    //Runs if the subcategory is not already in the newArray
                } else {
                    if (hasSize) {
                        drinkTypes[allCategories.indexOf(csv[i].Beverage_category)]
                        [subCategories[allCategories.indexOf(csv[i].Beverage_category)].indexOf(csv[i].Beverage)]
                            .push(csv[i].Beverage_prep);
                    } else {
                        drinkTypes[allCategories.indexOf(csv[i].Beverage_category)]
                        [subCategories[allCategories.indexOf(csv[i].Beverage_category)].indexOf(csv[i].Beverage)]
                            .push(`${drinkSizes[curSize]}${csv[i].Beverage_prep}`);
                    }
                }
                
            }
            //adds all new data to newArray
            const dataToPush = {
                Beverage_category: csv[i].Beverage_category,
                Beverage : csv[i].Beverage,
                Beverage_prep: hasSize ? csv[i].Beverage_prep : `${drinkSizes[curSize]}${csv[i].Beverage_prep}`,
                Calories : Number(csv[i].Calories),
                TotalFat : Number(csv[i][" Total Fat (g)"]),
                TransFat : Number(csv[i]["Trans Fat (g) "]),
                SaturatedFat : Number(csv[i]["Saturated Fat (g)"]),
                Sodium : Number(csv[i][" Sodium (mg)"]),
                Carbs : Number(csv[i][" Total Carbohydrates (g) "]),
                Cholesterol : Number(csv[i]["Cholesterol (mg)"]),
                Fiber : Number(csv[i][" Dietary Fibre (g)"]),
                Sugars : Number(csv[i][" Sugars (g)"]),
                Protein : Number(csv[i][" Protein (g) "]),
                VitA : parseFloat(csv[i]["Vitamin A (% DV) "]),
                VitC : parseFloat(csv[i]["Vitamin C (% DV)"]),
                Calcium : parseFloat(csv[i][" Calcium (% DV) "]),
                Iron : parseFloat(csv[i]["Iron (% DV) "]),
                Caffeine: Number(csv[i]["Caffeine (mg)"])
            }
           newData.push(dataToPush)
        }
        //Console logs for the single array for categories, double array for subcategories, and tripple array for drinkTypes.
        // All arrays are 9 in length as that is how many categories there are
        //console.log(allCategories);
        //console.log(subCategories);
        //console.log(drinkTypes);

        //gets Data for line chart by usinbg the preset values of curCategory(0) and curSub(0)
        for (let i = 0; i < newData.length; i++) {
            if (newData[i].Beverage_category == allCategories[curCategory] && newData[i].Beverage == subCategories[curSub]) {
                curData.push(newData[i])
            }
        }
        //sets xScale and yScale of line chart
        //sets xScale Domain to the types of drinks at the curCategory and curSub
        let xScale = d3.scalePoint().domain(drinkTypes[curCategory][curSub]).range([0, width]);
        let yScale = d3.scaleLinear().domain(getDomain()).range([height, 0]);

        let xAxis = d3.axisBottom(xScale);
        let yAxis = d3.axisLeft(yScale);
        //adds y axis to line chart
        svg.append("g")
            .attr("class", "yaxis")
            .call(yAxis)

        //add xaxis to line chart
        svg.append("g")
            .attr("class", "xaxis")   
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);
        //add xaxis text
        svg.select(".xaxis") 
            .selectAll("text")
            .attr("class", "xaxis_label")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");
        //add yaxis label
        svg.append("text")
            .attr("class", "yaxis_label")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text(stats[curStat]);
       
        //creates line for linechart
        let line = d3.line()
            .x(function (d) { return xScale(d.Beverage_prep)})
            .y(function (d) { return yScale(d[otherStats[curStat]]) })
            .curve(d3.curveLinear);
        //tooltip for hovering on circle in line chart
        var tip = d3.tip()
            .attr('class', 'tip')
            .offset([-10, 0])
            .html(function (d) {
                return "<div class='d3-tip'><div class='outerDiv'>The <div class='important'>" + d.Beverage_prep + "</div> " + d.Beverage + " has <div class='important'>" + d[otherStats[curStat]] + "</div> " + stats[curStat]+"</div></div>";
            })
        //sets the path for the line and gives it a random color from our color array
        let path = svg.append("g")
            .append("path")
            .datum(curData)
            .attr("class", "line")
            .attr("d", line)
            .attr("stroke", function (d) { return getRandomColor(); })
            .style("stroke-width", 4)
            .style("fill", "none");
        //adds tooltip to svg
        svg.call(tip);
        //creates circles on the linechart at the associated xaxis points
        let circle = svg.append("g").selectAll("circle")
            .data(curData)
            .enter().append("circle")
            .attr("class", "circle")
            .attr("cx", function (d) { return xScale(d.Beverage_prep) })
            .attr("cy", function (d) { return yScale(d[otherStats[curStat]]) })
            .attr("r", 4)
            .style("fill", curColor)
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);
        //fills categories dropdown with all categories
        d3.select("#Select_Categories")
            .on("change", changeCategory)
            .selectAll('myOptions')
            .data(allCategories)
            .enter()
            .append('option')
            .text(function (d) { return d; })
            .attr("value", function (d) {
                return d;
            });
        //fills sub categories drop down with the current sub categories of the current category
        d3.select("#Select_Sub")
            .on("change", changeSub)
            .selectAll('myOptions')
            .data(subCategories[curCategory])
            .enter()
            .append('option')
            .text(function (d) { return d; })
            .attr("value", function (d) {
                return d;
            });
        //sets the value of the Choose a Nutrition Drop Down
        d3.select("#selectButton3")
            .on("change", changeStat)
            .selectAll('myOptions')
            .data(stats)
            .enter()
            .append('option')
            .text(function (d) { return d; })
            .attr("value", function (d) { return d; })
        //sets value of choose a size dropdown
        d3.select("#Select_Size")
            .on("change", changeSize)
            .selectAll('myOptions')
            .data(drinkTypes[curCategory][curSub])
            .enter()
            .append('option')
            .text(function (d) { return d; })
            .attr("value", function (d) { return d; })
        //Called to change the current size of the drink and then updategraph1
        function changeSize() {
            setValues();
            updateGraph1();
        }
        //gets the current selected value for curCategory and Current sub 
        function setValues() {
            curCategory = allCategories.indexOf(document.getElementById("Select_Categories").value);
            curSub = subCategories[curCategory].indexOf(document.getElementById('Select_Sub').value);
            updateDrink();
        }
        //called when category drop down is changed
        function changeCategory() {
            //these following lines delete all elements in the select a size drop down and select a sub dropdown
            //this is done because javascript adds elements to the cur list instead of replacing
            curSub = 0;
            const cur = (document.getElementById('Select_Sub'));
            while (cur.length > 0) {
                cur.remove(0);
            }
            const cur1 = (document.getElementById('Select_Size'));
            while (cur1.length > 0) {
                cur1.remove(0);
            }
            const value = document.getElementById("Select_Categories").value;
            //sets the curCategory
            curCategory = allCategories.indexOf(value);
            //adds the updated options based on the new category to the subcategory drop down
            d3.select("#Select_Sub")
                .selectAll('myOptions')
                .data(subCategories[curCategory])
                .enter()
                .append('option')
                .text(function (d) { return d; })
                .attr("value", function (d) {
                    return d;
                });
            //adds the updated options based on the new category to the sizes drop down
            d3.select("#Select_Size")
                .on("change", changeSize)
                .selectAll('myOptions')
                .data(drinkTypes[curCategory][curSub])
                .enter()
                .append('option')
                .text(function (d) { return d; })
                .attr("value", function (d) { return d; })
            //updates both charts based on new drop down data
            update();
            updateGraph1();
        }
        //called when the subcategory drop down is changed
        function changeSub() {
            const value = document.getElementById("Select_Sub").value;
            curSub = subCategories[curCategory].indexOf(value);
            const cur1 = (document.getElementById('Select_Size'));
            //removes all size drop down data
            while (cur1.length > 0) {
                cur1.remove(0);
            }
            //adds corrected new drop down data to size based on the new subcategory that was selected
            d3.select("#Select_Size")
                .on("change", changeSize)
                .selectAll('myOptions')
                .data(drinkTypes[curCategory][curSub])
                .enter()
                .append('option')
                .text(function (d) { return d; })
                .attr("value", function (d) { return d; })
            //updates both graphs
            update();
            updateGraph1();
        }
        //used to get the y domain for the line chart
        //returns the Max y value
        function getDomain() {
            let answer = d3.extent(newData, function (row) {
                let returnValue = 0;
                for (let i = 0; i < newData.length; i++) {
                    if (row.Beverage_category == allCategories[curCategory] && row.Beverage == subCategories[allCategories.indexOf(allCategories[curCategory])][curSub]) {
                        returnValue = Math.max(returnValue, row[otherStats[curStat]]);
                    }
                }
                return returnValue;
            });
            return answer;

        }
        //called when the choose a nutrition drop down is changed
        function changeStat() {
            //sets the new selected stat and updates the line graph
            curStat = stats.indexOf(document.getElementById("selectButton3").value);
            update();
        }
        //returns a random color from the array of colors initialized in the beggining
        function getRandomColor() {
            const length = starBucksColors.length;
            let randomNum = Math.floor(Math.random() * (length));
            curColor = starBucksColors[randomNum];
            return starBucksColors[randomNum];
        }
        //function to update the line graph once something is changed
        function update() {
            //makes sure all value are current
            setValues();
            //below does the same thing as above but a transition element is added to show a smooth transition from the old line
            //to the new line, based on the current drop down data
            xScale = d3.scalePoint().domain(drinkTypes[curCategory][curSub]).range([0, width]);
            yScale = d3.scaleLinear().domain(getDomain()).range([height, 0]);

            xAxis = d3.axisBottom(xScale);
            yAxis = d3.axisLeft(yScale);
            //updates yaxis
            svg.select(".yaxis")
                .transition().duration(500)
                .ease(d3.easeExp)
                .call(yAxis);
            //updates yaxis label
            svg.select(".yaxis_label")
                .transition().duration(500)
                .ease(d3.easeExp)
                .text(stats[curStat]);
            //updates xaxis
            svg.select(".xaxis")
                .transition().duration(500)
                .ease(d3.easeExp)
                .call(xAxis)
                .selectAll("text")
                .attr("class", "xaxis_label")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-65)");

            newNewData = [];
            curData = [];

            for (let i = 0; i < newData.length; i++) {
                if (newData[i].Beverage_category == allCategories[curCategory] && newData[i].Beverage == subCategories[allCategories.indexOf(allCategories[curCategory])][curSub]) { newNewData.push(newData[i]); curData.push(newData[i]); }
            }
            //updates to new line
            svg.select(".line")
                .datum(newNewData)
                .transition()
                .duration(1500)
                .ease(d3.easeElastic)
                .attr("d", line)
                .attr("stroke", function (d) { return getRandomColor(); });

            circles = svg.selectAll("circle")
                .data(newNewData);
            //updates current circles to new positions
            circles
                .transition()
                .duration(1500)
                .ease(d3.easeElastic)
                .attr("cx", function (d) { return xScale(d.Beverage_prep) })
                .attr("cy", function (d) { return yScale(d[otherStats[curStat]]) })
                .style("fill", curColor);
            //adds new circles if there are more x data points
            circles.enter()
                .append("circle")
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide)
                .transition()
                .duration(1500)
                .ease(d3.easeElastic)
                .attr("r", 4)
                .attr("cx", function (d) { return xScale(d.Beverage_prep) })
                .attr("cy", function (d) { return yScale(d[otherStats[curStat]]) })
                .style("fill", curColor);
            //removes extra circles if there are less x data points
            circles.exit().remove();
        }
        //sets the current drink to the value based on the selected Drop down data
        function updateDrink() {
            for (let i = 0; i < newData.length; i++) {
                if (newData[i].Beverage_category == allCategories[curCategory] && newData[i].Beverage == subCategories[curCategory][curSub]) {
                    if (newData[i].Beverage_prep == document.getElementById('Select_Size').value) {
                        curDrink = newData[i];
                    }
                    curData.push(newData[i])
                }
            }
        }
        updateDrink();
        // below is code for the bar graph initialization
        let zz = ["Caffeine", "Calcium", "Calories", "Carbs", "Cholesterol", "Fiber", "Iron", "Protein", "SaturatedFat", "Sodium", "Sugars", "TotalFat", "TransFat",
            "VitA", "VitC",];
        //these are the numbers that will be used to divide by to set each nutrition equal to its % daily value, value
        let percentDailyValue = [800.0, 1.0, 2000.0, 275.0, 300.0, 28.0, 1.0, 50.0, 20.0, 2300.0, 50.0, 65.0, 20.0, 1.0, 1.0];
        let updatedValues = [];
        let newObj = [];
        //sets newData based on curDrink, and percent Daily value numbers. Creates a percent
        for (let i = 0; i < zz.length; i++) {
            updatedValues.push(curDrink[zz[i]] / percentDailyValue[i]);
            let holder = {
                name: zz[i],
                value: curDrink[zz[i]] / percentDailyValue[i]
            };
            newObj.push(holder);
        }
        let bars = svg2.append('g');
        let max = 0;
        //gets max y height to use for yscale domain
        for (let z = 0; z < newObj.length; z++) {
            max = Math.max(max, newObj[z].value);
        }
        //sets xScale and yScale
        let xScale1 = d3.scaleBand().domain(zz).range([0, width]).padding(0.2);;
        let yScale1 = d3.scaleLinear()
            .domain([0, max])
            .range([height, 0]);
        let xAxis1 = d3.axisBottom(xScale1);
        //sets yAxis values
        var y = svg2.append("g")
            .attr("class", "myYaxis");
        //creates tooltip for the bar graph
        var tip2 = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function (d) {
                //converts value to a percent then round to two decimal places
                const value = Math.round(d.value * 10000 + Number.EPSILON) / 100
                return "<strong>Percent Daily Value:</strong> <span style='color:red'>" + value + "%" + "</span>";
            })
        //adds y axis label to bar graph
        svg2.append("text")
            .attr("class", "yaxis_label")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("% Daily Value");
        //adds new tooltip to bar graph svh
        svg2.call(tip2);
        //adds xaxis values
        bars
            .append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + yScale1(0) + ")")
            .call(xAxis1)
            .selectAll('text')
            .attr("class", "xaxis_label")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");
        //adds bars to graph
        bars
            .append("g")
            .selectAll(".bar")
            .data(newObj)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("transform", "translate(0, 0)")
            .attr("x", function (d) {
                return xScale1(d.name);
            })
            .attr("y", function (d) {
                return yScale1(d.value);
            })
            .attr("width", xScale1.bandwidth())
            .attr("height", function (d) {
                return height - yScale1(d.value);
            })
            .style("fill", curColor)
            .on('mouseover', tip2.show)
            .on('mouseout', tip2.hide);

        updateGraph1();
        //function used to update the bar graph
        //does everything as above but a transition is added to show the new data points when changing a dropdown
        function updateGraph1() {
            setValues();
            let zz = ["Caffeine", "Calcium", "Calories", "Carbs", "Cholesterol", "Fiber", "Iron", "Protein", "SaturatedFat", "Sodium", "Sugars", "TotalFat", "TransFat",
                "VitA", "VitC",];
            let percentDailyValue = [800.0, 100.0, 2000.0, 275.0, 300.0, 28.0, 100.0, 50.0, 20.0, 2300.0, 50.0, 65.0, 20.0, 100.0, 100.0];
            let updatedValues = [];
            let newObj = [];
            for (let i = 0; i < zz.length; i++) {
                updatedValues.push(curDrink[zz[i]] / percentDailyValue[i]);
                let curValue = curDrink[zz[i]];
                if (isNaN(curValue)) {
                    curValue = 0;
                }
                let holder = {
                    name: zz[i],
                    value: curValue / percentDailyValue[i]
                };
                newObj.push(holder);
            }
            for (let z = 0; z < newObj.length; z++) {
                max = Math.max(max, newObj[z].value);
            }
            yScale1 = d3.scaleLinear()
                .domain([0, max])
                .range([height, 0]);
            y.transition().duration(1000).call(d3.axisLeft(yScale1));


            let u = svg2.selectAll("rect")
                .data(newObj)
            //transitions to new bar chart
            u
                .enter()
                .append("rect") 
                .merge(u)
                .transition() 
                .duration(1500)
                .ease(d3.easeElastic)
                .attr("x", function (d) {
                    return xScale1(d.name);
                })
                .attr("y", function (d) {
                    return (yScale1(d.value)) > 0 ? yScale1(d.value) : 0;
                })
                .attr("width", xScale1.bandwidth())
                .attr("height", function (d) {
                    return height - yScale1(d.value);
                })
                .style("fill", getRandomColor());

        }
    })
}
