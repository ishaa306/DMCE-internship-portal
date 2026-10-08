import axios from 'axios';

// Create a specialized axios instance for the separate Internship Backend
const internshipApiClient = axios.create({
  baseURL: import.meta.env.VITE_INTERNSHIP_API_URL || 'http://localhost:8787',
  withCredentials: true, // Important to pass the existing placement portal cookies
});

export const internshipApi = {
  /**
   * Submit new internship structured data.
   * Note: Files are NOT uploaded here.
   */
  createInternship: async (internshipData) => {
    try {
      const response = await internshipApiClient.post('/api/internships', internshipData);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw error.response.data;
      }
      throw new Error('Network error or backend unavailable.');
    }
  },

  /**
   * Get all internships for the authenticated student.
   */
  getInternships: async () => {
    try {
      const response = await internshipApiClient.get('/api/internships');
      return response.data;
    } catch (error) {
      if (error.response) {
        throw error.response.data;
      }
      throw new Error('Network error or backend unavailable.');
    }
  },

  /**
   * Upload an offer letter for an existing internship.
   */
  uploadOfferLetter: async (internshipId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await internshipApiClient.post(`/api/internships/${internshipId}/offer-letter`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw error.response.data;
      }
      throw new Error('Network error or backend unavailable.');
    }
  },

  /**
   * Upload a completion certificate for an existing internship.
   */
  uploadCompletionCertificate: async (internshipId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await internshipApiClient.post(`/api/internships/${internshipId}/completion-certificate`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw error.response.data;
      }
      throw new Error('Network error or backend unavailable.');
    }
  },

  // ==========================================
  // TnPCO / TPO Endpoints
  // ==========================================

  /**
   * Get all internships for TPO/TnPCO dashboard.
   */
  getAllInternships: async () => {
    try {
      const response = await internshipApiClient.get('/api/tpo/internships');
      return response.data;
    } catch (error) {
      if (error.response) {
        throw { status: error.response.status, ...error.response.data };
      }
      throw new Error('Network error or backend unavailable.');
    }
  },

  /**
   * Get specific internship details for TPO/TnPCO dashboard.
   */
  getInternshipDetails: async (internshipId) => {
    try {
      const response = await internshipApiClient.get(`/api/tpo/internships/${internshipId}`);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw { status: error.response.status, ...error.response.data };
      }
      throw new Error('Network error or backend unavailable.');
    }
  },

  /**
   * Download offer letter document for TPO
   */
  downloadOfferLetter: async (internshipId) => {
    try {
      const response = await internshipApiClient.get(`/api/tpo/internships/${internshipId}/offer-letter`, {
        responseType: 'blob' // Important for handling binary data
      });
      return {
        blob: response.data,
        contentType: response.headers['content-type']
      };
    } catch (error) {
      if (error.response && error.response.data instanceof Blob) {
        // Parse the error blob to json
        const text = await error.response.data.text();
        try {
          const json = JSON.parse(text);
          throw { status: error.response.status, ...json };
        } catch (e) {
          throw { status: error.response.status, message: 'Document access error' };
        }
      }
      throw new Error('Network error or backend unavailable.');
    }
  },

  /**
   * Download completion certificate document for TPO
   */
  downloadCompletionCertificate: async (internshipId) => {
    try {
      const response = await internshipApiClient.get(`/api/tpo/internships/${internshipId}/completion-certificate`, {
        responseType: 'blob'
      });
      return {
        blob: response.data,
        contentType: response.headers['content-type']
      };
    } catch (error) {
      if (error.response && error.response.data instanceof Blob) {
        const text = await error.response.data.text();
        try {
          const json = JSON.parse(text);
          throw { status: error.response.status, ...json };
        } catch (e) {
          throw { status: error.response.status, message: 'Document access error' };
        }
      }
      throw new Error('Network error or backend unavailable.');
    }
  },

  /**
   * Verify an internship
   */
  verifyInternship: async (internshipId) => {
    try {
      const response = await internshipApiClient.patch(`/api/tpo/internships/${internshipId}/verify`);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw { status: error.response.status, ...error.response.data };
      }
      throw new Error('Network error or backend unavailable.');
    }
  },

  /**
   * Reject an internship
   */
  rejectInternship: async (internshipId, rejectionReason) => {
    try {
      const response = await internshipApiClient.patch(`/api/tpo/internships/${internshipId}/reject`, {
        rejection_reason: rejectionReason
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw { status: error.response.status, ...error.response.data };
      }
      throw new Error('Network error or backend unavailable.');
    }
  }
};
