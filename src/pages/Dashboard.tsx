import React, { useState, useEffect } from 'react';
import VideoCard from '../components/VideoCard';
import PlantDetailCard from '../components/PlantDetailCard';
import CircularProgress from '../components/CircularProgress';
import Filters from '../components/Filters';
import AnalysisCard from '../components/AnalysisCard'; // Create this component to display the analysis overview

interface Plant {
  id: string;
  image: string;
  circularity: number;
  eccentricity: number;
  area: string;
  perimeter: string;
  confidenceThreshold: number;
  appearance: string;
  rating: string;
}

interface Summary {
  video_id: string;
  bed_number: string;
  collection_date: string;
}

const Dashboard: React.FC = () => {
  // State to store the list of plants
  const [plants] = useState<Plant[]>(
    [...Array(10)].map((_, idx) => ({
      id: `1234-${idx}`,
      image: 'https://cdn.mos.cms.futurecdn.net/ENHKamYXrusiMeT5Yie5ei.jpg',
      circularity: 0.85,
      eccentricity: 0.45,
      area: '1345',
      perimeter: '234',
      confidenceThreshold: 0.95,
      appearance: 'Healthy',
      rating: 'Good',
    }))
  );

  // State to store filter criteria
  const [filters, setFilters] = useState<{
    id?: string;
    appearance?: string;
    rating?: string;
    circularityMin?: number;
    circularityMax?: number;
    eccentricityMin?: number;
    eccentricityMax?: number;
    confidenceThresholdMin?: number;
    confidenceThresholdMax?: number;
  }>({});

  // State to store the summaries from the API
  const [summaries, setSummaries] = useState<Summary[]>([]);

  // State to track whether the analysis data has been fetched and should be displayed
  const [selectedAnalysis, setSelectedAnalysis] = useState<null | Summary>(null);
  const [analysisData, setAnalysisData] = useState<any>(null); // Replace with actual data type

  // Fetch summaries from the API
  useEffect(() => {
    fetch('http://localhost:8080/data/summaries')
      .then((response) => response.json())
      .then((data) => setSummaries(data))
      .catch((error) => console.error('Error fetching summaries:', error));
  }, []);

  // Fetch analysis data from the API when an AnalysisCard is clicked
  const handleAnalysisClick = (summary: Summary) => {
    setSelectedAnalysis(summary); // Set the selected analysis

    // Fetch additional data from a placeholder API (replace this with your actual API)
    fetch('https://jsonplaceholder.typicode.com/posts/1') // Placeholder API
      .then((response) => response.json())
      .then((data) => {
        setAnalysisData(data); // Update with fetched data
      })
      .catch((error) => console.error('Error fetching analysis data:', error));
  };

  // Handle filter input change
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  // Handle range filter change
  const handleRangeChange = (name: string, min: number, max: number) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [`${name}Min`]: min,
      [`${name}Max`]: max,
    }));
  };

  // Filter the list of plants
  const filteredPlants = plants.filter((plant) => {
    return (
      (!filters.id || plant.id.includes(filters.id)) &&
      (!filters.appearance || plant.appearance === filters.appearance) &&
      (!filters.rating || plant.rating === filters.rating) &&
      (!filters.circularityMin ||
        (plant.circularity >= filters.circularityMin &&
          plant.circularity <= (filters.circularityMax ?? 1))) &&
      (!filters.eccentricityMin ||
        (plant.eccentricity >= filters.eccentricityMin &&
          plant.eccentricity <= (filters.eccentricityMax ?? 1))) &&
      (!filters.confidenceThresholdMin ||
        (plant.confidenceThreshold >= filters.confidenceThresholdMin &&
          plant.confidenceThreshold <= (filters.confidenceThresholdMax ?? 1)))
    );
  });

  return (
    <div className="p-4 min-h-full">
      <div className="container mx-auto space-y-6">
        {/* Analysis Overview Cards */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {summaries.map((summary) => (
            <AnalysisCard
              key={summary.video_id}
              videoId={summary.video_id}
              bedNumber={summary.bed_number}
              collectionDate={summary.collection_date}
              onClick={() => handleAnalysisClick(summary)} // Handle click event
            />
          ))}
        </div>

        {/* Only display the dashboard after analysis data is fetched */}
        {analysisData && (
          <>
            {/* Large Information Card */}
            <div className="rounded-lg shadow-md p-6 bg-white/10 relative">
              <div className="absolute top-0 left-0 bg-gray-200 text-black px-4 py-2 font-semibold text-xl">
                Azalea | Bed: {selectedAnalysis?.bed_number}
              </div>
              <button className="absolute top-0 right-0 px-4 py-2 bg-blue-500 rounded-bl-lg rounded-tr-lg font-semibold transition hover:bg-blue-700">
                Download XLSX
              </button>

              {/* Dashboard content */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pt-12">
                <div className="space-y-4 items-center justify-center">
                  <VideoCard title="Original Video" videoSrc="/path/to/original-video.mp4" />
                  <VideoCard title="Annotated Video" videoSrc="/path/to/annotated-video.mp4" />
                </div>
                <div className="space-y-4 flex flex-col items-center justify-center">
                  <CircularProgress value={30 / 50} label="Quality Above Threshold" size="large" />
                  <div className="flex items-center space-x-4 items-center justify-around">
                    <CircularProgress value={0.85} label="Average Circularity" size="small" />
                    <CircularProgress value={0.45} label="Average Eccentricity" size="small" />
                  </div>
                </div>
                <div className="space-y-4 items-center justify-center">
                  {[{ label: 'Total Plants', value: 50 },
                    { label: 'Above Threshold', value: 30 },
                    { label: 'Average Perimeter', value: '25.6 cm' },
                    { label: 'Average Area', value: '15.4 cm²' },
                    { label: 'Collection Date', value: '2024-10-03' },
                    { label: 'GPS Location', value: '40.12°N, 111.12°W' },
                  ].map((item, index) => (
                    <div key={index} className="flex">
                      <div className="bg-white/30 text-white px-4 py-2 rounded-l-lg font-semibold w-1/2">
                        {item.label}:
                      </div>
                      <div className="bg-white/20 text-white px-4 py-2 rounded-r-lg w-1/2">
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Filter Section */}
            <Filters filters={filters} handleFilterChange={handleFilterChange} handleRangeChange={handleRangeChange} />

            {/* Plant Details Cards */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-1 lg:grid-cols-2">
              {filteredPlants.map((plant) => (
                <PlantDetailCard key={plant.id} {...plant} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
