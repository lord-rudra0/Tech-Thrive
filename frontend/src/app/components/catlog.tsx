import Image from "next/image";
import React from "react";
import { Timeline } from "./ui/timeline";
import KeralaForestVisualization from "./keralavisualisation";
import Treeloss from "./Treeloss";

export function TimelineCarbon() {
  const data = [
    {
      title: "2024",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-lg md:text-xl font-bold mb-4">
            Current Kerala Carbon Footprint Analysis
          </p>
          <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-4">
            Our latest data shows significant changes in Kerala's carbon emissions and forest cover compared to previous years. The visualization below highlights critical areas of concern and successful conservation efforts.The carbon emission has significantly increased in the recent years with significant loss of tree covered compared to recent years.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Image
              src="/keralaheatmap.jpg"
              alt="Kerala carbon emission heatmap 2024"
              width={500}
              height={500}
              className="rounded-lg object-fit h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
            <Image
              src="/forest.jpg"
              alt="Kerala forest cover satellite comparison 2024"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
            <Image
              src="/c02.jpg"
              alt="Western Ghats deforestation tracking 2024"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
          </div>
        </div>
      ),
    },
    {
      title: "2002-2022",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-lg md:text-xl font-bold mb-4">
            Kerala's Carbon Emission:Twenty-Year Trend Analysis.
          </p>
          <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-4">
            This historical data presents a comprehensive twenty-year analysis of Kerala's carbon footprint, showing patterns in emissions from industry, transportation, and changes in forest coverage.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Image
              src="/kerala1.jpg"
              alt="Kerala emissions trend 2018-2023"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
            <Image
              src="/kerala2.jpg"
              alt="Forest cover changes 2018-2023"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
            <Image
              src="/kerala3.jpg"
              alt="Sector-wise emissions comparison"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
            <Image
              src="/kerala4.jpg"
              alt="Post-flood environmental impact assessment"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
          </div>
        </div>
      ),
    },
    {
      title: "Emission",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-lg md:text-xl font-bold mb-4">
            Current Kerala Carbon Footprint Analysis
          </p>
          <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-4">
            Our latest data shows significant changes in Kerala's carbon emissions and forest cover compared to previous years. The visualization below highlights critical areas of concern and successful conservation efforts.The graph show there is significant decrease from the year from 2006-2010 and then a steady increase from the year 2010-2022
          </p>
          <div className=" ">
          <KeralaForestVisualization/>
          </div>
        </div>
      ),
    },

    {
      title: "Tree cover loss",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-lg md:text-xl font-bold mb-4">
            Current Kerala Carbon Footprint Analysis
          </p>
          <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-4">
            Our latest data shows significant changes in Kerala's carbon emissions and forest cover compared to previous years. The visualization below highlights critical areas of concern and successful conservation efforts.
          </p>
          <div className=" ">
          <Treeloss/>
          </div>
        </div>
      ),
    },


    {
      title: "Observed trend",
      content: (
        <div className="w-full bg-white rounded-lg shadow-lg p-4 dark:bg-stone-950">
        <h3 className="text-lg font-bold mb-2 text-gray-800 dark:text-white">Key Observations</h3>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
          <li>Carbon emissions have shown a significant upward trend, with 2023 recording the highest level at over 8 million Mg CO2e</li>
          <li>Tree cover loss peaked in 2023 at 12,375 hectares, nearly double the average annual loss</li>
          <li>Notable correlation between tree cover loss and carbon emissions, particularly evident in the spike years (2017, 2023)</li>
          <li>The period from 2016-2023 shows consistently higher levels of both metrics compared to earlier years</li>
          <li>2010 represents the year with lowest values for both metrics in the dataset</li>
        </ul>
      </div>
      ),
    },
  ];
  return (
    <div className="w-full p-5">
      <Timeline data={data} />
    </div>
  );
}