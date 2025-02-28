'use client'
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

// Define types for our data
interface ForestData {
  year: number;
  value: number;
}

const Treeloss = () => {


  
  const treeLossChartRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if ( treeLossChartRef.current) {
     
      createTreeLossChart();
    }
    
 
 
  }, []);
  
 

  const createTreeLossChart = () => {
    // Clear previous chart
    d3.select(treeLossChartRef.current).selectAll("*").remove();
    
    // Set dimensions
    const margin = { top: 40, right: 30, bottom: 50, left: 60 };
    const width = 700 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    
    // Tree loss data from 2001 to 2023 (threshold 30)
    const treeLossData: ForestData[] = [
      { year: 2001, value: 744 },
      { year: 2002, value: 1031 },
      { year: 2003, value: 1778 },
      { year: 2004, value: 1580 },
      { year: 2005, value: 1458 },
      { year: 2006, value: 1885 },
      { year: 2007, value: 4344 },
      { year: 2008, value: 3076 },
      { year: 2009, value: 1048 },
      { year: 2010, value: 204 },
      { year: 2011, value: 4909 },
      { year: 2012, value: 3787 },
      { year: 2013, value: 2800 },
      { year: 2014, value: 3823 },
      { year: 2015, value: 2710 },
      { year: 2016, value: 7187 },
      { year: 2017, value: 9722 },
      { year: 2018, value: 6273 },
      { year: 2019, value: 7418 },
      { year: 2020, value: 6850 },
      { year: 2021, value: 5299 },
      { year: 2022, value: 6468 },
      { year: 2023, value: 12375 }
    ];
    
    // Create SVG
    const svg = d3.select(treeLossChartRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // X axis
    const x = d3.scaleBand()
      .domain(treeLossData.map(d => d.year.toString()))
      .range([0, width])
      .padding(0.2);
    
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickValues(x.domain().filter((d,i) => !(i%2))))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-65)");
    
    // Y axis
    const y = d3.scaleLinear()
      .domain([0, d3.max(treeLossData, d => d.value) || 0])
      .range([height, 0]);
    
    svg.append("g")
      .call(d3.axisLeft(y));
    
    // Add bars
    svg.selectAll(".bar")
      .data(treeLossData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.year.toString()) || 0)
      .attr("y", d => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d.value))
      .attr("fill", d => {
        // Color gradient based on value
        if (d.value < 2000) return "#8bc34a";
        if (d.value < 5000) return "#ffc107";
        if (d.value < 8000) return "#ff9800";
        return "#f44336";
      });
    
    // Add hover effects - FIXED TYPE ISSUE
    svg.selectAll<SVGRectElement, ForestData>(".bar")
      .on("mouseover", function(event, d) {
        d3.select(this)
          .attr("opacity", 0.8)
          .attr("stroke", "#000")
          .attr("stroke-width", 1);
        
        svg.append("text")
          .attr("class", "tooltip")
          .attr("x", (x(d.year.toString()) || 0) + x.bandwidth()/2)
          .attr("y", y(d.value) - 10)
          .attr("text-anchor", "middle")
          .text(`${d.value} ha`)
          .style("font-size", "12px")
          .style("font-weight", "bold");
      })
      .on("mouseout", function() {
        d3.select(this)
          .attr("opacity", 1)
          .attr("stroke", "none");
        
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
      .text("Tree Cover Loss (Hectares)")
      .style("font-weight", "bold");
    
    // Add chart title
    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("x", width/2)
      .attr("y", -margin.top/2)
      .text("Kerala Tree Cover Loss (2001-2023)")
      .style("font-size", "16px")
      .style("font-weight", "bold");
  };
  
  return (
    <div className="flex flex-col items-center w-full gap-12 p-6">
     
      
      <div className="w-full bg-white rounded-lg shadow-lg p-4 dark:bg-stone-950">
        <h2 className="text-xl font-bold mb-4 text-center text-gray-800 dark:text-white">Tree Cover Loss Over Time (Threshold 30)</h2>
        
       <div className="overflow-x-auto" ref={treeLossChartRef}></div>
        
        <p className="text-sm text-gray-600 mt-2 dark:text-gray-300">
          Source: Global Forest Watch tree cover loss data for Kerala, India (2001-2023)
        </p>
      </div>
      
      
    </div>
  );
};

export default Treeloss;