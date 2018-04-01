

  MemcacheStats
=================

Basic Memcached stats interface. Monitors a single Memcached instance to show graphs for:

 - commands
 - hits / misses
 - number of items
 

   Add to docker compose file
--------------------------------

    memcachestats:
         image: dpik/memcachestats
         ports:
             - 8080:8080
         environment:
             - MEMCACHESTATS_HOST=memcache-server
             - MEMCACHESTATS_PORT=11211
             
   Run via Docker
 ------------------
 
 `docker run -p 8080:8080 -e "MEMCACHESTATS_HOST=192.168.1.20" -e "MEMCACHESTATS_PORT=11211"`