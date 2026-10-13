import { pgTable, text, timestamp, integer, serial, numeric, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// --- Users ---
export const usersTable = pgTable("users", {
  id: text("id").primaryKey(), // Supabase auth.users UUID or custom ID
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  avatar: text("avatar"),
  activeAccount: text("active_account").notNull().default("shipper"), // 'shipper' | 'carrier'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(usersTable);
export const selectUserSchema = createSelectSchema(usersTable);
export type User = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;

// --- Carrier Profiles (KYC & Véhicules) ---
export const carrierProfilesTable = pgTable("carrier_profiles", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("pending"), // 'pending' | 'corrections' | 'approved' | 'rejected'
  rating: numeric("rating").default("5.0").notNull(),
  missionCount: integer("mission_count").default(0).notNull(),
  vehicleType: text("vehicle_type"),
  vehiclePlate: text("vehicle_plate"),
  idCardUrl: text("id_card_url"),
  licenseUrl: text("license_url"),
  insuranceUrl: text("insurance_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCarrierProfileSchema = createInsertSchema(carrierProfilesTable);
export const selectCarrierProfileSchema = createSelectSchema(carrierProfilesTable);
export type CarrierProfile = typeof carrierProfilesTable.$inferSelect;

// --- Freights (Annonces de Fret / Expéditions) ---
export const freightsTable = pgTable("freights", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull().references(() => usersTable.id),
  ownerName: text("owner_name").notNull(),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  cargo: text("cargo").notNull(),
  weight: integer("weight").notNull(), // en kg
  distance: integer("distance").notNull(), // en km
  budget: integer("budget").notNull(), // en FCFA
  status: text("status").notNull().default("published"), // 'published' | 'offers_received' | 'carrier_selected' | 'in_transit' | 'delivered' | 'cancelled'
  vehicleType: text("vehicle_type").notNull(),
  offersCount: integer("offers_count").default(0).notNull(),
  date: text("date").notNull(),
  deliveryCode: text("delivery_code"),
  selectedCarrierId: text("selected_carrier_id").references(() => usersTable.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertFreightSchema = createInsertSchema(freightsTable);
export const selectFreightSchema = createSelectSchema(freightsTable);
export type Freight = typeof freightsTable.$inferSelect;

// --- Offers (Offres de transport soumises par les transporteurs) ---
export const offersTable = pgTable("offers", {
  id: text("id").primaryKey(),
  freightId: text("freight_id").notNull().references(() => freightsTable.id, { onDelete: "cascade" }),
  carrierId: text("carrier_id").notNull().references(() => usersTable.id),
  carrierName: text("carrier_name").notNull(),
  amount: integer("amount").notNull(), // en FCFA
  status: text("status").notNull().default("pending"), // 'pending' | 'accepted' | 'rejected'
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOfferSchema = createInsertSchema(offersTable);
export const selectOfferSchema = createSelectSchema(offersTable);
export type Offer = typeof offersTable.$inferSelect;

// --- Wallets & Transactions ---
export const walletsTable = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  accountType: text("account_type").notNull(), // 'shipper' | 'carrier'
  balance: integer("balance").default(0).notNull(), // en FCFA
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const transactionsTable = pgTable("transactions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  walletType: text("wallet_type").notNull().default("shipper"), // 'shipper' | 'carrier'
  type: text("type").notNull(), // 'credit' | 'debit' | 'commission'
  amount: integer("amount").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("completed"), // 'completed' | 'pending'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTransactionSchema = createInsertSchema(transactionsTable);
export const selectTransactionSchema = createSelectSchema(transactionsTable);
export type Transaction = typeof transactionsTable.$inferSelect;

// --- Messages & Conversations ---
export const messagesTable = pgTable("messages", {
  id: text("id").primaryKey(),
  freightId: text("freight_id").notNull().references(() => freightsTable.id),
  senderId: text("sender_id").notNull().references(() => usersTable.id),
  receiverId: text("receiver_id").notNull().references(() => usersTable.id),
  content: text("content").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMessageSchema = createInsertSchema(messagesTable);
export const selectMessageSchema = createSelectSchema(messagesTable);
export type Message = typeof messagesTable.$inferSelect;

// --- Notifications ---
export const notificationsTable = pgTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'offer' | 'accepted' | 'rejected' | 'kyc' | 'payment' | 'delivery' | 'message'
  title: text("title").notNull(),
  body: text("body").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNotificationSchema = createInsertSchema(notificationsTable);
export const selectNotificationSchema = createSelectSchema(notificationsTable);
export type Notification = typeof notificationsTable.$inferSelect;