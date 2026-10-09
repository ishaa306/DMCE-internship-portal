// Mock placement API since there is no backend implemented yet for this flow
let mockPlacements = [];
let nextId = 1;

export const placementApi = {
  getPlacements: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: mockPlacements });
      }, 500);
    });
  },
  
  createPlacement: async (payload) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newPlacement = {
          id: nextId++,
          ...payload,
          status: 'pending',
          has_offer_letter: payload.has_offer_letter ? 1 : 0,
          offer_letter_key: null,
          created_at: new Date().toISOString()
        };
        mockPlacements.push(newPlacement);
        resolve({ data: newPlacement });
      }, 800);
    });
  },

  uploadOfferLetter: async (id, file) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockPlacements.findIndex(p => p.id === id);
        if (index !== -1) {
          mockPlacements[index].offer_letter_key = `placements/mock/${id}/offer-letter/${file.name}`;
          mockPlacements[index].has_offer_letter = 1;
        }
        resolve({ success: true });
      }, 1000);
    });
  }
};
