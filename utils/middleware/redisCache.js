const redis = require('redis');
const client = redis.createClient({
  host: 'localhost',  // Ganti jika menggunakan Redis yang dikelola oleh cloud
  port: 3000         // Gunakan port Redis default (6379), bukan 3000
});

client.on('connect', () => {
  console.log('Connected to Redis');
});

// Fungsi untuk menyimpan data di Redis
const setCache = (key, value, ttl = 3600) => {
  client.setex(key, ttl, JSON.stringify(value), (err, reply) => {
    if (err) {
      console.error('Error setting cache:', err);
    } else {
      console.log('Data cached with key:', key);
    }
  });
};

// Fungsi untuk mengambil data dari Redis
const getCache = (key, callback) => {
  client.get(key, (err, data) => {
    if (err) {
      console.error('Error getting cache:', err);
      return callback(err);
    }
    if (data) {
      return callback(null, JSON.parse(data));  // Data ada di cache
    }
    return callback(null, null);  // Data tidak ada di cache
  });
};

// Session Storage (Menyimpan sesi pengguna)
const setSession = (sessionId, userData, ttl = 3600) => {
  client.setex(`session:${sessionId}`, ttl, JSON.stringify(userData), (err, reply) => {
    if (err) {
      console.error('Error setting session:', err);
    } else {
      console.log('Session stored for sessionId:', sessionId);
    }
  });
};

const getSession = (sessionId, callback) => {
  client.get(`session:${sessionId}`, (err, data) => {
    if (err) {
      console.error('Error getting session:', err);
      return callback(err);
    }
    if (data) {
      return callback(null, JSON.parse(data));  // Session data ditemukan
    }
    return callback(null, null);  // Session tidak ditemukan
  });
};

// Queueing (Sistem antrian tugas atau pekerjaan asinkron)
const enqueueTask = (queueName, taskData) => {
  client.lpush(queueName, JSON.stringify(taskData), (err, reply) => {
    if (err) {
      console.error('Error enqueuing task:', err);
    } else {
      console.log('Task enqueued to', queueName);
    }
  });
};

const dequeueTask = (queueName, callback) => {
  client.rpop(queueName, (err, taskData) => {
    if (err) {
      console.error('Error dequeuing task:', err);
      return callback(err);
    }
    if (taskData) {
      return callback(null, JSON.parse(taskData));  // Task ditemukan
    }
    return callback(null, null);  // Task tidak ada dalam antrean
  });
};

// Real-Time Data Store (Data yang memerlukan pembaruan langsung)
const setRealTimeData = (key, value) => {
  client.set(key, JSON.stringify(value), (err, reply) => {
    if (err) {
      console.error('Error setting real-time data:', err);
    } else {
      console.log('Real-time data stored with key:', key);
    }
  });
};

const getRealTimeData = (key, callback) => {
  client.get(key, (err, data) => {
    if (err) {
      console.error('Error getting real-time data:', err);
      return callback(err);
    }
    if (data) {
      return callback(null, JSON.parse(data));  // Data ditemukan
    }
    return callback(null, null);  // Data tidak ditemukan
  });
};

// Pub/Sub (Sistem komunikasi antar proses atau aplikasi)
const publishMessage = (channel, message) => {
  client.publish(channel, JSON.stringify(message), (err, reply) => {
    if (err) {
      console.error('Error publishing message:', err);
    } else {
      console.log('Message published to channel:', channel);
    }
  });
};

const subscribeToChannel = (channel, callback) => {
  client.subscribe(channel);
  client.on('message', (channel, message) => {
    callback(channel, JSON.parse(message));
  });
};

// Rate Limiting (Pembatasan jumlah permintaan API)
const rateLimit = (key, maxRequests, ttl, callback) => {
  client.multi()
    .incr(key)
    .expire(key, ttl)
    .exec((err, replies) => {
      if (err) {
        console.error('Error in rate limiting:', err);
        return callback(err);
      }
      const requestCount = replies[0];
      if (requestCount > maxRequests) {
        return callback(null, 'Rate limit exceeded');
      }
      return callback(null, 'Request allowed');
    });
};

// Geospatial Indexing (Data berbasis lokasi)
const addGeoLocation = (key, member, longitude, latitude) => {
  client.geoadd(key, longitude, latitude, member, (err, reply) => {
    if (err) {
      console.error('Error adding geolocation:', err);
    } else {
      console.log('Geolocation added for', member);
    }
  });
};

const getGeoLocation = (key, member, callback) => {
  client.geopos(key, member, (err, positions) => {
    if (err) {
      console.error('Error getting geolocation:', err);
      return callback(err);
    }
    return callback(null, positions);
  });
};

// Leaderboard dan Ranking (Peringkat pengguna)
const setLeaderboard = (key, user, score) => {
  client.zadd(key, score, user, (err, reply) => {
    if (err) {
      console.error('Error adding to leaderboard:', err);
    } else {
      console.log('User added to leaderboard:', user);
    }
  });
};

const getLeaderboard = (key, callback) => {
  client.zrevrange(key, 0, -1, 'WITHSCORES', (err, leaderboard) => {
    if (err) {
      console.error('Error retrieving leaderboard:', err);
      return callback(err);
    }
    return callback(null, leaderboard);
  });
};

// Data Persistency (Menjaga data tetap tersedia meski server dimulai ulang)
const saveDataPersistently = (key, value) => {
  client.set(key, JSON.stringify(value), 'PX', 10000, (err, reply) => {
    if (err) {
      console.error('Error saving data persistently:', err);
    } else {
      console.log('Data saved persistently with key:', key);
    }
  });
};

// Counter dan Statistik (Penghitungan statistik atau counter)
const incrementCounter = (key) => {
  client.incr(key, (err, reply) => {
    if (err) {
      console.error('Error incrementing counter:', err);
    } else {
      console.log('Counter incremented for key:', key, 'New count:', reply);
    }
  });
};

// Full-Text Search (Pencarian teks penuh menggunakan Redisearch)
// (Misalnya menggunakan Redisearch module)
const searchText = (index, query, callback) => {
  client.ft_search(index, query, (err, results) => {
    if (err) {
      console.error('Error searching text:', err);
      return callback(err);
    }
    return callback(null, results);
  });
};

module.exports = {
  setCache,
  getCache,
  setSession,
  getSession,
  enqueueTask,
  dequeueTask,
  setRealTimeData,
  getRealTimeData,
  publishMessage,
  subscribeToChannel,
  rateLimit,
  addGeoLocation,
  getGeoLocation,
  setLeaderboard,
  getLeaderboard,
  saveDataPersistently,
  incrementCounter,
  searchText,
};
