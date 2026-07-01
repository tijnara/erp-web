# ERP Web Application

A modern web frontend for the ERP (Enterprise Resource Planning) system built with Next.js, React, and TypeScript. This repository contains multiple ERP web applications with modular architecture and comprehensive feature set.

## Overview

This project contains:
- **vos-erp**: Main ERP application with advanced features including document generation (PDF/Excel export), role-based access control, and data management
- **divi**: Secondary frontend application with authentication and core ERP functionality

## Features

- 🔐 **Authentication & Authorization**: NextAuth.js integration with role-based access control
- 📊 **Data Management**: TanStack React Table for advanced data operations
- 📄 **Document Export**: PDF and Excel export capabilities (jsPDF, XLSX)
- 🎨 **Modern UI**: Radix UI components with Tailwind CSS styling
- 🌙 **Dark Mode Support**: Next Themes integration
- 📝 **Form Handling**: React Hook Form with Zod validation
- 🔐 **Security**: bcryptjs and argon2 for password hashing, JWT tokens (jose)
- 💾 **Database**: Supabase integration for backend services
- 📱 **Responsive Design**: Mobile-first approach with Tailwind CSS

## Tech Stack

### Frontend
- **Framework**: [Next.js](https://nextjs.org) (latest)
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: Tailwind CSS with animations
- **Component Library**: Radix UI

### Form & Validation
- React Hook Form
- Zod schema validation
- React Select for dropdowns

### State Management
- Zustand for global state

### Backend & Database
- Supabase (PostgreSQL)
- NextAuth.js for authentication

### Development Tools
- ESLint for code quality
- TypeScript for type safety
- PostCSS for CSS processing

## Prerequisites

- **Node.js**: >= 18
- **Package Manager**: npm, yarn, or pnpm
- **Supabase Account**: For database and authentication

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/tijnara/erp-web.git
   cd erp-web
