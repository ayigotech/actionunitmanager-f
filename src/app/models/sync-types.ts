// src/app/models/sync-types.ts
/**
 * Data Models for ActionUnitManager - Matches Django Backend
 * 
 * These interfaces exactly mirror your Django models for seamless
 * synchronization between mobile app and backend database.
 */

/**
 * Base interface for all storable entities
 * Provides common properties for sync and conflict resolution
 */
export interface StorableEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  lastSynced?: Date;
  isDirty?: boolean; // Flag for pending sync
  syncStatus?: 'pending' | 'synced' | 'failed'; // Sync state
}

/**
 * Church - Main organization entity
 * Mirrors: actionunit.models.Church
 */
export interface Church extends StorableEntity {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  district?: string;
  country: string;
  denomination: string;
  // Django auto-fields mapped
  created_at: Date;
  updated_at: Date;
}

/**
 * User - Custom user model
 * Mirrors: actionunit.models.CustomUser
 */
export interface User extends StorableEntity {
  username: string;
  email: string;
  name: string;
  role: 'superintendent' | 'teacher' | 'member' | 'system_admin';
  church?: string; // Church ID (FK)
  phone?: string;
  is_officer: boolean;
  is_active: boolean;
  is_superuser: boolean;
  // Django auth fields
  last_login?: Date;
  date_joined: Date;
}

/**
 * Subscription - Church subscription management
 * Mirrors: actionunit.models.Subscription
 */
export interface Subscription extends StorableEntity {
  church: string; // Church ID (FK)
  plan: 'free_trial' | 'monthly' | 'annual';
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid';
  trial_end_date: Date;
  current_period_end: Date;
  grace_period_end?: Date;
  created_at: Date;
  updated_at: Date;
}

/**
 * Action Unit Class - Sabbath School Classes
 * Mirrors: actionunit.models.ActionUnitClass
 */
export interface ActionUnitClass extends StorableEntity {
  church: string; // Church ID (FK)
  name: string;
  location?: string;
  meeting_time?: string; // Time as string "HH:MM:SS"
  description?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Class Teacher Assignment
 * Mirrors: actionunit.models.ClassTeacher
 */
export interface ClassTeacher extends StorableEntity {
  action_unit_class: string; // ActionUnitClass ID (FK)
  teacher: string; // User ID (FK)
  assigned_date: Date;
  is_active: boolean;
}

/**
 * Class Membership
 * Mirrors: actionunit.models.ClassMember
 */
export interface ClassMember extends StorableEntity {
  action_unit_class: string; // ActionUnitClass ID (FK)
  user: string; // User ID (FK)
  location?: string;
  joined_date: Date;
  is_active: boolean;
}

/**
 * Attendance Records
 * Mirrors: actionunit.models.Attendance
 */
export interface Attendance extends StorableEntity {
  class_member: string; // ClassMember ID (FK)
  date: Date;
  is_present: boolean;
  absence_reason?: 'sick' | 'traveling' | 'work' | 'family_emergency' | 'unknown' | 'other';
  marked_by: string; // User ID (FK)
  marked_at: Date;
}

/**
 * Offering Contributions
 * Mirrors: actionunit.models.Offering
 */
export interface Offering extends StorableEntity {
  action_unit_class: string; // ActionUnitClass ID (FK)
  amount: number; // Decimal as number
  currency: 'GHS' | 'USD';
  date: Date;
  recorded_by: string; // User ID (FK)
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Quarterly Books
 * Mirrors: actionunit.models.QuarterlyBook
 */
export interface QuarterlyBook extends StorableEntity {
  church: string; // Church ID (FK)
  title: string;
  price: number; // Decimal as number
  currency: 'GHS' | 'USD';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Book Orders
 * Mirrors: actionunit.models.BookOrder
 */
export interface BookOrder extends StorableEntity {
  action_unit_class: string; // ActionUnitClass ID (FK)
  quarter: 'Q1-Q2' | 'Q3-Q4';
  year: number;
  total_amount: number; // Decimal as number
  status: 'draft' | 'submitted' | 'approved';
  submitted_by: string; // User ID (FK)
  submitted_date?: Date;
  created_at: Date;
  updated_at: Date;
}

/**
 * Order Items
 * Mirrors: actionunit.models.OrderItem
 */
export interface OrderItem extends StorableEntity {
  book_order: string; // BookOrder ID (FK)
  quarterly_book: string; // QuarterlyBook ID (FK)
  quantity: number;
  unit_price: number; // Decimal as number
  total_price: number; // Decimal as number
}

/**
 * Main user data container for offline storage
 * Groups all user-related data for efficient syncing
 */
export interface UserData extends StorableEntity {
  userId: string;
  church?: Church;
  userProfile: User;
  actionUnitClasses: ActionUnitClass[];
  classMemberships: ClassMember[];
  teachingAssignments: ClassTeacher[];
  markedAttendances: Attendance[];
  recordedOfferings: Offering[];
  submittedOrders: BookOrder[];
  // Add other collections as needed
}

/**
 * Sync operation types for queue management
 */
export interface SyncOperation {
  id: string;
  entityType: 
    | 'church' 
    | 'user' 
    | 'subscription'
    | 'action_unit_class'
    | 'class_teacher' 
    | 'class_member'
    | 'attendance'
    | 'offering'
    | 'quarterly_book'
    | 'book_order'
    | 'order_item';
  entityId: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  localData: any;
  timestamp: Date;
  retryCount: number;
  lastError?: string;
}

/**
 * Storage configuration
 */
export interface StorageConfig {
  userDataKey: string;
  syncQueueKey: string;
  appSettingsKey: string;
  lastSyncKey: string;
  // Entity-specific keys for individual collections
  churchesKey: string;
  usersKey: string;
  classesKey: string;
  attendanceKey: string;
  offeringsKey: string;
  booksKey: string;
  ordersKey: string;
}

/**
 * Sync results and status
 */
export interface SyncResult {
  success: boolean;
  syncedItems: number;
  failedItems: number;
  errors: string[];
  timestamp: Date;
  entityType?: string;
}

/**
 * Storage statistics
 */
export interface StorageStats {
  totalUserData: number;
  pendingSyncOperations: number;
  lastSuccessfulSync?: Date;
  storageSize: number;
  entitiesCount: {
    churches: number;
    users: number;
    classes: number;
    attendance: number;
    offerings: number;
    books: number;
    orders: number;
  };
}