
-- +goose Up
ALTER TABLE sensors
  ADD COLUMN IF NOT EXISTS unit TEXT NOT NULL DEFAULT '';

-- Fix for the current columns
UPDATE sensors SET unit = '°C'   
  WHERE name = 'CPU Monitor'    
  AND unit = '';

UPDATE sensors SET unit = '%'    
  WHERE name = 'Memory Monitor' 
  AND unit = '';

UPDATE sensors SET unit = '%'    
  WHERE name = 'Disk I/O'       
  AND unit = '';

UPDATE sensors SET unit = 'Mbps' 
  WHERE name = 'Core Router'    
  AND unit = '';

UPDATE sensors SET unit = 'Mbps' 
  WHERE name = 'Switch Rack B'  
  AND unit = '';

UPDATE sensors SET unit = 'Mbps' 
  WHERE name = 'Firewall Main'  
  AND unit = '';
  
