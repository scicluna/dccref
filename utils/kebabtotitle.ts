export function kebabToTitle(kebab: string): string {
  if (!kebab){
    return 'error'
  }
    return kebab
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }