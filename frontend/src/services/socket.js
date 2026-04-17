import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
        autoConnect: true,
      });

      this.socket.on('connect', () => {
        console.log('✅ Socket connected:', this.socket.id);
      });

      this.socket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
      });

      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Bus tracking
  trackBus(busId, callback) {
    if (!this.socket) this.connect();
    this.socket.emit('track-bus', busId);
    this.socket.on('bus-location-update', callback);
  }

  stopTrackingBus(busId, callback) {
    if (!this.socket) return;
    this.socket.emit('stop-tracking', busId);
    this.socket.off('bus-location-update', callback);
  }

  // Route tracking
  trackRoute(routeId, callback) {
    if (!this.socket) this.connect();
    this.socket.emit('track-route', routeId);
    this.socket.on('bus-location-update', callback);
  }

  stopTrackingRoute(routeId, callback) {
    if (!this.socket) return;
    this.socket.emit('stop-tracking', routeId);
    this.socket.off('bus-location-update', callback);
  }

  // Driver location update (for driver app)
  updateDriverLocation(data) {
    if (!this.socket) this.connect();
    this.socket.emit('driver-location-update', data);
  }

  // Passenger count update
  updatePassengerCount(data) {
    if (!this.socket) this.connect();
    this.socket.emit('passenger-count-update', data);
  }

  // Listen for passenger count updates
  onPassengerCountUpdate(callback) {
    if (!this.socket) this.connect();
    this.socket.on('passenger-count-updated', callback);
  }

  offPassengerCountUpdate(callback) {
    if (!this.socket) return;
    this.socket.off('passenger-count-updated', callback);
  }

  // Announcements
  listenForAnnouncements(callback) {
    if (!this.socket) this.connect();
    this.socket.on('announcement', callback);
  }

  stopListeningForAnnouncements(callback) {
    if (!this.socket) return;
    this.socket.off('announcement', callback);
  }

  broadcastAnnouncement(message, type = 'info') {
    if (!this.socket) this.connect();
    this.socket.emit('broadcast-announcement', { message, type });
  }

  // ETA updates
  listenForETAUpdates(callback) {
    if (!this.socket) this.connect();
    this.socket.on('eta-changed', callback);
  }

  stopListeningForETAUpdates(callback) {
    if (!this.socket) return;
    this.socket.off('eta-changed', callback);
  }

  updateETA(data) {
    if (!this.socket) this.connect();
    this.socket.emit('eta-update', data);
  }

  // Generic event listeners
  on(event, callback) {
    if (!this.socket) this.connect();
    this.socket.on(event, callback);
  }

  off(event, callback) {
    if (!this.socket) return;
    this.socket.off(event, callback);
  }

  emit(event, data) {
    if (!this.socket) this.connect();
    this.socket.emit(event, data);
  }
}

const socketService = new SocketService();
export default socketService;
