# Project Brief: Aurora Hotel

## Overview
A production-ready, mobile-first direct hotel booking platform for Aurora Hotel in Vietnam, combining a public bilingual website, real booking engine, customer accounts, hotel operations, day-level inventory and pricing, sandbox payments, transactional notifications, reporting, and foundations for future multi-hotel and OTA integrations.

## Problem Statement
Aurora Hotel needs to receive direct reservations without phone calls, show accurate daily availability and prices, prevent overbooking, sell add-on services, coordinate reception and housekeeping operations, and reduce dependence on OTAs while measuring revenue and occupancy.

## Primary Outcome
Increase completed direct room bookings through a fast, transparent, trustworthy mobile-first booking flow while keeping day-level price and availability accurate and preventing overbooking.

## Target Users
- Guest
- Customer
- Receptionist
- Housekeeping staff
- Manager
- Admin

## Core Journeys
- Search availability from the homepage
- Select rooms and rate plans
- Enter guest details and add services
- Choose payment and confirm booking
- Look up, manage, pay, or cancel a booking
- Customer reviews upcoming and past stays
- Receptionist creates bookings and completes check-in/check-out
- Manager updates rates, restrictions, promotions, and inventory
- Housekeeping updates room readiness
- Admin manages access, integrations, settings, audit logs, and reports

## Prioritized Scope
### P0
- Bilingual public hotel website
- Availability search with day-level pricing and inventory
- Atomic booking engine with expiring holds and overbooking protection
- Three-step multi-room booking flow
- Guest checkout and booking lookup
- Customer accounts
- Receptionist and manager operations
- Room, rate plan, inventory, promotion, service, payment, and refund management
- Housekeeping status workflow
- Mock or sandbox payments with provider abstraction
- Transactional email
- RBAC and audit logs
- Basic occupancy and revenue reports
- PostgreSQL migrations and repeatable demo seed
- Automated unit, integration, concurrency, and E2E tests
- Architecture, ERD, API, security, operations, and deployment documentation
### P1
- Google OAuth-ready account structure
- Wishlists and verified post-stay reviews
- Advanced room rack and bulk rate/inventory editing
- Partial deposits and remaining-balance payments
- Invoice and printable booking confirmation
- Newsletter and basic marketing content management
### P2
- Real OTA and channel-manager integration
- Multi-hotel chain operations
- Loyalty and membership program
- Advanced revenue management
- Native mobile application
- Production AI capabilities

## Out of Scope
- Real Booking.com, Agoda, SiteMinder, or other channel-manager connection in MVP
- Mandatory Docker dependency
- Storage of raw card data
- Unverified production payment provider activation
- Copied branding, content, imagery, or visual identity from other hotel and OTA websites
