# Jewellery Production & Inventory Management SaaS

## Product Requirements Document (PRD)

## 1. Project Overview

Build a modern SaaS platform for small jewellery/chain manufacturing
businesses to manage their complete production workflow, inventory,
labour tracking, finishing process, sales, and reports.

The application is designed for **business owners only**. Labourers and
finishing vendors do not log in.

------------------------------------------------------------------------

## 2. Goals

-   Replace paper registers and Excel sheets.
-   Track complete production lifecycle.
-   Support multiple businesses (multi-tenant).
-   Provide analytics and reports.
-   Be production-ready and scalable.

------------------------------------------------------------------------

# 3. Tech Stack

-   Next.js (App Router)
-   TypeScript
-   Tailwind CSS
-   shadcn/ui
-   Prisma ORM
-   PostgreSQL (Neon)
-   Auth.js
-   React Hook Form
-   Zod
-   Recharts
-   TanStack Table
-   Sonner

------------------------------------------------------------------------

# 4. Multi-Tenant Architecture

Each business owner registers an account.

Every record belongs to exactly one user.

Every table contains:

-   userId

No user can access another business's data.

------------------------------------------------------------------------

# 5. User Flow

## Registration

-   Business Name
-   Owner Name
-   Email
-   Phone
-   Password

↓

## Initial Setup Wizard

↓

## Dashboard

------------------------------------------------------------------------

# 6. Initial Setup Wizard

## Step 1

Business Information

-   Business Name
-   Logo (optional)
-   Address (optional)

## Step 2

Opening Inventory

### Raw Kanni

-   OT (kg)
-   Medium (kg)

### Finished Chains

-   OT
-   Medium

## Step 3

Labourers

For each labourer:

-   Name
-   Phone
-   OT Pending
-   Medium Pending
-   OT Rate
-   Medium Rate

## Step 4

Finishing Vendors

For each vendor:

-   Name
-   OT Pending
-   Medium Pending

## Step 5

Review

Save Opening Balance.

NOTE:

Never create fake historical transactions.

Opening balances become the starting point.

------------------------------------------------------------------------

# 7. Dashboard

Cards

-   Raw OT Stock
-   Raw Medium Stock
-   Finished OT
-   Finished Medium
-   Pending with Labourers
-   Pending for Finishing
-   Today's Sales
-   Monthly Revenue

Charts

-   Production Trend
-   Sales Trend
-   Inventory Movement

Widgets

-   Recent Transactions
-   Top Labourers
-   Low Stock Alerts
-   Quick Actions

------------------------------------------------------------------------

# 8. Sidebar

-   Dashboard
-   Inventory
-   Labourers
-   Finishing
-   Transactions
-   Sales
-   Reports
-   Settings

------------------------------------------------------------------------

# 9. Inventory Module

Track

Raw Material

-   OT
-   Medium

Finished Stock

Inventory Adjustments

Stock History

------------------------------------------------------------------------

# 10. Labour Module

CRUD

Fields

-   Name
-   Phone
-   OT Rate
-   Medium Rate

Statistics

-   Pending OT
-   Pending Medium
-   Total Given
-   Total Received
-   Payment History

------------------------------------------------------------------------

# 11. Finishing Module

CRUD

Track

-   Sent
-   Received
-   Pending

------------------------------------------------------------------------

# 12. Transactions

Supported Types

-   Raw Material Purchase
-   Give to Labourer
-   Receive from Labourer
-   Send to Finishing
-   Receive from Finishing
-   Sale
-   Inventory Adjustment

Every transaction automatically updates inventory.

------------------------------------------------------------------------

# 13. Sales

Store

-   Shop Name
-   Date
-   OT Quantity
-   Medium Quantity
-   Amount
-   Payment Status
-   Notes

------------------------------------------------------------------------

# 14. Reports

Generate

-   Daily
-   Weekly
-   Monthly
-   Yearly
-   Custom Date Range

Export

-   PDF
-   Excel

------------------------------------------------------------------------

# 15. Search & Filters

Support

-   Date Range
-   Labourer
-   Vendor
-   Transaction Type
-   Chain Type

------------------------------------------------------------------------

# 16. Database Entities

## User

Authentication

## Business

Business profile

## OpeningBalance

Initial inventory

## Labourer

Business labour records

## FinishingVendor

Finishing companies

## Transaction

All inventory movements

## InventoryAdjustment

Corrections

## Sale

Sales records

------------------------------------------------------------------------

# 17. Stock Calculation Rules

Current Stock =

Opening Balance

-   Purchases

-   Received From Labourers

-   Received From Finishing

− Given To Labourers

− Sent To Finishing

− Sales

± Adjustments

Never edit historical transactions.

------------------------------------------------------------------------

# 18. Settings

-   Business Profile
-   Logo
-   Password
-   Backup / Restore
-   Theme
-   Inventory Adjustment

------------------------------------------------------------------------

# 19. Non-Functional Requirements

-   Responsive UI
-   Secure Authentication
-   Fast Dashboard
-   Pagination
-   Search
-   Validation
-   Error Handling
-   Loading States
-   Audit-Friendly Data

------------------------------------------------------------------------

# 20. Folder Structure

``` text
src/
  app/
  components/
  actions/
  lib/
  hooks/
  prisma/
  types/
  middleware.ts
```

------------------------------------------------------------------------

# 21. Future Enhancements

-   Barcode Support
-   QR Codes
-   AI Business Insights
-   PWA
-   Email Reports
-   Subscription Billing
-   Mobile App

------------------------------------------------------------------------

# 22. Development Order

1.  Authentication
2.  Database Schema
3.  Initial Setup Wizard
4.  Dashboard
5.  Inventory
6.  Labour
7.  Finishing
8.  Transactions
9.  Sales
10. Reports
11. Settings
12. Polish UI
13. Testing
14. Deployment
