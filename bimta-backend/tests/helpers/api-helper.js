// tests/helpers/api-helper.js
const { request } = require('@playwright/test');

class APIHelper {
  constructor(baseURL) {
    this.baseURL = baseURL || process.env.API_BASE_URL || 'http://localhost:5000';
    this.token = null;
    this.context = null;
  }

  async init() {
    this.context = await request.newContext({
      baseURL: this.baseURL,
      extraHTTPHeaders: {
        'Accept': 'application/json',
      },
    });
  }

  setToken(token) {
    this.token = token;
  }

  getAuthHeader() {
    if (!this.token) return {};
    return { Authorization: `Bearer ${this.token}` };
  }

  async login(user_id, password) {
    const response = await this.context.post('/api/auth/login', {
      data: { user_id, password },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (data.success && data.data && data.data.token) {
      this.setToken(data.data.token);
      console.log(`✅ Logged in as ${user_id}`);
    } else {
      console.error(`❌ Login failed for ${user_id}:`, data);
    }
    
    return { response, data };
  }

  async get(endpoint, params = {}) {
    return await this.context.get(endpoint, {
      params,
      headers: {
        ...this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
    });
  }

  async post(endpoint, data, headers = {}) {
    return await this.context.post(endpoint, {
      data,
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
        ...headers,
      },
    });
  }

  async put(endpoint, data, headers = {}) {
    return await this.context.put(endpoint, {
      data,
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
        ...headers,
      },
    });
  }

  async patch(endpoint, data, headers = {}) {
    return await this.context.patch(endpoint, {
      data,
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
        ...headers,
      },
    });
  }

  async delete(endpoint, headers = {}) {
    return await this.context.delete(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
        ...headers,
      },
    });
  }

  // tests/helpers/api-helper.js
async uploadFile(endpoint, filePath, fieldName = 'document', additionalData = {}) {
  const fs = require('fs');
  const path = require('path');
  
  // Read file
  const fileBuffer = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);
  const mimeType = this.getMimeType(fileName);

  // Create multipart form data
  const formData = {
    [fieldName]: {
      name: fileName,
      mimeType: mimeType,
      buffer: fileBuffer,
    },
    ...additionalData,
  };

  return await this.context.post(endpoint, {
    multipart: formData,
    headers: this.getAuthHeader(),
  });
}

getMimeType(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const mimeTypes = {
    'pdf': 'application/pdf',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

  async dispose() {
    if (this.context) {
      await this.context.dispose();
    }
  }
}

module.exports = APIHelper;