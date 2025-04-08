import { useEffect, useRef, useState } from "react";

interface AddressAutocompleteProps {
  onAddressSelect: (
    address: string,
    latitude: number,
    longitude: number
  ) => void;
  placeholder?: string;
  className?: string;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  onAddressSelect,
  placeholder = "Enter address",
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [address, setAddress] = useState("");
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const latestQueryRef = useRef("");

  // Function to fetch address suggestions from Nominatim API
  const fetchSuggestions = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      // Use Nominatim API to search for addresses
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=5&countrycodes=us`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch address suggestions");
      }

      const data = await response.json();
      console.log("Nominatim API response:", data); // Debug log to see the response format

      // Ensure we have valid data with lat/lon properties
      const validResults = data.filter(
        (item: NominatimResult) =>
          item && typeof item.lat === "string" && typeof item.lon === "string"
      );

      // Only update suggestions if the query hasn't changed
      if (query === latestQueryRef.current) {
        setSuggestions(validResults);
        setShowSuggestions(true);

        // If there's exactly one suggestion, automatically select it
        if (validResults.length === 1) {
          handleSuggestionClick(validResults[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching address suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddress(value);
    latestQueryRef.current = value; // update the latest query

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer to debounce API calls
    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 500);
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: NominatimResult) => {
    // Clear any pending debounce timer to prevent outdated API calls
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }

    // Update the input field with the selected address
    setAddress(suggestion.display_name);
    // Update latestQueryRef to the selected suggestion to block stale queries
    latestQueryRef.current = suggestion.display_name;
    setShowSuggestions(false);

    // Extract latitude and longitude from the suggestion
    const latitude = parseFloat(suggestion.lat);
    const longitude = parseFloat(suggestion.lon);

    console.log("Selected coordinates:", { latitude, longitude });

    // Call the callback with the address and coordinates
    onAddressSelect(suggestion.display_name, latitude, longitude);
  };

  // Close suggestions when clicking outside of the component container
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        value={address}
        onChange={handleInputChange}
        onFocus={() => address.trim() && setShowSuggestions(true)}
        placeholder={placeholder}
        className={`border px-3 py-2 w-full ${className}`}
      />

      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSuggestionClick(suggestion);
              }}
            >
              {suggestion.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AddressAutocomplete;
