type NavigationPressEvent = {
  preventDefault: () => void;
  defaultPrevented?: boolean;
  button?: number;
  metaKey?: boolean;
  altKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  currentTarget?: unknown;
};

export function handleNavigationPress<T extends NavigationPressEvent>(event:T, navigate:((event:T)=>void)|undefined, web:boolean, href?:string|null) {
  if(event.defaultPrevented)return;
  if(web && href) {
    const target=event.currentTarget && typeof event.currentTarget === 'object' && 'target' in event.currentTarget ? event.currentTarget.target : undefined;
    const modifier=event.metaKey || event.altKey || event.ctrlKey || event.shiftKey;
    const primary=event.button == null || event.button === 0;
    const sameWindow=target == null || target === '' || target === '_self' || target === 'self';
    if(modifier || !primary || !sameWindow)return;
    event.preventDefault();
  }
  navigate?.(event);
}
