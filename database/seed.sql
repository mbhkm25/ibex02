-- Database Seed Data
-- 
-- Architecture: Canonical templates for each business model
-- 
-- These templates are the base configurations that get applied
-- when a business is activated from a service request.
--
-- Template Mapping:
-- - commerce → COMMERCE_BASE
-- - food → FOOD_BASE
-- - services → SERVICES_BASE
-- - rental → RENTAL_BASE
--
-- Created: 2024-01-20
-- Author: Senior PostgreSQL Engineer

-- Insert canonical templates
-- Using ON CONFLICT DO NOTHING to allow safe re-runs
insert into templates (id, business_model, config) values
('COMMERCE_BASE', 'commerce', '{"features":["inventory","sales","debts"]}'),
('FOOD_BASE', 'food', '{"features":["menu","orders"]}'),
('SERVICES_BASE', 'services', '{"features":["appointments","clients"]}'),
('RENTAL_BASE', 'rental', '{"features":["contracts","availability"]}')
on conflict (id) do nothing;

