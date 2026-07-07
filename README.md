# Hoodwood

Warehouse administration website built with Next.js App Router, TypeScript, Tailwind CSS, Prisma SQLite, and NextAuth credentials authentication.

## Features
- Dashboard with KPI cards, charts, and recent orders
- Supplier, seller, product, order, invoice, stock history, and reports modules
- Protected dashboard routes with NextAuth login
- Prisma SQLite database with seed data
- Barcode-enabled printable invoice and order letter views
- Bulk invoice printing workflow

## Tech Stack
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui-style components
- Prisma ORM + SQLite
- NextAuth.js credentials provider
- Recharts, react-barcode, react-to-print

## Getting Started
```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

Open http://localhost:3000 and sign in with:
- admin@hoodwood.com / admin123
- staff@hoodwood.com / staff123

## Scripts
- `npm run dev` - start development server
- `npm run build` - production build
- `npm run start` - start production server
- `npm run lint` - run ESLint

## Environment
Copy `.env.example` to `.env` and adjust values as needed.
