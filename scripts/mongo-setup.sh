#!/bin/bash
# Wait for MongoDB to start
sleep 5

echo "Initializing MongoDB Replica Set rs0..."
docker exec -it mongo1 mongosh --port 27017 --eval "
rs.initiate({
  _id: 'rs0',
  members: [
    { _id: 0, host: 'mongo1:27017' },
    { _id: 1, host: 'mongo2:27018' },
    { _id: 2, host: 'mongo3:27019' }
  ]
})
"
echo "Replica Set initialized successfully!"
