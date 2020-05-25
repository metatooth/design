import {HTTP} from './http-common';

const RESOURCE_NAME = '/assets';

export default {
  get_all: function() {
    return HTTP.get(`${RESOURCE_NAME}`);
  },

  get: function(id) {
    return HTTP.get(`${RESOURCE_NAME}/${id}`);
  },

  create: function(data) {
    return HTTP.post(`${RESOURCE_NAME}`, data);
  },

  update: function(id, data) {
    return HTTP.put(`${RESOURCE_NAME}/${id}`, data);
  },

  destroy: function(id) {
    return HTTP.delete(`${RESOURCE_NAME}/${id}`);
  },
};
