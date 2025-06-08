// Custom cookie store implementation for Bun
class CookieStore {
  private cookies: Map<string, string> = new Map();

  // Set a cookie
  set(name: string, value: string, options?: { expires?: Date; path?: string; domain?: string; secure?: boolean }) {
    console.log(`Setting cookie: ${name}=${value}`);
    this.cookies.set(name, value);
    console.log('Current cookies:', this.getAll());
  }

  // Get a cookie
  get(name: string): string | undefined {
    const value = this.cookies.get(name);
    console.log(`Getting cookie ${name}:`, value);
    return value;
  }

  // Remove a cookie
  remove(name: string) {
    console.log(`Removing cookie: ${name}`);
    this.cookies.delete(name);
  }

  // Get all cookies as a string (for debugging)
  getAll(): string {
    const cookies = Array.from(this.cookies.entries())
      .map(([name, value]) => `${name}=${value}`)
      .join('; ');
    console.log('All cookies:', cookies);
    return cookies;
  }
}

// Create a global cookie store instance
export const cookieStore = new CookieStore();

// Mock document.cookie for Bun environment
if (typeof global !== 'undefined') {
  (global as any).document = {
    get cookie() {
      const cookies = cookieStore.getAll();
      console.log('document.cookie getter called, returning:', cookies);
      return cookies;
    },
    set cookie(value: string) {
      console.log('document.cookie setter called with:', value);
      const [cookie] = value.split(';');
      const [name, val] = cookie.split('=');
      if (name && val) {
        cookieStore.set(name.trim(), val.trim());
      }
    },
  };
} 