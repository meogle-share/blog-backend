# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NestJS 11 backend application using Domain-Driven Design (DDD) with CQRS pattern. PostgreSQL database with TypeORM.

## Commands

### Development
```bash
npm run start:dev          # Development mode with hot reload
npm run start:debug        # Debug mode with watch
```

### Build & Quality
```bash
npm run build              # Compile TypeScript
npm run lint               # ESLint with auto-fix
npm run format             # Prettier formatting
npm run typecheck          # Type checking without emit
```

### Testing
```bash
npm run test:unit          # Unit tests
npm run test:int           # Integration tests
npm run test:e2e           # End-to-end tests
```

### Database Migrations
```bash
npm run migration:generate # Auto-generate from entity changes
npm run migration:run      # Apply pending migrations
npm run migration:show     # Show migration status
npm run migration:revert   # Undo last migration
```

## Architecture

### Directory Structure
```
src/
├── configs/              # Environment & database configuration
├── libs/                 # Shared DDD base classes & utilities
│   └── ddd/             # AggregateRoot, Entity, ValueObject, Mapper
├── common/              # Cross-cutting concerns (migrations, health, CLI)
└── modules/             # Feature modules by domain
    ├── content/         # Content management (posts)
    └── iam/             # Identity & Access Management (auth, users)
```

### Module Structure (Vertical Slicing)
Each domain module follows this layered structure:
- **domain/** - Aggregates, entities, value objects, repository interfaces
- **application/** - CQRS commands, queries, handlers, use cases
- **infrastructure/** - TypeORM models, repository implementations, mappers
- **presentation/** - HTTP controllers, request/response DTOs

### Key Patterns
- **CQRS**: Commands for writes, Queries for reads via @nestjs/cqrs
- **Repository Pattern**: Interfaces in domain, implementations in infrastructure
- **Data Mapper**: Converts between domain aggregates and TypeORM models
- **Domain Events**: Published through NestJS EventEmitter2

## File Naming Conventions

| Suffix | Purpose |
|--------|---------|
| `.aggregate.ts` | Aggregate roots |
| `.model.ts` | TypeORM database models |
| `.repository.interface.ts` | Repository contracts |
| `.repository.impl.ts` | Repository implementations |
| `.mapper.ts` | Domain ↔ DB model mappers |
| `.vo.ts` | Value objects |
| `.command.ts` / `.query.ts` | CQRS operations |
| `.handler.ts` | Command/query handlers |
| `.http.controller.ts` | HTTP controllers |
| `.request.dto.ts` / `.response.dto.ts` | API DTOs |

## Path Aliases

```typescript
@libs/*     → src/libs/*
@configs/*  → src/configs/*
@common/*   → src/common/*
@modules/*  → src/modules/*
@test/*     → test/*
```

## Code Guidelines

- Domain layer has no TypeORM decorators - it's persistence-agnostic
- Never access repositories directly from presentation layer - use application layer handlers
- Value objects are immutable with validation in constructors
- Use class-validator decorators on all DTOs
- Global validation pipe strips unknown properties and auto-transforms types
- API versioning is URI-based (e.g., `/v1/posts`)

## Environment

Required environment variables: `NODE_ENV`, `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`, `JWT_SECRET`

Environment files: `.env`, `.env.dev`, `.env.test`, `.env.migration`