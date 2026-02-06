// Shared validation utilities for edge functions

// Device ID format: device_{timestamp}_{random9chars}
const DEVICE_ID_PATTERN = /^device_\d+_[a-z0-9]{9}$/;

export function validateDeviceId(deviceId: string | null | undefined): { valid: boolean; error?: string } {
  if (!deviceId || typeof deviceId !== 'string') {
    return { valid: false, error: 'Device ID is required' };
  }
  if (!DEVICE_ID_PATTERN.test(deviceId)) {
    return { valid: false, error: 'Invalid device ID format' };
  }
  return { valid: true };
}

export function extractDeviceId(req: Request): string | null {
  // First try header (preferred for security)
  const headerDeviceId = req.headers.get('x-device-id');
  if (headerDeviceId) return headerDeviceId;
  return null;
}

// Validate base64 image data
export function validateImageBase64(imageBase64: string | null | undefined): { valid: boolean; error?: string } {
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return { valid: false, error: 'Image data is required' };
  }
  
  // Check size (max 10MB base64 ~ 13.3MB string)
  const maxSize = 15 * 1024 * 1024; // 15MB string limit
  if (imageBase64.length > maxSize) {
    return { valid: false, error: 'Image too large (max 10MB)' };
  }
  
  // Validate base64 image format
  if (!/^data:image\/(jpeg|jpg|png|webp|gif);base64,/.test(imageBase64)) {
    return { valid: false, error: 'Invalid image format. Supported: JPEG, PNG, WebP, GIF' };
  }
  
  return { valid: true };
}

// Validate email format
export function validateEmail(email: string | null | undefined): { valid: boolean; error?: string } {
  if (!email) {
    return { valid: true }; // Email is optional
  }
  if (typeof email !== 'string') {
    return { valid: false, error: 'Invalid email format' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email) || email.length > 255) {
    return { valid: false, error: 'Invalid email format' };
  }
  return { valid: true };
}

// Validate chat messages array
export function validateMessages(messages: unknown): { valid: boolean; error?: string; sanitized?: Array<{ role: string; content: string }> } {
  if (!messages || !Array.isArray(messages)) {
    return { valid: false, error: 'Messages array is required' };
  }
  
  // Limit message count
  const maxMessages = 50;
  if (messages.length > maxMessages) {
    return { valid: false, error: `Too many messages (max ${maxMessages})` };
  }
  
  // Validate and sanitize each message
  const sanitized: Array<{ role: string; content: string }> = [];
  const maxContentLength = 2000;
  
  for (const msg of messages) {
    if (!msg || typeof msg !== 'object') {
      return { valid: false, error: 'Invalid message format' };
    }
    
    const { role, content } = msg as { role?: unknown; content?: unknown };
    
    if (role !== 'user' && role !== 'assistant') {
      return { valid: false, error: 'Invalid message role' };
    }
    
    if (typeof content !== 'string') {
      return { valid: false, error: 'Message content must be a string' };
    }
    
    if (content.length > maxContentLength) {
      return { valid: false, error: `Message too long (max ${maxContentLength} characters)` };
    }
    
    // Sanitize content - remove potential injection patterns
    const sanitizedContent = sanitizeForPrompt(content);
    sanitized.push({ role, content: sanitizedContent });
  }
  
  return { valid: true, sanitized };
}

// Sanitize user input before passing to AI prompts
export function sanitizeForPrompt(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/\n{3,}/g, '\n\n') // Limit consecutive newlines
    .trim();
}

// Validate name for numerology
export function validateName(name: string | null | undefined): { valid: boolean; error?: string; sanitized?: string } {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Name is required' };
  }
  
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Name cannot be empty' };
  }
  
  if (trimmed.length > 100) {
    return { valid: false, error: 'Name too long (max 100 characters)' };
  }
  
  // Only allow letters, spaces, hyphens, and apostrophes
  if (!/^[a-zA-Z\s\-']+$/.test(trimmed)) {
    return { valid: false, error: 'Name contains invalid characters' };
  }
  
  return { valid: true, sanitized: trimmed };
}

// Validate birthdate
export function validateBirthdate(birthdate: string | null | undefined): { valid: boolean; error?: string } {
  if (!birthdate || typeof birthdate !== 'string') {
    return { valid: false, error: 'Birthdate is required' };
  }
  
  // Validate format YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthdate)) {
    return { valid: false, error: 'Invalid birthdate format (use YYYY-MM-DD)' };
  }
  
  // Validate it's a real date
  const date = new Date(birthdate);
  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Invalid birthdate' };
  }
  
  // Must be in the past
  if (date > new Date()) {
    return { valid: false, error: 'Birthdate must be in the past' };
  }
  
  // Reasonable range (1900-today)
  if (date.getFullYear() < 1900) {
    return { valid: false, error: 'Invalid birthdate year' };
  }
  
  return { valid: true };
}

// Validate entity sketch request
export function validateEntitySketchRequest(data: {
  entityType?: unknown;
  entityDescription?: unknown;
  intent?: unknown;
  powerLevel?: unknown;
}): { valid: boolean; error?: string; sanitized?: { entityType: string; entityDescription?: string; intent?: string; powerLevel?: string } } {
  const { entityType, entityDescription, intent, powerLevel } = data;
  
  if (!entityType || typeof entityType !== 'string') {
    return { valid: false, error: 'Entity type is required' };
  }
  
  if (entityType.length > 100) {
    return { valid: false, error: 'Entity type too long' };
  }
  
  const result: { entityType: string; entityDescription?: string; intent?: string; powerLevel?: string } = {
    entityType: sanitizeForPrompt(entityType).substring(0, 100),
  };
  
  if (entityDescription && typeof entityDescription === 'string') {
    result.entityDescription = sanitizeForPrompt(entityDescription).substring(0, 500);
  }
  
  if (intent && typeof intent === 'string') {
    result.intent = sanitizeForPrompt(intent).substring(0, 50);
  }
  
  if (powerLevel && typeof powerLevel === 'string') {
    result.powerLevel = sanitizeForPrompt(powerLevel).substring(0, 50);
  }
  
  return { valid: true, sanitized: result };
}

// Create standardized error response
export function createErrorResponse(message: string, status: number, corsHeaders: Record<string, string>): Response {
  return new Response(
    JSON.stringify({ error: message }),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
