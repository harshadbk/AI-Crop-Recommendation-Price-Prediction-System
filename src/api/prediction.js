import { apiClient as API } from './client';

/**
 * Fetch real-world market prices from the backend prediction endpoint.
 * @param {Object} params - { state, district, market, commodity }
 */
export const fetchMarketPrices = async (params) => {
    try {
        const response = await API.post('/api/market-prediction', params);
        return response.data;
    } catch (error) {
        console.error("Error fetching market prices:", error);
        throw error;
    }
};

export const fetchCropHeatMap = async (params) => {
    try {
        const response = await API.post('/api/crop-intensity-heatmap', params);
        return response.data;
    } catch (error) {
        console.error("Error fetching heatmap data:", error);
        throw error;
    }
};
