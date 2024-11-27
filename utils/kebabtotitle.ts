export function kebabToTitle(kebab: string): string {
    return kebab
      .split('-') // Split the kebab-case string into words
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
      .join(' '); // Join the words with a space
  }