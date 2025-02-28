'use client'
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

// Define types for our data
interface ForestData {
  year: number;
  value: number;
}

const KeralaForestVisualization = () => {


  const carbonChartRef = useRef<HTMLDivElement>(null);
  
  
  useEffect(() => {
    if (carbonChartRef.current ) {
      createCarbonEmissionsChart();
      
    }
    
 
 
  }, []);
  
  const createCarbonEmissionsChart = () => {
    // Clear previous chart
    d3.select(carbonChartRef.current).selectAll("*").remove();
    
    // Set dimensions
    const margin = { top: 40, right: 30, bottom: 50, left: 80 };
    const width = 700 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    
    // Carbon emissions data from 2001 to 2023 (threshold 30)
    const carbonData: ForestData[] = [
      { year: 2001, value: 380446 },
      { year: 2002, value: 520157 },
      { year: 2003, value: 906552 },
      { year: 2004, value: 822672 },
      { year: 2005, value: 773601 },
      { year: 2006, value: 992289 },
      { year: 2007, value: 2371688 },
      { year: 2008, value: 1675777 },
      { year: 2009, value: 580093 },
      { year: 2010, value: 110946 },
      { year: 2011, value: 2758455 },
      { year: 2012, value: 2149067 },
      { year: 2013, value: 1593404 },
      { year: 2014, value: 2187600 },
      { year: 2015, value: 1588041 },
      { year: 2016, value: 4287417 },
      { year: 2017, value: 5797308 },
      { year: 2018, value: 3851668 },
      { year: 2019, value: 4572058 },
      { year: 2020, value: 4321447 },
      { year: 2021, value: 3352339 },
      { year: 2022, value: 4132878 },
      { year: 2023, value: 8010470 }
    ];
    
    // Create SVG
    const svg = d3.select(carbonChartRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // X axis
    const x = d3.scaleLinear()
      .domain([d3.min(carbonData, d => d.year) || 2001, d3.max(carbonData, d => d.year) || 2023])
      .range([0, width]);
    
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-65)");
    
    // Y axis
    const y = d3.scaleLinear()
      .domain([0, d3.max(carbonData, d => d.value) || 0])
      .range([height, 0]);
    
    svg.append("g")
      .call(d3.axisLeft(y).tickFormat(d => `${(+d/1000000).toFixed(1)}M`));
    
    // Line
    const line = d3.line<ForestData>()
      .x(d => x(d.year))
      .y(d => y(d.value))
      .curve(d3.curveMonotoneX);
    
    // Add the path
    svg.append("path")
      .datum(carbonData)
      .attr("fill", "none")
      .attr("stroke", "#ff5722")
      .attr("stroke-width", 2.5)
      .attr("d", line);
    
    // Add dots
    svg.selectAll(".dot")
      .data(carbonData)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", d => x(d.year))
      .attr("cy", d => y(d.value))
      .attr("r", 5)
      .attr("fill", "#ff5722");
    
    // Add hover effects - FIXED TYPE ISSUE
    svg.selectAll<SVGCircleElement, ForestData>(".dot")
      .on("mouseover", function(event, d) {
        d3.select(this)
          .attr("r", 8)
          .attr("fill", "#ff9800");
        
        svg.append("text")
          .attr("class", "tooltip")
          .attr("x", x(d.year) + 10)
          .attr("y", y(d.value) - 10)
          .text(`${d.year}: ${(d.value/1000000).toFixed(2)}M Mg CO2e`)
          .style("font-size", "12px")
          .style("font-weight", "bold");
      })
      .on("mouseout", function() {
        d3.select(this)
          .attr("r", 5)
          .attr("fill", "#ff5722");
        
        svg.selectAll(".tooltip").remove();
      });
    
    // Add labels
    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("x", width/2)
      .attr("y", height + margin.bottom - 5)
      .text("Year")
      .style("font-weight", "bold");
    
    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 20)
      .attr("x", -height/2)
      .text("Carbon Emissions (Mg CO2e)")
      .style("font-weight", "bold");
    
    // Add chart title
    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("x", width/2)
      .attr("y", -margin.top/2)
      .text("Kerala Carbon Emissions (2001-2023)")
      .style("font-size", "16px")
      .style("font-weight", "bold");
  };

 
  
  return (
    <div className="flex flex-col items-center w-full gap-12 p-6">
      <div className="w-full bg-white rounded-lg shadow-lg p-4 dark:bg-stone-950">
        <h2 className="text-xl font-bold mb-4 text-center text-gray-800 dark:text-white">Carbon Emissions Over Time (Threshold 30)</h2>
        <div className="overflow-x-auto" ref={carbonChartRef}></div>
      

        <p className="text-sm text-gray-600 mt-2 dark:text-gray-300">
          Source: Global Forest Watch carbon flux data for Kerala, India (2001-2023)
        </p>
      </div>
      
     
      
      
    </div>
  );
};

export default KeralaForestVisualization;