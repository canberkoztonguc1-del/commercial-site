
-- Insert sample data


-- categories
INSERT OR IGNORE INTO categories (id, name) VALUES
  (1, 'Electronics'),
  (2, 'Home'),
  (3, 'Outdoors');

-- brands
INSERT OR IGNORE INTO brands (id, name) VALUES
  (1, 'Vatanco'),
  (2, 'NordicPro'),
  (3, 'MiniMax');

-- products
INSERT INTO products (title, price, category_id, brand_id, description, image) VALUES
  ('Portable Speaker', 39.99, 1, 1, 'Compact Bluetooth speaker with clear sound.', 'speaker.jpg'),
  ('Wireless Mouse', 19.99, 1, 3, 'Ergonomic design and long battery life.', 'mouse.jpg'),
  ('LED Desk Lamp', 24.50, 2, 2, 'Adjustable arm lamp for your workspace.', 'lamp.jpg'),
  ('Camping Stove', 49.00, 3, 1, 'Lightweight stove perfect for outdoor cooking.', 'stove.jpg'),
  ('Thermal Bottle', 15.90, 3, 2, 'Keeps your drink hot or cold for hours.', 'bottle.jpg'),
  ('Throw Pillow', 12.00, 2, 3, 'Soft decorative pillow with removable cover.', 'pillow.jpg'),
  ('USB-C Hub', 34.99, 1, 1, 'Multiport hub with HDMI and card reader.', 'hub.jpg'),
  ('Smart Plug', 22.99, 2, 2, 'Wi-Fi controlled smart plug for any appliance.', 'plug.jpg'),
  ('Headlamp', 17.49, 3, 3, 'Adjustable brightness and waterproof headlamp.', 'headlamp.jpg');

  -- users
INSERT OR IGNORE INTO users (username, password, role)
VALUES ('admin', 'wdf#2025', 'admin');

