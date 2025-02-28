"use client";
import { useEffect, useRef } from "react";
import * as d3 from "d3";

const timelineData = [
  { year: "2002", images: ["/image1.jpg", "/image2.jpg"], description: "Key events in 2002" },
  { year: "2010", images: ["/image3.jpg", "/image4.jpg"], description: "Advancements in 2010" },
  { year: "2020", images: ["/image5.jpg", "/image6.jpg"], description: "Recent progress in 2020" },
];

export default function TimelineChart() {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous drawings

    const width = 800;
    const height = 200;
    const margin = { top: 50, right: 30, bottom: 50, left: 30 };

    // Create a scale for positioning
    const xScale = d3
      .scalePoint()
      .domain(timelineData.map((d) => d.year))
      .range([margin.left, width - margin.right]);

    // Draw the timeline line
    svg
      .append("line")
      .attr("x1", margin.left)
      .attr("x2", width - margin.right)
      .attr("y1", height / 2)
      .attr("y2", height / 2)
      .attr("stroke", "gray")
      .attr("stroke-width", 2);

    // Draw the circles for each year
    svg
      .selectAll(".year-circle")
      .data(timelineData)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.year)!)
      .attr("cy", height / 2)
      .attr("r", 10)
      .attr("fill", "blue")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("fill", "red"); // Highlight on hover
      })
      .on("mouseout", function () {
        d3.select(this).attr("fill", "blue");
      });

    // Add text labels for each year
    svg
      .selectAll(".year-label")
      .data(timelineData)
      .enter()
      .append("text")
      .attr("x", (d) => xScale(d.year)!)
      .attr("y", height / 2 - 20)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("fill", "black")
      .text((d) => d.year);

  }, []);

  return (
    <div className="flex flex-col items-center">
      <svg ref={svgRef} width={800} height={200}></svg>
    </div>
  );
}