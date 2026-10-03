-- ASWAL TOUR & TRAVELS — production database blueprint
create extension if not exists pgcrypto;
create table if not exists destinations(id uuid primary key default gen_random_uuid(),name text not null,region text,slug text unique not null,distance_from_haridwar_km integer,active boolean default true);
create table if not exists vehicles(id uuid primary key default gen_random_uuid(),name text not null,type text not null,seats integer,rate_per_km numeric(10,2),base_fare numeric(10,2) default 0,active boolean default true);
create table if not exists drivers(id uuid primary key default gen_random_uuid(),name text not null,mobile text not null,license_no text,license_verified boolean default false,vehicle_id uuid references vehicles(id),active boolean default true);
create table if not exists packages(id uuid primary key default gen_random_uuid(),name text not null,slug text unique not null,duration_days integer,duration_nights integer,base_price numeric(12,2),description text,active boolean default true);
create table if not exists bookings(id uuid primary key default gen_random_uuid(),booking_code text unique not null,customer_name text not null,mobile text not null,email text,from_city text default 'Haridwar',destination text not null,travel_date date,return_date date,passengers integer,vehicle_id uuid references vehicles(id),driver_id uuid references drivers(id),distance_km integer,base_fare numeric(12,2),driver_charge numeric(12,2),toll numeric(12,2),parking numeric(12,2),discount numeric(12,2) default 0,total_fare numeric(12,2),advance_paid numeric(12,2) default 0,status text default 'pending',payment_status text default 'unpaid',notes text,created_at timestamptz default now());
create table if not exists vehicle_availability(id uuid primary key default gen_random_uuid(),vehicle_id uuid references vehicles(id) on delete cascade,blocked_from date,blocked_to date,reason text);
create table if not exists reviews(id uuid primary key default gen_random_uuid(),customer_name text,rating integer check(rating between 1 and 5),review text,approved boolean default false,created_at timestamptz default now());
create index if not exists bookings_date_idx on bookings(travel_date); create index if not exists bookings_status_idx on bookings(status); create index if not exists vehicles_active_idx on vehicles(active);
-- Smart vehicle catalogue fields used by the India-wide autocomplete.
alter table vehicles add column if not exists manufacturer text;
alter table vehicles add column if not exists model text;
alter table vehicles add column if not exists full_name text;
alter table vehicles add column if not exists category text;
alter table vehicles add column if not exists fuel_type text;
alter table vehicles add column if not exists transmission text;
alter table vehicles add column if not exists luggage_capacity text;
alter table vehicles add column if not exists minimum_booking_rate numeric(12,2) default 0;
create index if not exists vehicles_full_name_idx on vehicles(full_name);
create index if not exists vehicles_category_idx on vehicles(category);

insert into vehicles(name,type,seats,rate_per_km,base_fare,active,manufacturer,model,full_name,category,fuel_type,transmission,luggage_capacity,minimum_booking_rate)
select 'Force Traveller N 3350WB','Tempo Traveller',12,35,0,true,'Force','Traveller N 3350WB','Force Traveller N 3350WB — 12 Seater','Tempo Traveller','Diesel','Manual','Standard',5000
where not exists(select 1 from vehicles where full_name='Force Traveller N 3350WB — 12 Seater');
insert into vehicles(name,type,seats,rate_per_km,base_fare,active,manufacturer,model,full_name,category,fuel_type,transmission,luggage_capacity,minimum_booking_rate)
select 'Force Traveller N 3700WB','Tempo Traveller',17,40,0,true,'Force','Traveller N 3700WB','Force Traveller N 3700WB — 17 Seater','Tempo Traveller','Diesel','Manual','Standard',6500
where not exists(select 1 from vehicles where full_name='Force Traveller N 3700WB — 17 Seater');
insert into vehicles(name,type,seats,rate_per_km,base_fare,active,manufacturer,model,full_name,category,fuel_type,transmission,luggage_capacity,minimum_booking_rate)
select 'Force Traveller N 4020WB','Tempo Traveller',16,38,0,true,'Force','Traveller N 4020WB','Force Traveller N 4020WB — 16 Seater','Tempo Traveller','Diesel','Manual','Standard',6000
where not exists(select 1 from vehicles where full_name='Force Traveller N 4020WB — 16 Seater');
insert into vehicles(name,type,seats,rate_per_km,base_fare,active,manufacturer,model,full_name,category,fuel_type,transmission,luggage_capacity,minimum_booking_rate)
select 'Force Urbania DX 3615WB','Luxury Traveller',12,52,0,true,'Force','Urbania DX 3615WB','Force Urbania DX 3615WB — 12 Seater','Luxury Traveller','Diesel','Manual','Large',9000
where not exists(select 1 from vehicles where full_name='Force Urbania DX 3615WB — 12 Seater');
insert into vehicles(name,type,seats,rate_per_km,base_fare,active,manufacturer,model,full_name,category,fuel_type,transmission,luggage_capacity,minimum_booking_rate)
select 'Toyota Innova Crysta','Innova Crysta',8,27,0,true,'Toyota','Innova Crysta','Toyota Innova Crysta — 7/8 Seater','Innova Crysta','Diesel','Manual','Standard',4500
where not exists(select 1 from vehicles where full_name='Toyota Innova Crysta — 7/8 Seater');
insert into vehicles(name,type,seats,rate_per_km,base_fare,active,manufacturer,model,full_name,category,fuel_type,transmission,luggage_capacity,minimum_booking_rate)
select 'Toyota Innova HyCross','Innova',8,30,0,true,'Toyota','Innova HyCross','Toyota Innova HyCross — 7/8 Seater','Innova','Petrol / Hybrid','Automatic','Standard',5000
where not exists(select 1 from vehicles where full_name='Toyota Innova HyCross — 7/8 Seater');
insert into vehicles(name,type,seats,rate_per_km,base_fare,active,manufacturer,model,full_name,category,fuel_type,transmission,luggage_capacity,minimum_booking_rate)
select 'Mahindra Scorpio-N','SUV',7,30,0,true,'Mahindra','Scorpio-N','Mahindra Scorpio-N — 7 Seater','Premium SUV','Petrol / Diesel','Manual / Automatic','Standard',5000
where not exists(select 1 from vehicles where full_name='Mahindra Scorpio-N — 7 Seater');
insert into vehicles(name,type,seats,rate_per_km,base_fare,active,manufacturer,model,full_name,category,fuel_type,transmission,luggage_capacity,minimum_booking_rate)
select 'Mahindra XUV 7XO','SUV',7,32,0,true,'Mahindra','XUV 7XO','Mahindra XUV 7XO — 7 Seater','Premium SUV','Petrol / Diesel','Manual / Automatic','Standard',5500
where not exists(select 1 from vehicles where full_name='Mahindra XUV 7XO — 7 Seater');
insert into vehicles(name,type,seats,rate_per_km,base_fare,active,manufacturer,model,full_name,category,fuel_type,transmission,luggage_capacity,minimum_booking_rate)
select 'Mahindra XUV 3XO','SUV',5,22,0,true,'Mahindra','XUV 3XO','Mahindra XUV 3XO — 5 Seater','SUV','Petrol / Diesel / EV','Manual / Automatic','Standard',4000
where not exists(select 1 from vehicles where full_name='Mahindra XUV 3XO — 5 Seater');
