
/**
 * Capacitor Plugin Type Definitions for ActionUnitManager
 * 
 * This file provides TypeScript definitions for Capacitor plugins
 * to ensure type safety and better development experience.
 * 
 * Types are organized by plugin for better maintainability.
 */

/**
 * Network plugin types
 * Defines network connectivity status and connection types
 * 
 * Note: Using string union types for better type safety and IntelliSense
 */
export interface NetworkStatus {
  connected: boolean;
  connectionType: 'wifi' | 'cellular' | 'none' | 'unknown';
}

/**
 * Connection status from Capacitor Network plugin
 * Uses string type to match the actual plugin return type
 */
export interface ConnectionStatus {
  connected: boolean;
  connectionType: string; // Changed from union type to string
}

/**
 * Preferences plugin types  
 * Defines local storage operations for app preferences
 */
export interface PreferencesPlugin {
  set(options: { key: string; value: string }): Promise<void>;
  get(options: { key: string }): Promise<{ value: string | null }>;
  remove(options: { key: string }): Promise<void>;
  clear(): Promise<void>;
  keys(): Promise<{ keys: string[] }>;
}

/**
 * App plugin types
 * Defines app lifecycle and state management
 */
export interface AppState {
  isActive: boolean;
}

/**
 * Common response interface for plugin operations
 */
export interface PluginResponse {
  success: boolean;
  message?: string;
  data?: any;
}